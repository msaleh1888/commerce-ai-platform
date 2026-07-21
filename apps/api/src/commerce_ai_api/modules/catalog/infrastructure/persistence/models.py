from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Integer, JSON, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from commerce_ai_api.db.base import Base


class SupplierProductModel(Base):
    __tablename__ = "supplier_products"
    __table_args__ = (UniqueConstraint("tenant_id", "import_id", "source_row_number", name="uq_supplier_products_import_row"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    import_id: Mapped[str] = mapped_column(String(64), nullable=False)
    source_row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    supplier_sku: Mapped[str] = mapped_column(String(256), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    brand: Mapped[str | None] = mapped_column(String(256), nullable=True)
    category: Mapped[str | None] = mapped_column(String(256), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    gtin: Mapped[str | None] = mapped_column(String(64), nullable=True)
    manufacturer_part_number: Mapped[str | None] = mapped_column(String(256), nullable=True)
    raw_source: Mapped[dict[str, str]] = mapped_column(JSON, nullable=False)
    provenance: Mapped[dict[str, str | int]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
