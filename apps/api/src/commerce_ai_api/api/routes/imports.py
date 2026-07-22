from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.responses import JSONResponse

from commerce_ai_api.api.dependencies.auth import get_db_session
from commerce_ai_api.api.dependencies.auth import require_capability
from commerce_ai_api.core.import_wiring import build_create_import, build_get_import_detail
from commerce_ai_api.modules.catalog_ingestion.application.dtos import CreateImportCommand
from commerce_ai_api.modules.catalog_ingestion.application.errors import UnsupportedImportMediaTypeError
from commerce_ai_api.modules.catalog_ingestion.application.use_cases import CreateImport, GetImportDetail
from commerce_ai_api.modules.identity.application.dtos import AuthenticatedSessionDTO


router = APIRouter(prefix="/imports", tags=["imports"])


def create_import_use_case(db_session=Depends(get_db_session)) -> CreateImport:
    return build_create_import(db_session)


def get_import_detail_use_case(db_session=Depends(get_db_session)) -> GetImportDetail:
    return build_get_import_detail(db_session)


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def create_import(
    file: UploadFile = File(...),
    authenticated_session: AuthenticatedSessionDTO = Depends(require_capability("catalog.import:create")),
    use_case: CreateImport = Depends(create_import_use_case),
) -> dict[str, str]:
    content = await file.read()
    command = CreateImportCommand(
        tenant_id=authenticated_session.tenant_context.tenant_id,
        actor_id=authenticated_session.tenant_context.actor_id,
        filename=file.filename or "catalog-upload",
        content_type=file.content_type or "",
        content=content,
        correlation_id=str(uuid4()),
    )

    try:
        result = use_case.execute(command)
    except UnsupportedImportMediaTypeError:
        return JSONResponse(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            content={
                "code": "unsupported_import_media_type",
                "message": "Catalog imports accept CSV or JSON files only.",
            },
        )

    return {"id": result.import_id, "tenantId": result.tenant_id, "status": result.status}


@router.get("/{import_id}")
def get_import(
    import_id: str,
    authenticated_session: AuthenticatedSessionDTO = Depends(require_capability("catalog.import:read")),
    use_case: GetImportDetail = Depends(get_import_detail_use_case),
) -> dict:
    detail = use_case.execute(import_id=import_id, tenant_id=authenticated_session.tenant_context.tenant_id)
    if detail is None:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"code": "import_not_found"})
    return {
        "id": detail.import_id,
        "tenantId": detail.tenant_id,
        "status": detail.status,
        "source": {
            "filename": detail.original_filename,
            "contentType": detail.content_type,
            "sha256": detail.sha256,
            "byteSize": detail.byte_size,
        },
        "counts": {"accepted": detail.accepted_count, "rejected": detail.rejected_count},
        "products": [
            {
                "id": product.id,
                "sourceRowNumber": product.source_row_number,
                "supplierSku": product.supplier_sku,
                "title": product.title,
                "brand": product.brand,
                "category": product.category,
                "price": product.price,
                "currency": product.currency,
                "gtin": product.gtin,
                "manufacturerPartNumber": product.manufacturer_part_number,
                "rawSource": product.raw_source,
                "provenance": product.provenance,
            }
            for product in detail.products
        ],
        "auditHistory": [
            {
                "eventType": event.event_type,
                "fromStatus": event.from_status,
                "toStatus": event.to_status,
                "message": event.message,
                "createdAt": event.created_at,
            }
            for event in detail.audit_history
        ],
    }
