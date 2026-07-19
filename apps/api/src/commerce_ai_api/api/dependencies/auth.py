"""Authentication and authorization dependencies."""

from __future__ import annotations

from collections.abc import Callable, Iterator

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from commerce_ai_api.db.session import SqlAlchemyUnitOfWork, create_session_factory
from commerce_ai_api.modules.identity.application.dtos import AuthenticatedSessionDTO
from commerce_ai_api.modules.identity.application.errors import AuthorizationDeniedError
from commerce_ai_api.modules.identity.application.use_cases import (
    BuildSafeSessionView,
    Login,
    Logout,
    ResolveAuthenticatedSession,
    SwitchActiveTenant,
)
from commerce_ai_api.modules.identity.domain.session_tokens import hash_session_token
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import SessionRepository, UserRepository
from commerce_ai_api.modules.tenancy.application.use_cases import ListActiveTenantMemberships, ResolveTenantContext
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository


def get_db_session() -> Iterator[Session]:
    session_factory = create_session_factory()
    with session_factory() as session:
        yield session


def session_token_hash_from_cookie(commerce_ai_session: str | None = Cookie(default=None)) -> str:
    if not commerce_ai_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return hash_session_token(commerce_ai_session)


def require_authenticated_session(
    session_token_hash: str = Depends(session_token_hash_from_cookie),
    db_session: Session = Depends(get_db_session),
) -> AuthenticatedSessionDTO:
    memberships = MembershipRepository(db_session)
    authenticated_session = ResolveAuthenticatedSession(
        SessionRepository(db_session),
        UserRepository(db_session),
        ResolveTenantContext(memberships),
    ).execute(session_token_hash)
    if authenticated_session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return authenticated_session


def require_capability(capability: str) -> Callable[[AuthenticatedSessionDTO], AuthenticatedSessionDTO]:
    def dependency(
        authenticated_session: AuthenticatedSessionDTO = Depends(require_authenticated_session),
    ) -> AuthenticatedSessionDTO:
        from commerce_ai_api.modules.identity.application.use_cases import RequireCapability

        try:
            RequireCapability().execute(authenticated_session, capability)
        except AuthorizationDeniedError as exc:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.") from exc
        return authenticated_session

    return dependency


def unit_of_work(db_session: Session) -> SqlAlchemyUnitOfWork:
    return SqlAlchemyUnitOfWork(db_session)


def _membership_lister(db_session: Session) -> ListActiveTenantMemberships:
    return ListActiveTenantMemberships(MembershipRepository(db_session), TenantRepository(db_session))


def login_use_case(db_session: Session = Depends(get_db_session)) -> Login:
    memberships = MembershipRepository(db_session)
    return Login(
        SessionRepository(db_session),
        UserRepository(db_session),
        ResolveTenantContext(memberships),
        ListActiveTenantMemberships(memberships, TenantRepository(db_session)),
        unit_of_work(db_session),
    )


def logout_use_case(db_session: Session = Depends(get_db_session)) -> Logout:
    return Logout(SessionRepository(db_session), unit_of_work(db_session))


def build_safe_session_view_use_case(db_session: Session = Depends(get_db_session)) -> BuildSafeSessionView:
    return BuildSafeSessionView(UserRepository(db_session), _membership_lister(db_session))


def switch_active_tenant_use_case(db_session: Session = Depends(get_db_session)) -> SwitchActiveTenant:
    memberships = MembershipRepository(db_session)
    return SwitchActiveTenant(
        SessionRepository(db_session),
        UserRepository(db_session),
        ResolveTenantContext(memberships),
        ListActiveTenantMemberships(memberships, TenantRepository(db_session)),
        unit_of_work(db_session),
    )
