from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class UpsertSupplierProductCommand:
    tenant_id: str
    import_id: str
    source_row_number: int
    supplier_sku: str
    title: str
    brand: str | None
    category: str | None
    price: Decimal
    currency: str
    gtin: str | None
    manufacturer_part_number: str | None
    raw_source: dict[str, str]
    provenance: dict[str, str | int]


@dataclass(frozen=True)
class SupplierProductViewDTO:
    id: str
    tenant_id: str
    import_id: str
    source_row_number: int
    supplier_sku: str
    title: str
    brand: str | None
    category: str | None
    price: str
    currency: str
    gtin: str | None
    manufacturer_part_number: str | None
    raw_source: dict[str, str]
    provenance: dict[str, str | int]
