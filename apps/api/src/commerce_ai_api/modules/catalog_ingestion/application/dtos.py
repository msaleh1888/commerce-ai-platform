from __future__ import annotations

from dataclasses import dataclass

from commerce_ai_api.modules.catalog.application.dtos import SupplierProductViewDTO


@dataclass(frozen=True)
class CreateImportCommand:
    tenant_id: str
    actor_id: str
    filename: str
    content_type: str
    content: bytes
    correlation_id: str


@dataclass(frozen=True)
class ImportCreatedDTO:
    import_id: str
    tenant_id: str
    status: str


@dataclass(frozen=True)
class ProcessImportCommand:
    import_id: str
    tenant_id: str
    operation_id: str
    correlation_id: str


@dataclass(frozen=True)
class ProcessImportResultDTO:
    import_id: str
    tenant_id: str
    status: str
    accepted_count: int


@dataclass(frozen=True)
class PendingImportDispatchDTO:
    id: str
    import_id: str
    tenant_id: str
    operation_id: str
    correlation_id: str


@dataclass(frozen=True)
class DispatchImportOutboxResultDTO:
    dispatched_count: int
    pending_count: int


@dataclass(frozen=True)
class ImportAuditEventViewDTO:
    event_type: str
    from_status: str | None
    to_status: str
    message: str
    created_at: str


@dataclass(frozen=True)
class ImportDetailDTO:
    import_id: str
    tenant_id: str
    status: str
    original_filename: str
    content_type: str
    sha256: str
    byte_size: int
    accepted_count: int
    rejected_count: int
    products: tuple[SupplierProductViewDTO, ...]
    audit_history: tuple[ImportAuditEventViewDTO, ...]
