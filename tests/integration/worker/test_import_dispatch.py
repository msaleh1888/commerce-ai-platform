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
from commerce_ai_api.modules.catalog_ingestion.application.use_cases import DispatchPendingImportOutbox
from commerce_ai_api.modules.catalog_ingestion.infrastructure.persistence import models as import_models
from commerce_ai_api.modules.catalog_ingestion.infrastructure.persistence.repositories import CatalogImportRepository
from commerce_ai_api.modules.identity.domain.entities import User
from commerce_ai_api.modules.identity.domain.passwords import hash_password
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import UserRepository
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository


_ = (identity_models, import_models, tenancy_models)
_NOW = datetime(2026, 7, 20, tzinfo=UTC)
_PASSWORD = "local-only-test-password"


class RecordingPublisher:
    def __init__(self, *, fail: bool = False) -> None:
        self.fail = fail
        self.payloads: list[dict[str, str]] = []

    def publish_process_import(
        self, *, import_id: str, tenant_id: str, operation_id: str, correlation_id: str
    ) -> None:
        if self.fail:
            raise RuntimeError("broker unavailable")
        self.payloads.append(
            {
                "import_id": import_id,
                "tenant_id": tenant_id,
                "operation_id": operation_id,
                "correlation_id": correlation_id,
            }
        )


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


def _seed_identity(session: Session) -> None:
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
            role=Role.CATALOG_MANAGER,
            is_active=True,
            created_at=_NOW,
        ),
        tenant_id="tenant_northstar",
    )
    session.commit()


def _queued_import(client: TestClient, session: Session) -> import_models.ImportDispatchOutboxModel:
    _seed_identity(session)
    login = client.post("/auth/login", json={"email": "nora.manager@northstar.example", "password": _PASSWORD})
    assert login.status_code == 200
    upload = client.post(
        "/imports",
        files={
            "file": (
                "northstar-products.csv",
                b"supplier_sku,title,price,currency\nSKU-1,Trail Shoe,89.99,USD\n",
                "text/csv",
            )
        },
    )
    assert upload.status_code == 202
    outbox = session.scalar(select(import_models.ImportDispatchOutboxModel))
    assert outbox is not None
    return outbox


def test_dispatcher_leaves_pending_on_broker_failure_and_marks_successful_dispatch() -> None:
    client, session = _client()
    outbox = _queued_import(client, session)

    failing_dispatcher = DispatchPendingImportOutbox(CatalogImportRepository(session), RecordingPublisher(fail=True))
    failed = failing_dispatcher.execute(tenant_id="tenant_northstar")

    session.refresh(outbox)
    assert failed.dispatched_count == 0
    assert failed.pending_count == 1
    assert outbox.status == "pending"
    assert outbox.dispatched_at is None

    publisher = RecordingPublisher()
    dispatched = DispatchPendingImportOutbox(CatalogImportRepository(session), publisher).execute(
        tenant_id="tenant_northstar"
    )

    session.refresh(outbox)
    assert dispatched.dispatched_count == 1
    assert dispatched.pending_count == 0
    assert outbox.status == "dispatched"
    assert outbox.dispatched_at is not None
    assert publisher.payloads == [
        {
            "import_id": outbox.import_id,
            "tenant_id": "tenant_northstar",
            "operation_id": outbox.operation_id,
            "correlation_id": outbox.correlation_id,
        }
    ]
