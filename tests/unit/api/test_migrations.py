from alembic.script import ScriptDirectory

from commerce_ai_api.core.config import Settings
from commerce_ai_api.db.migrations import get_alembic_config, validate_migrations


def test_database_url_is_environment_driven(monkeypatch) -> None:
    expected_url = "postgresql+psycopg://user:pass@db:5432/commerce_ai_test"
    monkeypatch.setenv("COMMERCE_AI_DATABASE_URL", expected_url)

    assert Settings().database_url == expected_url


def test_runtime_service_urls_are_environment_driven(monkeypatch) -> None:
    monkeypatch.setenv("COMMERCE_AI_REDIS_URL", "redis://redis:6379/0")
    monkeypatch.setenv("COMMERCE_AI_QDRANT_URL", "http://qdrant:6333")

    settings = Settings()

    assert settings.redis_url == "redis://redis:6379/0"
    assert settings.qdrant_url == "http://qdrant:6333"


def test_alembic_has_single_current_head() -> None:
    script_directory = ScriptDirectory.from_config(get_alembic_config())

    assert script_directory.get_heads() == ["20260718_0002"]


def test_migrations_validate_without_database_connection() -> None:
    validate_migrations()
