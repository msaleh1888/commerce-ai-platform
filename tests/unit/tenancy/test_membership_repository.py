from __future__ import annotations

from datetime import UTC, datetime

import pytest
from sqlalchemy import create_engine, insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from commerce_ai_api.db.base import Base
from commerce_ai_api.modules.identity.domain.entities import User
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import UserRepository
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence.models import MembershipModel
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import (
    MembershipRepository,
    TenantRepository,
)


_ = (identity_models, tenancy_models)


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


def seed_identity_tenancy(session: Session) -> None:
    created_at = datetime(2026, 7, 18, tzinfo=UTC)
    tenants = TenantRepository(session)
    users = UserRepository(session)
    memberships = MembershipRepository(session)

    tenants.upsert(Tenant(id="tenant_northstar", name="Northstar Retail", slug="northstar-retail", created_at=created_at))
    tenants.upsert(Tenant(id="tenant_acme", name="Acme Outlet", slug="acme-outlet", created_at=created_at))
    users.upsert(
        User(
            id="user_nora",
            email="nora.manager@northstar.example",
            display_name="Nora Patel",
            password_hash="$argon2id$test",
            is_active=True,
            created_at=created_at,
        )
    )
    memberships.upsert(
        Membership(
            id="membership_northstar_nora",
            tenant_id="tenant_northstar",
            user_id="user_nora",
            role=Role.CATALOG_MANAGER,
            is_active=True,
            created_at=created_at,
        ),
        tenant_id="tenant_northstar",
    )
    session.commit()


def test_membership_lookup_requires_tenant_scope(db_session: Session) -> None:
    seed_identity_tenancy(db_session)
    memberships = MembershipRepository(db_session)

    assert memberships.get_active_for_user(tenant_id="tenant_northstar", user_id="user_nora") is not None
    assert memberships.get_active_for_user(tenant_id="tenant_acme", user_id="user_nora") is None


def test_cross_tenant_membership_mutation_is_denied(db_session: Session) -> None:
    seed_identity_tenancy(db_session)
    memberships = MembershipRepository(db_session)

    with pytest.raises(TenantAccessDeniedError):
        memberships.upsert(
            Membership(
                id="membership_northstar_nora",
                tenant_id="tenant_northstar",
                user_id="user_nora",
                role=Role.VIEWER,
                is_active=True,
                created_at=datetime(2026, 7, 18, tzinfo=UTC),
            ),
            tenant_id="tenant_acme",
        )


def test_require_active_for_user_denies_cross_tenant_read(db_session: Session) -> None:
    seed_identity_tenancy(db_session)
    memberships = MembershipRepository(db_session)

    with pytest.raises(TenantAccessDeniedError):
        memberships.require_active_for_user(tenant_id="tenant_acme", user_id="user_nora")


def test_membership_role_must_be_from_the_approved_role_set(db_session: Session) -> None:
    seed_identity_tenancy(db_session)

    with pytest.raises(IntegrityError, match="ck_memberships_role"):
        with db_session.begin_nested():
            db_session.execute(
                insert(MembershipModel).values(
                    id="membership_invalid_role",
                    tenant_id="tenant_northstar",
                    user_id="user_nora",
                    role="owner",
                    is_active=True,
                    created_at=datetime(2026, 7, 18, tzinfo=UTC),
                )
            )
