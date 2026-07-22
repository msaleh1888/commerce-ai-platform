from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from commerce_ai_api.modules.catalog_ingestion.infrastructure.persistence.models import (
    CatalogImportModel,
    ImportArtifactModel,
    ImportDispatchOutboxModel,
    ImportLifecycleAuditEventModel,
)
from commerce_ai_api.modules.catalog_ingestion.application.dtos import (
    ImportAuditEventViewDTO,
    PendingImportDispatchDTO,
)


class CatalogImportRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def add_reservation(
        self,
        *,
        import_id: str,
        tenant_id: str,
        source_id: str,
        original_filename: str,
        content_type: str,
        artifact_key: str,
        sha256: str,
        byte_size: int,
        operation_id: str,
        correlation_id: str,
    ) -> None:
        now = datetime.now(UTC)
        self._session.add(
            CatalogImportModel(
                id=import_id,
                tenant_id=tenant_id,
                source_id=source_id,
                original_filename=original_filename,
                content_type=content_type,
                artifact_key=artifact_key,
                sha256=sha256,
                byte_size=byte_size,
                accepted_count=0,
                rejected_count=0,
                status="created",
                operation_id=operation_id,
                correlation_id=correlation_id,
                created_at=now,
                updated_at=now,
            )
        )

    def get_processing_artifact(self, *, import_id: str, tenant_id: str) -> CatalogImportModel | None:
        return self._session.scalar(
            select(CatalogImportModel).where(CatalogImportModel.id == import_id, CatalogImportModel.tenant_id == tenant_id)
        )

    def mark_processing_once(self, *, import_id: str, tenant_id: str, actor_id: str) -> bool:
        stored_import = self.get_processing_artifact(import_id=import_id, tenant_id=tenant_id)
        if stored_import is None:
            raise ValueError("Import not found for tenant.")
        if stored_import.status == "completed":
            return False
        if stored_import.status == "processing":
            return True
        if stored_import.status != "queued":
            raise ValueError("Import is not queued.")

        now = datetime.now(UTC)
        stored_import.status = "processing"
        stored_import.updated_at = now
        self._session.add(
            ImportLifecycleAuditEventModel(
                id=f"import_audit_{uuid4().hex}",
                tenant_id=tenant_id,
                import_id=import_id,
                actor_id=actor_id,
                event_type="import_processing",
                from_status="queued",
                to_status="processing",
                message="Import processing started.",
                created_at=now,
            )
        )
        return True

    def mark_completed_once(self, *, import_id: str, tenant_id: str, actor_id: str, accepted_count: int) -> None:
        stored_import = self.get_processing_artifact(import_id=import_id, tenant_id=tenant_id)
        if stored_import is None:
            raise ValueError("Import not found for tenant.")
        if stored_import.status == "completed":
            return

        now = datetime.now(UTC)
        stored_import.status = "completed"
        stored_import.accepted_count = accepted_count
        stored_import.rejected_count = 0
        stored_import.updated_at = now
        self._session.add(
            ImportLifecycleAuditEventModel(
                id=f"import_audit_{uuid4().hex}",
                tenant_id=tenant_id,
                import_id=import_id,
                actor_id=actor_id,
                event_type="import_completed",
                from_status="processing",
                to_status="completed",
                message="Import processing completed.",
                created_at=now,
            )
        )

    def get_import(self, *, import_id: str, tenant_id: str) -> CatalogImportModel | None:
        return self.get_processing_artifact(import_id=import_id, tenant_id=tenant_id)

    def list_audit_events(self, *, import_id: str, tenant_id: str) -> tuple[ImportAuditEventViewDTO, ...]:
        events = self._session.scalars(
            select(ImportLifecycleAuditEventModel)
            .where(
                ImportLifecycleAuditEventModel.import_id == import_id,
                ImportLifecycleAuditEventModel.tenant_id == tenant_id,
            )
            .order_by(ImportLifecycleAuditEventModel.created_at)
        ).all()
        return tuple(
            ImportAuditEventViewDTO(
                event_type=event.event_type,
                from_status=event.from_status,
                to_status=event.to_status,
                message=event.message,
                created_at=event.created_at.isoformat(),
            )
            for event in events
        )

    def get_artifact_provider_version(self, *, import_id: str, tenant_id: str) -> str:
        artifact = self._session.scalar(
            select(ImportArtifactModel).where(
                ImportArtifactModel.import_id == import_id,
                ImportArtifactModel.tenant_id == tenant_id,
            )
        )
        if artifact is None:
            raise ValueError("Import artifact not found for tenant.")
        return artifact.provider_version_id

    def list_pending_dispatches(self, *, tenant_id: str) -> tuple[PendingImportDispatchDTO, ...]:
        records = self._session.scalars(
            select(ImportDispatchOutboxModel)
            .where(
                ImportDispatchOutboxModel.tenant_id == tenant_id,
                ImportDispatchOutboxModel.status == "pending",
            )
            .order_by(ImportDispatchOutboxModel.created_at)
        ).all()
        return tuple(
            PendingImportDispatchDTO(
                id=record.id,
                import_id=record.import_id,
                tenant_id=record.tenant_id,
                operation_id=record.operation_id,
                correlation_id=record.correlation_id,
            )
            for record in records
        )

    def mark_dispatch_dispatched(self, *, outbox_id: str, tenant_id: str) -> None:
        record = self._session.scalar(
            select(ImportDispatchOutboxModel).where(
                ImportDispatchOutboxModel.id == outbox_id,
                ImportDispatchOutboxModel.tenant_id == tenant_id,
            )
        )
        if record is None:
            raise ValueError("Import dispatch outbox record not found for tenant.")
        if record.status == "dispatched":
            return
        record.status = "dispatched"
        record.dispatched_at = datetime.now(UTC)
        self._session.flush()

    def mark_queued_with_artifact(
        self,
        *,
        import_id: str,
        tenant_id: str,
        actor_id: str,
        original_filename: str,
        content_type: str,
        artifact_key: str,
        provider_version_id: str,
        sha256: str,
        byte_size: int,
        operation_id: str,
        correlation_id: str,
    ) -> None:
        now = datetime.now(UTC)
        stored_import = self._session.get(CatalogImportModel, import_id)
        if stored_import is None or stored_import.tenant_id != tenant_id:
            raise ValueError("Import reservation not found for tenant.")

        stored_import.status = "queued"
        stored_import.updated_at = now
        self._session.add(
            ImportArtifactModel(
                id=f"artifact_{uuid4().hex}",
                tenant_id=tenant_id,
                import_id=import_id,
                storage_namespace="commerce-ai-import-artifacts",
                artifact_key=artifact_key,
                provider_version_id=provider_version_id,
                content_type=content_type,
                original_filename=original_filename,
                sha256=sha256,
                byte_size=byte_size,
                created_at=now,
            )
        )
        self._session.add(
            ImportLifecycleAuditEventModel(
                id=f"import_audit_{uuid4().hex}",
                tenant_id=tenant_id,
                import_id=import_id,
                actor_id=actor_id,
                event_type="import_queued",
                from_status="artifact_stored",
                to_status="queued",
                message="Import artifact stored and processing queued.",
                created_at=now,
            )
        )
        self._session.add(
            ImportDispatchOutboxModel(
                id=f"import_outbox_{uuid4().hex}",
                tenant_id=tenant_id,
                import_id=import_id,
                operation_id=operation_id,
                correlation_id=correlation_id,
                event_type="catalog_import_process_requested",
                status="pending",
                created_at=now,
                dispatched_at=None,
            )
        )
