"""Identity application use cases."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Protocol
from uuid import uuid4

from commerce_ai_api.modules.identity.application.dtos import (
    ActorViewDTO,
    AuthenticatedSessionDTO,
    LoginCommand,
    LoginResultDTO,
    MembershipViewDTO,
    SafeSessionViewDTO,
    SessionDTO,
)
from commerce_ai_api.modules.identity.application.errors import AuthorizationDeniedError, InvalidCredentialsError
from commerce_ai_api.modules.identity.domain.entities import SessionRecord, User
from commerce_ai_api.modules.identity.domain.passwords import verify_password
from commerce_ai_api.modules.identity.domain.session_tokens import generate_session_token, hash_session_token
from commerce_ai_api.modules.tenancy.application.dtos import MembershipDTO, TenantContextDTO, TenantDTO
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError
from commerce_ai_api.modules.tenancy.domain.roles import role_allows


SESSION_TTL = timedelta(hours=12)


class SessionReader(Protocol):
    def get_active_by_token_hash(self, session_token_hash: str) -> SessionRecord | None: ...


class SessionWriter(SessionReader, Protocol):
    def add(self, session_record: SessionRecord) -> None: ...

    def revoke_by_token_hash(self, session_token_hash: str, revoked_at: datetime) -> bool: ...

    def update_active_tenant(self, *, session_id: str, active_tenant_id: str) -> None: ...


class UserReader(Protocol):
    def get_by_id(self, user_id: str) -> User | None: ...

    def get_by_email(self, email: str) -> User | None: ...


class TenantContextResolver(Protocol):
    def execute(self, user_id: str, tenant_id: str) -> TenantContextDTO: ...


class MembershipLister(Protocol):
    def execute(self, user_id: str) -> list[MembershipDTO]: ...


class UnitOfWork(Protocol):
    def __enter__(self) -> "UnitOfWork": ...

    def __exit__(self, exc_type, exc_value, traceback) -> None: ...


def _safe_session_view(
    *,
    user: User,
    active_tenant: TenantDTO,
    memberships: list[MembershipDTO],
    tenant_context: TenantContextDTO,
) -> SafeSessionViewDTO:
    return SafeSessionViewDTO(
        actor=ActorViewDTO(id=user.id, name=user.display_name, email=user.email),
        active_tenant=active_tenant,
        memberships=tuple(
            MembershipViewDTO(
                tenant=membership.tenant,
                role=membership.role.value,
                allowed_capabilities=tuple(sorted(membership.capabilities)),
            )
            for membership in memberships
        ),
        role=tenant_context.role.value,
        allowed_capabilities=tuple(sorted(tenant_context.capabilities)),
    )


def _active_tenant_from_memberships(tenant_id: str, memberships: list[MembershipDTO]) -> TenantDTO | None:
    for membership in memberships:
        if membership.tenant.id == tenant_id:
            return membership.tenant
    return None


def _default_active_membership(memberships: list[MembershipDTO]) -> MembershipDTO:
    northstar_membership = next(
        (membership for membership in memberships if membership.tenant.slug == "northstar-retail"),
        None,
    )
    return northstar_membership or memberships[0]


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


class BuildSafeSessionView:
    def __init__(
        self,
        users: UserReader,
        membership_lister: MembershipLister,
    ) -> None:
        self._users = users
        self._membership_lister = membership_lister

    def execute(self, authenticated_session: AuthenticatedSessionDTO) -> SafeSessionViewDTO | None:
        user = self._users.get_by_id(authenticated_session.session.user_id)
        if user is None or not user.is_active:
            return None

        memberships = self._membership_lister.execute(user.id)
        active_tenant = _active_tenant_from_memberships(
            authenticated_session.session.active_tenant_id,
            memberships,
        )
        if active_tenant is None:
            return None

        return _safe_session_view(
            user=user,
            active_tenant=active_tenant,
            memberships=memberships,
            tenant_context=authenticated_session.tenant_context,
        )


class Login:
    def __init__(
        self,
        sessions: SessionWriter,
        users: UserReader,
        tenant_contexts: TenantContextResolver,
        membership_lister: MembershipLister,
        unit_of_work: UnitOfWork,
    ) -> None:
        self._sessions = sessions
        self._users = users
        self._tenant_contexts = tenant_contexts
        self._membership_lister = membership_lister
        self._unit_of_work = unit_of_work

    def execute(self, command: LoginCommand) -> LoginResultDTO:
        user = self._users.get_by_email(command.email.strip().lower())
        if user is None or not user.is_active or not verify_password(user.password_hash, command.password):
            raise InvalidCredentialsError("Invalid email or password.")

        memberships = self._membership_lister.execute(user.id)
        if not memberships:
            raise InvalidCredentialsError("Invalid email or password.")

        active_membership = _default_active_membership(memberships)
        tenant_context = self._tenant_contexts.execute(user_id=user.id, tenant_id=active_membership.tenant.id)
        issued_at = datetime.now(UTC)
        expires_at = issued_at + SESSION_TTL
        raw_session_token = generate_session_token()
        session_record = SessionRecord(
            id=f"session_{uuid4().hex}",
            session_token_hash=hash_session_token(raw_session_token),
            user_id=user.id,
            active_tenant_id=active_membership.tenant.id,
            issued_at=issued_at,
            expires_at=expires_at,
            user_agent=command.user_agent,
            ip_address=command.ip_address,
        )

        with self._unit_of_work:
            self._sessions.add(session_record)

        return LoginResultDTO(
            raw_session_token=raw_session_token,
            session_view=_safe_session_view(
                user=user,
                active_tenant=active_membership.tenant,
                memberships=memberships,
                tenant_context=tenant_context,
            ),
            expires_at=expires_at,
        )


class Logout:
    def __init__(self, sessions: SessionWriter, unit_of_work: UnitOfWork) -> None:
        self._sessions = sessions
        self._unit_of_work = unit_of_work

    def execute(self, session_token_hash: str) -> None:
        with self._unit_of_work:
            self._sessions.revoke_by_token_hash(session_token_hash, datetime.now(UTC))


class SwitchActiveTenant:
    def __init__(
        self,
        sessions: SessionWriter,
        users: UserReader,
        tenant_contexts: TenantContextResolver,
        membership_lister: MembershipLister,
        unit_of_work: UnitOfWork,
    ) -> None:
        self._sessions = sessions
        self._users = users
        self._tenant_contexts = tenant_contexts
        self._membership_lister = membership_lister
        self._unit_of_work = unit_of_work

    def execute(self, authenticated_session: AuthenticatedSessionDTO, tenant_id: str) -> SafeSessionViewDTO:
        user = self._users.get_by_id(authenticated_session.session.user_id)
        if user is None or not user.is_active:
            raise AuthorizationDeniedError("User does not have active membership in tenant.")

        try:
            tenant_context = self._tenant_contexts.execute(user_id=user.id, tenant_id=tenant_id)
        except TenantAccessDeniedError as exc:
            raise AuthorizationDeniedError("User does not have active membership in tenant.") from exc
        memberships = self._membership_lister.execute(user.id)
        active_tenant = _active_tenant_from_memberships(tenant_id, memberships)
        if active_tenant is None:
            raise AuthorizationDeniedError("User does not have active membership in tenant.")

        with self._unit_of_work:
            self._sessions.update_active_tenant(
                session_id=authenticated_session.session.id,
                active_tenant_id=tenant_id,
            )

        return _safe_session_view(
            user=user,
            active_tenant=active_tenant,
            memberships=memberships,
            tenant_context=tenant_context,
        )


class RequireCapability:
    def execute(self, authenticated_session: AuthenticatedSessionDTO, capability: str) -> None:
        if not role_allows(authenticated_session.tenant_context.role, capability):
            raise AuthorizationDeniedError("Required capability is not available for the active tenant role.")
