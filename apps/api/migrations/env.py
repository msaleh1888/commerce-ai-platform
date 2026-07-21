from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from commerce_ai_api.core.config import get_settings
from commerce_ai_api.db.base import Base
from commerce_ai_api.modules.catalog.infrastructure.persistence import models as catalog_models
from commerce_ai_api.modules.catalog_ingestion.infrastructure.persistence import models as import_models
from commerce_ai_api.modules.identity.infrastructure.persistence import models as identity_models
from commerce_ai_api.modules.tenancy.infrastructure.persistence import models as tenancy_models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

_ = (catalog_models, import_models, identity_models, tenancy_models)

target_metadata = Base.metadata


def get_database_url() -> str:
    x_argument_url = context.get_x_argument(as_dictionary=True).get("database_url")
    return x_argument_url or get_settings().database_url


def run_migrations_offline() -> None:
    context.configure(
        url=get_database_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_database_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
