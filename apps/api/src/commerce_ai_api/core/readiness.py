from collections.abc import Callable

from redis import Redis
from sqlalchemy import create_engine, text

from commerce_ai_api.core.config import Settings


def check_database(settings: Settings) -> None:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    finally:
        engine.dispose()


def check_redis(settings: Settings) -> None:
    client = Redis.from_url(
        settings.redis_url,
        socket_connect_timeout=2,
        socket_timeout=2,
    )
    client.ping()


def collect_readiness_checks(
    settings: Settings,
    checks: dict[str, Callable[[Settings], None]] | None = None,
) -> tuple[dict[str, str], bool]:
    checks = checks or {
        "database": check_database,
        "redis": check_redis,
    }
    results: dict[str, str] = {}

    for name, check in checks.items():
        try:
            check(settings)
        except Exception:
            results[name] = "unavailable"
        else:
            results[name] = "ready"

    return results, all(status == "ready" for status in results.values())
