import subprocess
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from commerce_ai_api.db.base import Base
from commerce_ai_api.fixtures.loader import load_demo_seed_fixture, summarize_seed_fixture
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import UserRepository
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository
from commerce_ai_api.scripts.seed_demo import apply_identity_tenancy_seed
from commerce_ai_api.scripts.seed_demo import main, render_seed_summary

_ = (identity_models, tenancy_models)


def test_demo_seed_fixture_loads() -> None:
    fixture = load_demo_seed_fixture()

    assert fixture["name"] == "demo_catalog_seed"
    assert len(fixture["tenants"]) == 2
    assert len(fixture["users"]) == 4
    assert len(fixture["memberships"]) == 4
    assert len(fixture["sessions"]) == 0
    assert len(fixture["suppliers"]) == 2
    assert len(fixture["products"]) == 4
    assert len(fixture["review_cases"]) == 1


def test_demo_seed_fixture_contains_required_tenant_names() -> None:
    fixture = load_demo_seed_fixture()
    tenant_names = {tenant["name"] for tenant in fixture["tenants"]}

    assert "Northstar Retail" in tenant_names
    assert "Acme Outlet" in tenant_names


def test_seed_summary_is_produced() -> None:
    fixture = load_demo_seed_fixture()

    assert summarize_seed_fixture(fixture) == {
        "fixture": "demo_catalog_seed",
        "tenants": 2,
        "users": 4,
        "memberships": 4,
        "sessions": 0,
        "suppliers": 2,
        "products": 4,
        "review_cases": 1,
        "mode": "summary_only",
    }


def test_seed_summary_rendering_matches_console_output() -> None:
    summary = {
        "fixture": "demo_catalog_seed",
        "tenants": 2,
        "users": 4,
        "memberships": 4,
        "sessions": 0,
        "suppliers": 2,
        "products": 4,
        "review_cases": 1,
        "mode": "summary_only",
    }

    assert render_seed_summary(summary) == "\n".join(
        [
            "Loaded demo seed fixture: demo_catalog_seed",
            "tenants=2",
            "users=4",
            "memberships=4",
            "sessions=0",
            "suppliers=2",
            "products=4",
            "review_cases=1",
            "mode=summary_only",
        ]
    )


def test_seed_command_main_is_callable(capsys) -> None:
    exit_code = main([])

    assert exit_code == 0
    assert "Loaded demo seed fixture: demo_catalog_seed" in capsys.readouterr().out


def test_seed_module_is_callable() -> None:
    completed = subprocess.run(
        [sys.executable, "-m", "commerce_ai_api.scripts.seed_demo"],
        check=True,
        capture_output=True,
        text=True,
    )

    assert "tenants=2" in completed.stdout
    assert "mode=summary_only" in completed.stdout


def test_seed_apply_creates_identity_tenancy_records(tmp_path, monkeypatch) -> None:
    database_url = f"sqlite+pysqlite:///{tmp_path / 'seed.db'}"
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    monkeypatch.setenv("COMMERCE_AI_DEMO_SEED_PASSWORD", "local-only-test-password")

    summary = apply_identity_tenancy_seed(database_url)

    assert summary["mode"] == "applied_identity_tenancy"

    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    with session_factory() as session:
        nora = UserRepository(session).get_by_id("user_nora")
        nora_membership = MembershipRepository(session).get_active_for_user(
            tenant_id="tenant_northstar",
            user_id="user_nora",
        )

    assert nora is not None
    assert nora.password_hash.startswith("$argon2id$")
    assert nora_membership is not None
