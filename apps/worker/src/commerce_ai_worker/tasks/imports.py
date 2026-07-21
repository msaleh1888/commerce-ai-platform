from __future__ import annotations

from commerce_ai_api.modules.catalog_ingestion.application.dtos import ProcessImportCommand
from commerce_ai_worker.celery_app import celery_app
from commerce_ai_worker.core.import_wiring import resolve_process_import_use_case, worker_db_session


@celery_app.task(name="commerce_ai_worker.process_import")
def process_import(*, import_id: str, tenant_id: str, operation_id: str, correlation_id: str) -> dict[str, str | int]:
    command = ProcessImportCommand(
        import_id=import_id,
        tenant_id=tenant_id,
        operation_id=operation_id,
        correlation_id=correlation_id,
    )
    with worker_db_session() as session:
        result = resolve_process_import_use_case(session).execute(command)

    return {
        "importId": result.import_id,
        "tenantId": result.tenant_id,
        "status": result.status,
        "acceptedCount": result.accepted_count,
    }
