"""Typed identity application DTOs."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


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
