from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from commerce_ai_api.modules.catalog.application.dtos import SupplierProductViewDTO, UpsertSupplierProductCommand
from commerce_ai_api.modules.catalog.infrastructure.persistence.models import SupplierProductModel


class SupplierProductRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def upsert_from_import(self, command: UpsertSupplierProductCommand) -> None:
        existing = self._session.scalar(
            select(SupplierProductModel).where(
                SupplierProductModel.tenant_id == command.tenant_id,
                SupplierProductModel.import_id == command.import_id,
                SupplierProductModel.source_row_number == command.source_row_number,
            )
        )
        now = datetime.now(UTC)
        if existing is None:
            self._session.add(
                SupplierProductModel(
                    id=f"supplier_product_{uuid4().hex}",
                    tenant_id=command.tenant_id,
                    import_id=command.import_id,
                    source_row_number=command.source_row_number,
                    supplier_sku=command.supplier_sku,
                    title=command.title,
                    brand=command.brand,
                    category=command.category,
                    price=command.price,
                    currency=command.currency,
                    gtin=command.gtin,
                    manufacturer_part_number=command.manufacturer_part_number,
                    raw_source=command.raw_source,
                    provenance=command.provenance,
                    created_at=now,
                    updated_at=now,
                )
            )
            return

        existing.supplier_sku = command.supplier_sku
        existing.title = command.title
        existing.brand = command.brand
        existing.category = command.category
        existing.price = command.price
        existing.currency = command.currency
        existing.gtin = command.gtin
        existing.manufacturer_part_number = command.manufacturer_part_number
        existing.raw_source = command.raw_source
        existing.provenance = command.provenance
        existing.updated_at = now

    def list_for_import(self, *, tenant_id: str, import_id: str) -> tuple[SupplierProductViewDTO, ...]:
        products = self._session.scalars(
            select(SupplierProductModel)
            .where(SupplierProductModel.tenant_id == tenant_id, SupplierProductModel.import_id == import_id)
            .order_by(SupplierProductModel.source_row_number)
        ).all()
        return tuple(
            SupplierProductViewDTO(
                id=product.id,
                tenant_id=product.tenant_id,
                import_id=product.import_id,
                source_row_number=product.source_row_number,
                supplier_sku=product.supplier_sku,
                title=product.title,
                brand=product.brand,
                category=product.category,
                price=str(product.price),
                currency=product.currency,
                gtin=product.gtin,
                manufacturer_part_number=product.manufacturer_part_number,
                raw_source=product.raw_source,
                provenance=product.provenance,
            )
            for product in products
        )
