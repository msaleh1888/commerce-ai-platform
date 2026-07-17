# Database Migrations

Alembic migrations for the FastAPI service live here.

From the repository root:

```bash
COMMERCE_AI_DATABASE_URL=postgresql+psycopg://commerce_ai:commerce_ai@localhost:5432/commerce_ai \
python -m alembic -c apps/api/alembic.ini upgrade head
```

The first successful `upgrade head` creates Alembic's migration history table,
`alembic_version`, in PostgreSQL.
