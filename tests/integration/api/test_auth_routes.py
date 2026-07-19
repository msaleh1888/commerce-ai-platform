from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime, timedelta

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from commerce_ai_api.api.dependencies.auth import get_db_session, require_capability
from commerce_ai_api.core.config import Settings, get_settings
from commerce_ai_api.db.base import Base
from commerce_ai_api.main import create_app
from commerce_ai_api.modules.identity.domain.entities import SessionRecord, User
from commerce_ai_api.modules.identity.domain.passwords import hash_password
from commerce_ai_api.modules.identity.domain.session_tokens import hash_session_token
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.identity.infrastructure.persistence.models import SessionModel
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import SessionRepository, UserRepository
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository


_ = (identity_models, tenancy_models)
_NOW = datetime(2026, 7, 18, tzinfo=UTC)
_PASSWORD = "local-only-test-password"


def _client(*, settings: Settings | None = None) -> tuple[TestClient, Session]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    session = session_factory()
    app = create_app()

    def override_db_session() -> Iterator[Session]:
        yield session

    app.dependency_overrides[get_db_session] = override_db_session
    app.dependency_overrides[get_settings] = lambda: settings or Settings(environment="local")
    return TestClient(app), session


def _seed_identity(session: Session) -> None:
    tenants = TenantRepository(session)
    users = UserRepository(session)
    memberships = MembershipRepository(session)
    password_hash = hash_password(_PASSWORD)

    tenants.upsert(Tenant(id="tenant_northstar", name="Northstar Retail", slug="northstar-retail", created_at=_NOW))
    tenants.upsert(Tenant(id="tenant_acme", name="Acme Outlet", slug="acme-outlet", created_at=_NOW))
    users.upsert(
        User(
            id="user_nora",
            email="nora.manager@northstar.example",
            display_name="Nora Patel",
            password_hash=password_hash,
            is_active=True,
            created_at=_NOW,
        )
    )
    users.upsert(
        User(
            id="user_eli",
            email="eli.ops@acme.example",
            display_name="Eli Rivera",
            password_hash=password_hash,
            is_active=True,
            created_at=_NOW,
        )
    )
    users.upsert(
        User(
            id="user_inactive",
            email="inactive@example.com",
            display_name="Inactive User",
            password_hash=password_hash,
            is_active=False,
            created_at=_NOW,
        )
    )
    memberships.upsert(
        Membership(
            id="membership_nora_northstar",
            tenant_id="tenant_northstar",
            user_id="user_nora",
            role=Role.CATALOG_MANAGER,
            is_active=True,
            created_at=_NOW,
        ),
        tenant_id="tenant_northstar",
    )
    memberships.upsert(
        Membership(
            id="membership_nora_acme",
            tenant_id="tenant_acme",
            user_id="user_nora",
            role=Role.VIEWER,
            is_active=True,
            created_at=_NOW,
        ),
        tenant_id="tenant_acme",
    )
    memberships.upsert(
        Membership(
            id="membership_eli_acme",
            tenant_id="tenant_acme",
            user_id="user_eli",
            role=Role.MERCHANDISER,
            is_active=True,
            created_at=_NOW,
        ),
        tenant_id="tenant_acme",
    )
    memberships.upsert(
        Membership(
            id="membership_inactive_northstar",
            tenant_id="tenant_northstar",
            user_id="user_inactive",
            role=Role.VIEWER,
            is_active=True,
            created_at=_NOW,
        ),
        tenant_id="tenant_northstar",
    )
    session.commit()


def _login(client: TestClient, email: str = "nora.manager@northstar.example") -> str:
    response = client.post("/auth/login", json={"email": email, "password": _PASSWORD})
    assert response.status_code == 200
    return response.cookies["commerce_ai_session"]


def _add_session(session: Session, *, raw_token: str, user_id: str, tenant_id: str, expires_at: datetime, revoked: bool = False) -> None:
    SessionRepository(session).add(
        SessionRecord(
            id=f"session_{user_id}_{tenant_id}_{raw_token}",
            session_token_hash=hash_session_token(raw_token),
            user_id=user_id,
            active_tenant_id=tenant_id,
            issued_at=datetime.now(UTC),
            expires_at=expires_at,
            revoked_at=datetime.now(UTC) if revoked else None,
        )
    )
    session.commit()


def test_successful_login_sets_cookie_and_returns_safe_session_response() -> None:
    client, session = _client()
    _seed_identity(session)

    response = client.post("/auth/login", json={"email": "nora.manager@northstar.example", "password": _PASSWORD})

    assert response.status_code == 200
    body = response.json()
    assert body["actor"] == {
        "id": "user_nora",
        "name": "Nora Patel",
        "email": "nora.manager@northstar.example",
    }
    assert body["activeTenant"]["id"] == "tenant_northstar"
    assert body["role"] == "catalog_manager"
    assert "catalog.product:read" in body["allowedCapabilities"]
    assert "password" not in response.text
    assert "session_token" not in response.text

    raw_cookie = response.cookies["commerce_ai_session"]
    stored_session = session.scalar(select(SessionModel))
    assert stored_session is not None
    assert stored_session.session_token_hash == hash_session_token(raw_cookie)
    assert stored_session.session_token_hash != raw_cookie
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=lax" in response.headers["set-cookie"].lower()


