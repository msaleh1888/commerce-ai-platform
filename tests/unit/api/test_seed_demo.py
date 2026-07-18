import subprocess
import sys

from commerce_ai_api.fixtures.loader import load_demo_seed_fixture, summarize_seed_fixture
from commerce_ai_api.scripts.seed_demo import main, render_seed_summary


def test_demo_seed_fixture_loads() -> None:
    fixture = load_demo_seed_fixture()

    assert fixture["name"] == "demo_catalog_seed"
    assert len(fixture["tenants"]) == 2
    assert len(fixture["users"]) == 2
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
        "users": 2,
        "suppliers": 2,
        "products": 4,
        "review_cases": 1,
        "mode": "summary_only",
    }


def test_seed_summary_rendering_matches_console_output() -> None:
    summary = {
        "fixture": "demo_catalog_seed",
        "tenants": 2,
        "users": 2,
        "suppliers": 2,
        "products": 4,
        "review_cases": 1,
        "mode": "summary_only",
    }

    assert render_seed_summary(summary) == "\n".join(
        [
            "Loaded demo seed fixture: demo_catalog_seed",
            "tenants=2",
            "users=2",
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
