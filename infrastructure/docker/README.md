# Docker Runtime

Local Docker Compose runtime for the M1 technical foundation.

## Services

- `postgres`: PostgreSQL source of truth.
- `redis`: Celery broker and result backend.
- `qdrant`: Derived vector index service.
- `api`: FastAPI service.
- `worker`: Celery worker.
- `web`: Next.js web app.

## Start

From the repository root:

```bash
docker compose up --build -d
```

Run migrations explicitly after PostgreSQL is healthy:

```bash
docker compose run --rm api python -m alembic -c apps/api/alembic.ini upgrade head
```

Apply the deterministic M2 identity and tenancy seed:

```powershell
$env:COMMERCE_AI_DEMO_SEED_PASSWORD = "<choose-a-local-demo-password>"
docker compose run --rm -e COMMERCE_AI_DEMO_SEED_PASSWORD api python -m commerce_ai_api.scripts.seed_demo --apply
```

The local password is not part of the fixture or repository. It applies to all seeded users, including `nora.manager@northstar.example`, and an existing seeded user's password remains unchanged on repeat runs.

## Smoke Checks

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl http://localhost:3000
curl http://localhost:6333/readyz
docker compose run --rm worker python -m commerce_ai_worker.scripts.smoke_health
```

## Stop

```bash
docker compose down
```

Remove local data volumes:

```bash
docker compose down -v
```
