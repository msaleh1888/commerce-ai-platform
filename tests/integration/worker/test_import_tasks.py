from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from commerce_ai_api.api.dependencies.auth import get_db_session
from commerce_ai_api.db.base import Base
from commerce_ai_api.main import create_app
from commerce_ai_api.modules.catalog.infrastructure.persistence import models as catalog_models
from commerce_ai_api.modules.catalog_ingestion.infrastructure.persistence import models as import_models
from commerce_ai_api.modules.identity.domain.entities import User
from commerce_ai_api.modules.identity.domain.passwords import hash_password
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import UserRepository
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository
from commerce_ai_worker.core.config import get_worker_settings
from commerce_ai_worker.tasks.imports import process_import


_ = (catalog_models, identity_models, import_models, tenancy_models)
_NOW = datetime(2026, 7, 20, tzinfo=UTC)
_PASSWORD = "local-only-test-password"


def _client(database_url: str) -> tuple[TestClient, Session]:
    engine = create_engine(database_url)
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


def test_process_import_completes_one_tenant_scoped_supplier_product_on_duplicate_delivery(tmp_path, monkeypatch) -> None:
    database_url = f"sqlite+pysqlite:///{tmp_path / 'worker-import.db'}"
    monkeypatch.setenv("COMMERCE_AI_WORKER_DATABASE_URL", database_url)
    get_worker_settings.cache_clear()
    client, session = _client(database_url)
    _seed_identity(session)
    login = client.post("/auth/login", json={"email": "nora.manager@northstar.example", "password": _PASSWORD})
    assert login.status_code == 200
    upload = client.post(
        "/imports",
        files={
            "file": (
                "northstar-products.csv",
                b"supplier_sku,title,brand,category,price,currency,gtin,mpn\n"
                b"SKU-1,Trail Shoe,Northstar,Footwear,89.99,USD,1234567890123,MPN-1\n",
                "text/csv",
            )
        },
    )
    assert upload.status_code == 202
    import_id = upload.json()["id"]
    stored_import = session.get(import_models.CatalogImportModel, import_id)
    assert stored_import is not None

    first = process_import.run(
        import_id=import_id,
        tenant_id="tenant_northstar",
        operation_id=stored_import.operation_id,
        correlation_id=stored_import.correlation_id,
    )
    second = process_import.run(
        import_id=import_id,
        tenant_id="tenant_northstar",
        operation_id=stored_import.operation_id,
        correlation_id=stored_import.correlation_id,
    )

    assert first == {"importId": import_id, "tenantId": "tenant_northstar", "status": "completed", "acceptedCount": 1}
    assert second == first
    assert session.scalar(select(func.count()).select_from(catalog_models.SupplierProductModel)) == 1
    assert session.scalar(
        select(func.count()).select_from(import_models.ImportLifecycleAuditEventModel).where(
            import_models.ImportLifecycleAuditEventModel.event_type == "import_completed"
        )
    ) == 1
    product = session.scalar(select(catalog_models.SupplierProductModel))
    assert product is not None
    assert product.tenant_id == "tenant_northstar"
    assert product.supplier_sku == "SKU-1"
    assert product.raw_source["mpn"] == "MPN-1"
    assert product.provenance["mappingVersion"] == "m3_supplier_v1"
