"""Identity entities."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime


@dataclass(frozen=True, slots=True)
class User:
    id: str
    email: str
    display_name: str
    password_hash: str
    is_active: bool
    created_at: datetime


@dataclass(frozen=True, slots=True)
class SessionRecord:
    id: str
    session_token_hash: str
    user_id: str
    active_tenant_id: str
    issued_at: datetime
    expires_at: datetime
    revoked_at: datetime | None = None
    user_agent: str | None = None
    ip_address: str | None = None

    @property
    def is_active(self) -> bool:
        now = datetime.now(UTC)
        expires_at = self.expires_at if self.expires_at.tzinfo is not None else self.expires_at.replace(tzinfo=UTC)
        return self.revoked_at is None and expires_at > now
