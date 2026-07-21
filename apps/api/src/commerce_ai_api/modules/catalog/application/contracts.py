from __future__ import annotations

from typing import Protocol

from commerce_ai_api.modules.catalog.application.dtos import SupplierProductViewDTO, UpsertSupplierProductCommand


class SupplierProductWriter(Protocol):
    def upsert_from_import(self, command: UpsertSupplierProductCommand) -> None:
        ...


class SupplierProductReader(Protocol):
    def list_for_import(self, *, tenant_id: str, import_id: str) -> tuple[SupplierProductViewDTO, ...]:
        ...
