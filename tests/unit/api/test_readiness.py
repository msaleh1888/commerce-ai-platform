from fastapi.testclient import TestClient

from commerce_ai_api.main import create_app
from commerce_ai_api.core.config import Settings
from commerce_ai_api.core.readiness import collect_readiness_checks


def test_collect_readiness_checks_returns_ready_when_all_checks_pass() -> None:
    checks = {
        "database": lambda settings: None,
        "redis": lambda settings: None,
    }

    results, is_ready = collect_readiness_checks(Settings(), checks)

    assert is_ready is True
    assert results == {
        "database": "ready",
        "redis": "ready",
    }


def test_collect_readiness_checks_returns_not_ready_when_check_fails() -> None:
    def failing_check(settings: Settings) -> None:
        raise RuntimeError("service unavailable")

    checks = {
        "database": lambda settings: None,
        "redis": failing_check,
    }

    results, is_ready = collect_readiness_checks(Settings(), checks)

    assert is_ready is False
    assert results == {
        "database": "ready",
        "redis": "unavailable",
    }


def test_readiness_endpoint_returns_ready(monkeypatch) -> None:
    def fake_collect_readiness_checks(settings: Settings):
        return {"database": "ready", "redis": "ready"}, True

    monkeypatch.setattr(
        "commerce_ai_api.api.routes.readiness.collect_readiness_checks",
        fake_collect_readiness_checks,
    )
    client = TestClient(create_app())

    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "checks": {"database": "ready", "redis": "ready"},
    }


def test_readiness_endpoint_returns_service_unavailable(monkeypatch) -> None:
    def fake_collect_readiness_checks(settings: Settings):
        return {"database": "ready", "redis": "unavailable"}, False

    monkeypatch.setattr(
        "commerce_ai_api.api.routes.readiness.collect_readiness_checks",
        fake_collect_readiness_checks,
    )
    client = TestClient(create_app())

    response = client.get("/ready")

    assert response.status_code == 503
    assert response.json() == {
        "status": "not_ready",
        "checks": {"database": "ready", "redis": "unavailable"},
    }
