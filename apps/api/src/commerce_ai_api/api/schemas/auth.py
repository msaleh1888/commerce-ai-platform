"""Auth API schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class ActiveTenantRequest(BaseModel):
    tenant_id: str = Field(min_length=1)


class ActorResponse(BaseModel):
    id: str
    name: str
    email: str


class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str


class MembershipResponse(BaseModel):
    tenant: TenantResponse
    role: str
    allowedCapabilities: tuple[str, ...]


class SessionResponse(BaseModel):
    actor: ActorResponse
    activeTenant: TenantResponse
    memberships: tuple[MembershipResponse, ...]
    role: str
    allowedCapabilities: tuple[str, ...]
