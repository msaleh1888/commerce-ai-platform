"""Tenancy entities."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from commerce_ai_api.modules.tenancy.domain.roles import Role


@dataclass(frozen=True, slots=True)
class Tenant:
    id: str
    name: str
    slug: str
    created_at: datetime


@dataclass(frozen=True, slots=True)
class Membership:
    id: str
    tenant_id: str
    user_id: str
    role: Role
    is_active: bool
    created_at: datetime
