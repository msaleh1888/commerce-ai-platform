from __future__ import annotations

import csv
import json
from decimal import Decimal
from hashlib import sha256
from io import StringIO
from typing import Protocol
from uuid import uuid4

from commerce_ai_api.db.session import SqlAlchemyUnitOfWork
from commerce_ai_api.modules.catalog.application.contracts import SupplierProductReader, SupplierProductWriter
from commerce_ai_api.modules.catalog.application.dtos import UpsertSupplierProductCommand
from commerce_ai_api.modules.catalog_ingestion.application.dtos import (
    CreateImportCommand,
    DispatchImportOutboxResultDTO,
    ImportCreatedDTO,
    ProcessImportCommand,
    ProcessImportResultDTO,
    ImportDetailDTO,
    PendingImportDispatchDTO,
)
from commerce_ai_api.modules.catalog_ingestion.application.errors import UnsupportedImportMediaTypeError
from commerce_ai_api.modules.catalog_ingestion.application.storage import ImportArtifactStorage


SUPPORTED_IMPORT_MEDIA_TYPES = frozenset({"text/csv", "application/json"})


class ImportRepository(Protocol):
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
        ...

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
        ...

    def get_processing_artifact(self, *, import_id: str, tenant_id: str):
        ...

    def mark_processing_once(self, *, import_id: str, tenant_id: str, actor_id: str) -> bool:
        ...

    def mark_completed_once(self, *, import_id: str, tenant_id: str, actor_id: str, accepted_count: int) -> None:
        ...

    def get_import(self, *, import_id: str, tenant_id: str):
        ...

    def list_audit_events(self, *, import_id: str, tenant_id: str):
        ...

    def get_artifact_provider_version(self, *, import_id: str, tenant_id: str) -> str:
        ...

    def list_pending_dispatches(self, *, tenant_id: str) -> tuple[PendingImportDispatchDTO, ...]:
        ...

    def mark_dispatch_dispatched(self, *, outbox_id: str, tenant_id: str) -> None:
        ...


class ImportTaskPublisher(Protocol):
    def publish_process_import(
        self, *, import_id: str, tenant_id: str, operation_id: str, correlation_id: str
    ) -> None:
        ...


class CreateImport:
    def __init__(
        self,
        imports: ImportRepository | None = None,
        artifact_storage: ImportArtifactStorage | None = None,
        unit_of_work: SqlAlchemyUnitOfWork | None = None,
    ) -> None:
        self._imports = imports
        self._artifact_storage = artifact_storage
        self._unit_of_work = unit_of_work

    def execute(self, command: CreateImportCommand) -> ImportCreatedDTO:
        if command.content_type not in SUPPORTED_IMPORT_MEDIA_TYPES:
            raise UnsupportedImportMediaTypeError

        if self._imports is None or self._artifact_storage is None or self._unit_of_work is None:
            raise NotImplementedError("CreateImport requires repository, storage, and unit-of-work wiring.")

        import_id = f"import_{uuid4().hex}"
        operation_id = f"operation_{uuid4().hex}"
        content_hash = sha256(command.content).hexdigest()
        byte_size = len(command.content)
        source_id = "browser_upload"
        artifact_key = f"imports/{command.tenant_id}/{source_id}/{content_hash}"

        with self._unit_of_work:
            self._imports.add_reservation(
                import_id=import_id,
                tenant_id=command.tenant_id,
                source_id=source_id,
                original_filename=command.filename,
                content_type=command.content_type,
                artifact_key=artifact_key,
                sha256=content_hash,
                byte_size=byte_size,
                operation_id=operation_id,
                correlation_id=command.correlation_id,
            )

        stored_artifact = self._artifact_storage.put_original_once(
            key=artifact_key,
            content=command.content,
            content_type=command.content_type,
            sha256=content_hash,
            byte_size=byte_size,
            tenant_id=command.tenant_id,
            import_id=import_id,
        )

        with self._unit_of_work:
            self._imports.mark_queued_with_artifact(
                import_id=import_id,
                tenant_id=command.tenant_id,
                actor_id=command.actor_id,
                original_filename=command.filename,
                content_type=command.content_type,
                artifact_key=stored_artifact.key,
                provider_version_id=stored_artifact.provider_version_id,
                sha256=stored_artifact.sha256,
                byte_size=stored_artifact.byte_size,
                operation_id=operation_id,
                correlation_id=command.correlation_id,
            )

        return ImportCreatedDTO(import_id=import_id, tenant_id=command.tenant_id, status="queued")


