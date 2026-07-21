from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from commerce_ai_api.api.dependencies.auth import get_db_session
from commerce_ai_api.db.base import Base
from commerce_ai_api.main import create_app
from commerce_ai_api.modules.identity.domain.entities import User
from commerce_ai_api.modules.identity.domain.passwords import hash_password
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import UserRepository
from commerce_ai_api.modules.catalog_ingestion.infrastructure.persistence import models as import_models
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository


_ = (identity_models, tenancy_models, import_models)
_NOW = datetime(2026, 7, 20, tzinfo=UTC)
_PASSWORD = "local-only-test-password"


def _client() -> tuple[TestClient, Session]:
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
    return TestClient(app), session


def _seed_identity(session: Session, *, role: Role = Role.CATALOG_MANAGER) -> None:
    TenantRepository(session).upsert(
        Tenant(id="tenant_northstar", name="Northstar Retail", slug="northstar-retail", created_at=_NOW)
    )
    UserRepository(session).upsert(
        User(
            id="user_nora",
            email="nora.manager@northstar.example",
            display_name="Nora Patel",
            password_hash=hash_password(_PASSWORD),
            is_active=True,
            created_at=_NOW,
        )
    )
    MembershipRepository(session).upsert(
        Membership(
            id="membership_nora_northstar",
            tenant_id="tenant_northstar",
            user_id="user_nora",
            role=role,
            is_active=True,
            created_at=_NOW,
        ),
        tenant_id="tenant_northstar",
    )
    session.commit()


def _login(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "nora.manager@northstar.example", "password": _PASSWORD},
    )
    assert response.status_code == 200


def test_unsupported_import_upload_is_rejected_safely() -> None:
    client, session = _client()
    _seed_identity(session)
    _login(client)

    response = client.post(
        "/imports",
        files={"file": ("products.txt", b"not a catalog", "text/plain")},
    )

    assert response.status_code == 415
    assert response.json() == {
        "code": "unsupported_import_media_type",
        "message": "Catalog imports accept CSV or JSON files only.",
    }


def test_denied_role_cannot_upload_import() -> None:
    client, session = _client()
    _seed_identity(session, role=Role.VIEWER)
    _login(client)

    response = client.post(
        "/imports",
        files={"file": ("products.csv", b"supplier_sku,title,price,currency\nSKU-1,Trail Shoe,89.99,USD\n", "text/csv")},
    )

    assert response.status_code == 403


def test_catalog_manager_upload_creates_one_queued_import_with_an_outbox_record() -> None:
    client, session = _client()
    _seed_identity(session)
    _login(client)

    response = client.post(
        "/imports",
        files={
            "file": (
                "northstar-products.csv",
                b"supplier_sku,title,price,currency\nSKU-1,Trail Shoe,89.99,USD\n",
                "text/csv",
            )
        },
    )

    assert response.status_code == 202
    body = response.json()
    assert body["tenantId"] == "tenant_northstar"
    assert body["status"] == "queued"

    stored_import = session.scalar(select(import_models.CatalogImportModel))
    assert stored_import is not None
    assert stored_import.tenant_id == "tenant_northstar"
    assert stored_import.status == "queued"
    assert stored_import.artifact_key.endswith(stored_import.sha256)

    artifact = session.scalar(select(import_models.ImportArtifactModel))
    assert artifact is not None
    assert artifact.import_id == stored_import.id
    assert artifact.provider_version_id
    assert artifact.byte_size == 61

    audit_event = session.scalar(select(import_models.ImportLifecycleAuditEventModel))
    assert audit_event is not None
    assert audit_event.import_id == stored_import.id
    assert audit_event.event_type == "import_queued"

    outbox = session.scalar(select(import_models.ImportDispatchOutboxModel))
    assert outbox is not None
    assert outbox.import_id == stored_import.id
    assert outbox.tenant_id == "tenant_northstar"
    assert outbox.status == "pending"
