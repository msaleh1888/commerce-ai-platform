from commerce_ai_worker.core.config import get_worker_settings
from commerce_ai_worker.tasks.health import health_check


def test_health_check_returns_worker_status() -> None:
    get_worker_settings.cache_clear()

    assert health_check.run() == {
        "status": "healthy",
        "service": "Commerce AI Worker",
        "environment": "local",
    }
