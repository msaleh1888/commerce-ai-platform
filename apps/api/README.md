# API

FastAPI service for the commerce AI platform.

## Local Development

From the repository root:

```bash
python -m pip install -e ".[dev]"
python -m uvicorn commerce_ai_api.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Run API tests:

```bash
python -m pytest tests/unit/api
```

Configuration is loaded from environment variables with the `COMMERCE_AI_` prefix. See `.env.example` for local defaults.

## Database Migrations

Migrations use Alembic and read the PostgreSQL connection string from
`COMMERCE_AI_DATABASE_URL`.

Run migrations against a local PostgreSQL database:

```bash
COMMERCE_AI_DATABASE_URL=postgresql+psycopg://commerce_ai:commerce_ai@localhost:5432/commerce_ai \
python -m alembic -c apps/api/alembic.ini upgrade head
```

The first successful run creates Alembic's migration history table,
`alembic_version`.

Validate the migration graph without connecting to PostgreSQL:

```bash
python -m alembic -c apps/api/alembic.ini upgrade head --sql
```

The same validation is available as a console script after installation:

```bash
commerce-ai-validate-migrations
```
