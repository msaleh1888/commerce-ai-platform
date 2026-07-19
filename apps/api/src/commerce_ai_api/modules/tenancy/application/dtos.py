"""Typed tenancy application DTOs."""

from __future__ import annotations

from dataclasses import dataclass

from commerce_ai_api.modules.tenancy.domain.roles import Role


@dataclass(frozen=True, slots=True)
class TenantDTO:
    id: str
    name: str
    slug: str


@dataclass(frozen=True, slots=True)
class MembershipDTO:
    id: str
    tenant: TenantDTO
    user_id: str
    role: Role
    is_active: bool
    capabilities: frozenset[str]


@dataclass(frozen=True, slots=True)
class TenantContextDTO:
    actor_id: str
    tenant_id: str
    role: Role
    capabilities: frozenset[str]
