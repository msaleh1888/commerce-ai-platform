"""Composition helpers for application-managed authentication."""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy.orm import Session

from commerce_ai_api.db.session import SqlAlchemyUnitOfWork, create_session_factory
from commerce_ai_api.modules.identity.application.use_cases import (
    BuildSafeSessionView,
    Login,
    Logout,
    ResolveAuthenticatedSession,
    SwitchActiveTenant,
)
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import SessionRepository, UserRepository
from commerce_ai_api.modules.tenancy.application.use_cases import ListActiveTenantMemberships, ResolveTenantContext
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository


def get_db_session() -> Iterator[Session]:
    session_factory = create_session_factory()
    with session_factory() as session:
        yield session


def _membership_lister(db_session: Session) -> ListActiveTenantMemberships:
    return ListActiveTenantMemberships(MembershipRepository(db_session), TenantRepository(db_session))


def build_resolve_authenticated_session(db_session: Session) -> ResolveAuthenticatedSession:
    memberships = MembershipRepository(db_session)
    return ResolveAuthenticatedSession(
        SessionRepository(db_session),
        UserRepository(db_session),
        ResolveTenantContext(memberships),
    )


def build_login(db_session: Session) -> Login:
    memberships = MembershipRepository(db_session)
    return Login(
        SessionRepository(db_session),
        UserRepository(db_session),
        ResolveTenantContext(memberships),
        _membership_lister(db_session),
        SqlAlchemyUnitOfWork(db_session),
    )


def build_logout(db_session: Session) -> Logout:
    return Logout(SessionRepository(db_session), SqlAlchemyUnitOfWork(db_session))


def build_safe_session_view(db_session: Session) -> BuildSafeSessionView:
    return BuildSafeSessionView(UserRepository(db_session), _membership_lister(db_session))


def build_switch_active_tenant(db_session: Session) -> SwitchActiveTenant:
    memberships = MembershipRepository(db_session)
    return SwitchActiveTenant(
        SessionRepository(db_session),
        UserRepository(db_session),
        ResolveTenantContext(memberships),
        _membership_lister(db_session),
        SqlAlchemyUnitOfWork(db_session),
    )