def test_incorrect_credentials_are_rejected() -> None:
    client, session = _client()
    _seed_identity(session)

    response = client.post("/auth/login", json={"email": "nora.manager@northstar.example", "password": "wrong"})

    assert response.status_code == 401
    assert session.scalar(select(SessionModel)) is None


def test_unauthenticated_session_logout_and_switch_requests_are_rejected() -> None:
    client, session = _client()
    _seed_identity(session)

    assert client.get("/auth/session").status_code == 401
    assert client.post("/auth/logout").status_code == 401
    assert client.put("/auth/active-tenant", json={"tenant_id": "tenant_acme"}).status_code == 401


def test_logout_revokes_current_session() -> None:
    client, session = _client()
    _seed_identity(session)
    _login(client)

    logout_response = client.post("/auth/logout")
    session_response = client.get("/auth/session")

    stored_session = session.scalar(select(SessionModel))
    assert logout_response.status_code == 204
    assert session_response.status_code == 401
    assert stored_session is not None
    assert stored_session.revoked_at is not None


def test_expired_and_revoked_sessions_are_rejected() -> None:
    client, session = _client()
    _seed_identity(session)
    _add_session(
        session,
        raw_token="expired-token",
        user_id="user_nora",
        tenant_id="tenant_northstar",
        expires_at=datetime.now(UTC) - timedelta(seconds=1),
    )
    _add_session(
        session,
        raw_token="revoked-token",
        user_id="user_nora",
        tenant_id="tenant_northstar",
        expires_at=datetime.now(UTC) + timedelta(hours=1),
        revoked=True,
    )

    assert client.get("/auth/session", cookies={"commerce_ai_session": "expired-token"}).status_code == 401
    assert client.get("/auth/session", cookies={"commerce_ai_session": "revoked-token"}).status_code == 401


def test_inactive_users_and_deactivated_memberships_are_rejected() -> None:
    client, session = _client()
    _seed_identity(session)
    assert client.post("/auth/login", json={"email": "inactive@example.com", "password": _PASSWORD}).status_code == 401

    MembershipRepository(session).upsert(
        Membership(
            id="membership_nora_northstar",
            tenant_id="tenant_northstar",
            user_id="user_nora",
            role=Role.CATALOG_MANAGER,
            is_active=False,
            created_at=_NOW,
        ),
        tenant_id="tenant_northstar",
    )
    session.commit()
    _add_session(
        session,
        raw_token="deactivated-membership-token",
        user_id="user_nora",
        tenant_id="tenant_northstar",
        expires_at=datetime.now(UTC) + timedelta(hours=1),
    )

    response = client.get("/auth/session", cookies={"commerce_ai_session": "deactivated-membership-token"})

    assert response.status_code == 401


def test_tenant_switching_requires_active_membership() -> None:
    client, session = _client()
    _seed_identity(session)
    _login(client)

    permitted = client.put("/auth/active-tenant", json={"tenant_id": "tenant_acme"})
    denied = client.put("/auth/active-tenant", json={"tenant_id": "tenant_missing"})

    assert permitted.status_code == 200
    assert permitted.json()["activeTenant"]["id"] == "tenant_acme"
    assert permitted.json()["role"] == "viewer"
    assert denied.status_code == 403


def test_role_capability_denial() -> None:
    client, session = _client()
    _seed_identity(session)

    app = client.app
    assert isinstance(app, FastAPI)

    @app.get("/test/protected-approval", dependencies=[Depends(require_capability("catalog.approval:execute"))])
    def protected_approval() -> dict[str, str]:
        return {"status": "ok"}

    _login(client, "eli.ops@acme.example")

    response = client.get("/test/protected-approval")

    assert response.status_code == 403


def test_cross_tenant_access_denial() -> None:
    client, session = _client()
    _seed_identity(session)
    _login(client, "eli.ops@acme.example")

    response = client.put("/auth/active-tenant", json={"tenant_id": "tenant_northstar"})

    assert response.status_code == 403


def test_cookie_security_behavior_for_local_and_non_local_configuration() -> None:
    local_client, local_session = _client(settings=Settings(environment="local", web_origin="http://localhost:3000"))
    _seed_identity(local_session)
    local_response = local_client.post(
        "/auth/login",
        json={"email": "nora.manager@northstar.example", "password": _PASSWORD},
    )

    production_client, production_session = _client(
        settings=Settings(environment="production", web_origin="https://commerce.example")
    )
    _seed_identity(production_session)
    production_response = production_client.post(
        "/auth/login",
        json={"email": "nora.manager@northstar.example", "password": _PASSWORD},
    )

    assert "secure" not in local_response.headers["set-cookie"].lower()
    assert "secure" in production_response.headers["set-cookie"].lower()