class ProcessImport:
    def __init__(
        self,
        imports: ImportRepository,
        supplier_products: SupplierProductWriter,
        artifact_storage: ImportArtifactStorage,
        unit_of_work: SqlAlchemyUnitOfWork,
    ) -> None:
        self._imports = imports
        self._supplier_products = supplier_products
        self._artifact_storage = artifact_storage
        self._unit_of_work = unit_of_work

    def execute(self, command: ProcessImportCommand) -> ProcessImportResultDTO:
        with self._unit_of_work:
            stored_import = self._imports.get_processing_artifact(import_id=command.import_id, tenant_id=command.tenant_id)
            if stored_import is None:
                raise ValueError("Import not found for tenant.")
            if stored_import.status == "completed":
                return ProcessImportResultDTO(
                    import_id=command.import_id,
                    tenant_id=command.tenant_id,
                    status="completed",
                    accepted_count=stored_import.accepted_count,
                )
            self._imports.mark_processing_once(
                import_id=command.import_id,
                tenant_id=command.tenant_id,
                actor_id="system_worker",
            )
            artifact_key = stored_import.artifact_key
            provider_version_id = self._imports.get_artifact_provider_version(
                import_id=stored_import.id,
                tenant_id=stored_import.tenant_id,
            )
            content_type = stored_import.content_type

        content = self._artifact_storage.read_recorded_version(
            key=artifact_key,
            provider_version_id=provider_version_id,
            sha256=stored_import.sha256,
            byte_size=stored_import.byte_size,
        )
        raw_rows = _parse_rows(content, content_type)
        accepted = 0

        with self._unit_of_work:
            for row_number, raw_row in enumerate(raw_rows, start=1):
                normalized = _normalize_supplier_row(raw_row)
                self._supplier_products.upsert_from_import(
                    UpsertSupplierProductCommand(
                        tenant_id=command.tenant_id,
                        import_id=command.import_id,
                        source_row_number=row_number,
                        supplier_sku=normalized["supplier_sku"],
                        title=normalized["title"],
                        brand=normalized.get("brand"),
                        category=normalized.get("category"),
                        price=Decimal(normalized["price"]),
                        currency=normalized["currency"],
                        gtin=normalized.get("gtin"),
                        manufacturer_part_number=normalized.get("manufacturer_part_number"),
                        raw_source=raw_row,
                        provenance={
                            "mappingVersion": "m3_supplier_v1",
                            "sourceRowNumber": row_number,
                            "importId": command.import_id,
                        },
                    )
                )
                accepted += 1
            self._imports.mark_completed_once(
                import_id=command.import_id,
                tenant_id=command.tenant_id,
                actor_id="system_worker",
                accepted_count=accepted,
            )

        return ProcessImportResultDTO(
            import_id=command.import_id,
            tenant_id=command.tenant_id,
            status="completed",
            accepted_count=accepted,
        )

class DispatchPendingImportOutbox:
    def __init__(self, imports: ImportRepository, publisher: ImportTaskPublisher) -> None:
        self._imports = imports
        self._publisher = publisher

    def execute(self, *, tenant_id: str) -> DispatchImportOutboxResultDTO:
        pending = self._imports.list_pending_dispatches(tenant_id=tenant_id)
        dispatched_count = 0
        for record in pending:
            try:
                self._publisher.publish_process_import(
                    import_id=record.import_id,
                    tenant_id=record.tenant_id,
                    operation_id=record.operation_id,
                    correlation_id=record.correlation_id,
                )
            except Exception:
                continue
            self._imports.mark_dispatch_dispatched(outbox_id=record.id, tenant_id=tenant_id)
            dispatched_count += 1

        return DispatchImportOutboxResultDTO(
            dispatched_count=dispatched_count,
            pending_count=len(pending) - dispatched_count,
        )


def _parse_rows(content: bytes, content_type: str) -> list[dict[str, str]]:
    text = content.decode("utf-8-sig")
    if content_type == "application/json":
        parsed = json.loads(text)
        if not isinstance(parsed, list):
            raise ValueError("JSON catalog import must be an array.")
        return [{str(key): str(value) for key, value in row.items()} for row in parsed]

    return [dict(row) for row in csv.DictReader(StringIO(text))]


def _first_value(row: dict[str, str], *names: str) -> str | None:
    for name in names:
        value = row.get(name)
        if value is not None and value != "":
            return value
    return None


def _normalize_supplier_row(row: dict[str, str]) -> dict[str, str]:
    supplier_sku = _first_value(row, "supplier_sku", "sku")
    title = _first_value(row, "title", "name", "product_name")
    price = _first_value(row, "price")
    currency = _first_value(row, "currency")
    if supplier_sku is None or title is None or price is None or currency is None:
        raise ValueError("Valid M3-01 imports require supplier_sku, title, price, and currency.")

    normalized = {
        "supplier_sku": supplier_sku,
        "title": title,
        "price": price,
        "currency": currency,
    }
    optional = {
        "brand": _first_value(row, "brand"),
        "category": _first_value(row, "category"),
        "gtin": _first_value(row, "gtin", "ean", "upc"),
        "manufacturer_part_number": _first_value(row, "manufacturer_part_number", "mpn"),
    }
    normalized.update({key: value for key, value in optional.items() if value is not None})
    return normalized


class GetImportDetail:
    def __init__(self, imports: ImportRepository, supplier_products: SupplierProductReader) -> None:
        self._imports = imports
        self._supplier_products = supplier_products

    def execute(self, *, import_id: str, tenant_id: str) -> ImportDetailDTO | None:
        stored_import = self._imports.get_import(import_id=import_id, tenant_id=tenant_id)
        if stored_import is None:
            return None
        return ImportDetailDTO(
            import_id=stored_import.id,
            tenant_id=stored_import.tenant_id,
            status=stored_import.status,
            original_filename=stored_import.original_filename,
            content_type=stored_import.content_type,
            sha256=stored_import.sha256,
            byte_size=stored_import.byte_size,
            accepted_count=stored_import.accepted_count,
            rejected_count=stored_import.rejected_count,
            products=self._supplier_products.list_for_import(tenant_id=tenant_id, import_id=import_id),
            audit_history=self._imports.list_audit_events(tenant_id=tenant_id, import_id=import_id),
        )
