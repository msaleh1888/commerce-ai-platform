"""Tenant membership roles and M2 permission semantics."""

from __future__ import annotations

from enum import StrEnum


class Role(StrEnum):
    ADMINISTRATOR = "administrator"
    CATALOG_MANAGER = "catalog_manager"
    MERCHANDISER = "merchandiser"
    AI_ENGINEER = "ai_engineer"
    VIEWER = "viewer"


READ_CAPABILITIES = frozenset(
    {
        "catalog.product:read",
        "catalog.import:read",
        "catalog.review:read",
        "evaluation.run:read",
        "audit.event:read",
    }
)

ROLE_CAPABILITIES: dict[Role, frozenset[str]] = {
    Role.ADMINISTRATOR: frozenset(
        {
            *READ_CAPABILITIES,
            "tenant.member:manage",
            "catalog.import:create",
            "catalog.review:decide",
            "catalog.approval:execute",
        }
    ),
    Role.CATALOG_MANAGER: frozenset(
        {
            *READ_CAPABILITIES,
            "catalog.import:create",
            "catalog.review:decide",
            "catalog.approval:execute",
        }
    ),
    Role.MERCHANDISER: frozenset({"catalog.product:read", "catalog.review:read", "evaluation.run:read", "audit.event:read"}),
    Role.AI_ENGINEER: frozenset({"catalog.product:read", "catalog.review:read", "evaluation.run:read"}),
    Role.VIEWER: READ_CAPABILITIES,
}


def capabilities_for_role(role: Role) -> frozenset[str]:
    return ROLE_CAPABILITIES[role]


def role_allows(role: Role, capability: str) -> bool:
    return capability in capabilities_for_role(role)
