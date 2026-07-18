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
        "dashboard:view",
        "catalog:view",
        "search:view",
        "evaluation:view",
        "audit:view",
    }
)

ROLE_CAPABILITIES: dict[Role, frozenset[str]] = {
    Role.ADMINISTRATOR: frozenset(
        {
            *READ_CAPABILITIES,
            "tenant_members:manage",
            "tenant_settings:manage",
            "catalog:import",
            "catalog:manage",
            "catalog_changes:review",
            "catalog_changes:approve",
            "evaluation:run",
        }
    ),
    Role.CATALOG_MANAGER: frozenset(
        {
            *READ_CAPABILITIES,
            "catalog:import",
            "catalog:manage",
            "catalog_changes:review",
            "catalog_changes:approve",
        }
    ),
    Role.MERCHANDISER: frozenset({"dashboard:view", "catalog:view", "search:view", "evaluation:view"}),
    Role.AI_ENGINEER: frozenset({"catalog:view", "search:view", "evaluation:view", "evaluation:run"}),
    Role.VIEWER: READ_CAPABILITIES,
}


def capabilities_for_role(role: Role) -> frozenset[str]:
    return ROLE_CAPABILITIES[role]


def role_allows(role: Role, capability: str) -> bool:
    return capability in capabilities_for_role(role)
