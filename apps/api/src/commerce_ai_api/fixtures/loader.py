"""Load deterministic demo seed fixture data."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

DEMO_SEED_FIXTURE_NAME = "demo_catalog_seed"
REQUIRED_TENANT_NAMES = {"Northstar Retail"}


def default_demo_seed_path() -> Path:
    """Return the repository-local demo seed fixture path."""
    repository_root = Path(__file__).resolve().parents[5]
    return repository_root / "datasets" / "fixtures" / "demo_catalog_seed.json"


def load_demo_seed_fixture(path: Path | None = None) -> dict[str, Any]:
    """Load and minimally validate the demo seed fixture."""
    fixture_path = path or default_demo_seed_path()
    with fixture_path.open(encoding="utf-8") as fixture_file:
        fixture = json.load(fixture_file)

    if fixture.get("name") != DEMO_SEED_FIXTURE_NAME:
        raise ValueError(f"Expected fixture name {DEMO_SEED_FIXTURE_NAME!r}.")

    tenant_names = {tenant["name"] for tenant in fixture.get("tenants", [])}
    missing_tenants = REQUIRED_TENANT_NAMES - tenant_names
    if missing_tenants:
        missing = ", ".join(sorted(missing_tenants))
        raise ValueError(f"Missing required demo tenant names: {missing}.")

    for key in ("tenants", "users", "suppliers", "products", "review_cases"):
        if not isinstance(fixture.get(key), list):
            raise ValueError(f"Fixture key {key!r} must be a list.")

    return fixture


def summarize_seed_fixture(fixture: dict[str, Any]) -> dict[str, str | int]:
    """Return a stable, non-mutating seed summary."""
    return {
        "fixture": str(fixture["name"]),
        "tenants": len(fixture["tenants"]),
        "users": len(fixture["users"]),
        "suppliers": len(fixture["suppliers"]),
        "products": len(fixture["products"]),
        "review_cases": len(fixture["review_cases"]),
        "mode": "summary_only",
    }
