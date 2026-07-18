from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from commerce_ai_api.db.base import Base
from commerce_ai_api.modules.identity.application.use_cases import ResolveAuthenticatedSession
from commerce_ai_api.modules.identity.domain.entities import SessionRecord, User
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import SessionRepository, UserRepository
from commerce_ai_api.modules.tenancy.application.use_cases import ResolveTenantContext
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository


_ = (identity_models, tenancy_models)
_NOW = datetime(2026, 7, 18, tzinfo=UTC)


@pytest.fixture()
def db_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    with session_factory() as session:
        yield session


def _seed_user_tenant_and_membership(session: Session, *, active: bool = True) -> None:
    TenantRepository(session).upsert(
        Tenant(id="tenant_northstar", name="Northstar Retail", slug="northstar-retail", created_at=_NOW)
    )
    TenantRepository(session).upsert(Tenant(id="tenant_acme", name="Acme Outlet", slug="acme-outlet", created_at=_NOW))
    UserRepository(session).upsert(
        User(
            id="user_nora",
            email="nora.manager@northstar.example",
            display_name="Nora Patel",
            password_hash="$argon2id$test",
            is_active=True,
            created_at=_NOW,
        )
    )
    MembershipRepository(session).upsert(
        Membership(
            id="membership_northstar_nora",
            tenant_id="tenant_northstar",
            user_id="user_nora",
            role=Role.CATALOG_MANAGER,
            is_active=active,
            created_at=_NOW,
        ),
        tenant_id="tenant_northstar",
    )
    session.commit()


def _resolver(session: Session) -> ResolveAuthenticatedSession:
    return ResolveAuthenticatedSession(
        SessionRepository(session),
        UserRepository(session),
        ResolveTenantContext(MembershipRepository(session)),
    )


def _add_session(session: Session, *, active_tenant_id: str = "tenant_northstar") -> None:
    SessionRepository(session).add(
        SessionRecord(
            id="session_nora",
            session_token_hash="session-hash",
            user_id="user_nora",
            active_tenant_id=active_tenant_id,
            issued_at=_NOW,
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
    )
    session.commit()


def test_resolve_authenticated_session_returns_active_tenant_context(db_session: Session) -> None:
    _seed_user_tenant_and_membership(db_session)
    _add_session(db_session)

    authenticated_session = _resolver(db_session).execute("session-hash")

    assert authenticated_session is not None
    assert authenticated_session.tenant_context.tenant_id == "tenant_northstar"
    assert authenticated_session.tenant_context.role is Role.CATALOG_MANAGER


def test_resolve_authenticated_session_rejects_deactivated_membership(db_session: Session) -> None:
    _seed_user_tenant_and_membership(db_session)
    _add_session(db_session)
    MembershipRepository(db_session).upsert(
        Membership(
            id="membership_northstar_nora",
            tenant_id="tenant_northstar",
            user_id="user_nora",
            role=Role.CATALOG_MANAGER,
            is_active=False,
            created_at=_NOW,
        ),
        tenant_id="tenant_northstar",
    )
    db_session.commit()

    assert _resolver(db_session).execute("session-hash") is None


def test_resolve_authenticated_session_rejects_cross_tenant_session(db_session: Session) -> None:
    _seed_user_tenant_and_membership(db_session)
    _add_session(db_session, active_tenant_id="tenant_acme")

    assert _resolver(db_session).execute("session-hash") is None


def test_session_record_accepts_database_naive_utc_expiry_timestamp() -> None:
    session_record = SessionRecord(
        id="session_nora",
        session_token_hash="session-hash",
        user_id="user_nora",
        active_tenant_id="tenant_northstar",
        issued_at=_NOW.replace(tzinfo=None),
        expires_at=(datetime.now(UTC) + timedelta(hours=1)).replace(tzinfo=None),
    )

    assert session_record.is_active
