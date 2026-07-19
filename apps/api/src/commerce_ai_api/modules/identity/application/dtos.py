"""Typed identity application DTOs."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from commerce_ai_api.modules.tenancy.application.dtos import MembershipDTO, TenantDTO, TenantContextDTO

@dataclass(frozen=True, slots=True)
class UserDTO:
    id: str
    email: str
    display_name: str
    is_active: bool


@dataclass(frozen=True, slots=True)
class SessionDTO:
    id: str
    user_id: str
    active_tenant_id: str
    issued_at: datetime
    expires_at: datetime
    revoked_at: datetime | None


@dataclass(frozen=True, slots=True)
class AuthenticatedSessionDTO:
    session: SessionDTO
    tenant_context: TenantContextDTO


@dataclass(frozen=True, slots=True)
class LoginCommand:
    email: str
    password: str
    user_agent: str | None = None
    ip_address: str | None = None


@dataclass(frozen=True, slots=True)
class LoginResultDTO:
    raw_session_token: str
    session_view: "SafeSessionViewDTO"
    expires_at: datetime


@dataclass(frozen=True, slots=True)
class ActorViewDTO:
    id: str
    name: str
    email: str


@dataclass(frozen=True, slots=True)
class MembershipViewDTO:
    tenant: TenantDTO
    role: str
    allowed_capabilities: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class SafeSessionViewDTO:
    actor: ActorViewDTO
    active_tenant: TenantDTO
    memberships: tuple[MembershipViewDTO, ...]
    role: str
    allowed_capabilities: tuple[str, ...]
