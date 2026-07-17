from pathlib import Path

from alembic.command import heads, upgrade
from alembic.config import Config


REPOSITORY_ROOT = Path(__file__).resolve().parents[5]
ALEMBIC_INI_PATH = REPOSITORY_ROOT / "apps" / "api" / "alembic.ini"


def get_alembic_config() -> Config:
    return Config(str(ALEMBIC_INI_PATH))


def validate_migrations() -> None:
    """Validate that Alembic can load the migration graph and render upgrade SQL."""
    config = get_alembic_config()
    heads(config, verbose=False)
    upgrade(config, "head", sql=True)


if __name__ == "__main__":
    validate_migrations()
