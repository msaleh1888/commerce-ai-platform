"""Identity application use cases."""

from __future__ import annotations

from typing import Protocol

from commerce_ai_api.modules.identity.application.dtos import AuthenticatedSessionDTO, SessionDTO
from commerce_ai_api.modules.identity.domain.entities import SessionRecord, User
from commerce_ai_api.modules.tenancy.application.dtos import TenantContextDTO
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError


class SessionReader(Protocol):
    def get_active_by_token_hash(self, session_token_hash: str) -> SessionRecord | None: ...


class UserReader(Protocol):
    def get_by_id(self, user_id: str) -> User | None: ...


class TenantContextResolver(Protocol):
    def execute(self, user_id: str, tenant_id: str) -> TenantContextDTO: ...


class ResolveAuthenticatedSession:
    """Resolve a session only when its actor and active tenant remain authorized."""

    def __init__(
        self,
        sessions: SessionReader,
        users: UserReader,
        tenant_contexts: TenantContextResolver,
    ) -> None:
        self._sessions = sessions
        self._users = users
        self._tenant_contexts = tenant_contexts

    def execute(self, session_token_hash: str) -> AuthenticatedSessionDTO | None:
        session_record = self._sessions.get_active_by_token_hash(session_token_hash)
        if session_record is None:
            return None

        user = self._users.get_by_id(session_record.user_id)
        if user is None or not user.is_active:
            return None

        try:
            tenant_context = self._tenant_contexts.execute(
                user_id=session_record.user_id,
                tenant_id=session_record.active_tenant_id,
            )
        except TenantAccessDeniedError:
            return None

        return AuthenticatedSessionDTO(
            session=SessionDTO(
                id=session_record.id,
                user_id=session_record.user_id,
                active_tenant_id=session_record.active_tenant_id,
                issued_at=session_record.issued_at,
                expires_at=session_record.expires_at,
                revoked_at=session_record.revoked_at,
            ),
            tenant_context=tenant_context,
        )
