# Commerce AI Platform

Commerce AI Platform is a portfolio SaaS project for multi-tenant commerce operations. The MVP focuses on importing messy supplier catalogs, normalizing and indexing product data, evaluating search quality, detecting duplicate products, and routing risky catalog changes through human approval.

## Project Status

The repository is in Milestone M1: Technical Foundation. Current work is limited to the project foundation and does not include M2 UI polish or production-ready runtime code yet.

## Repository Layout

```text
apps/
  api/                 FastAPI service
  web/                 Next.js web app
  worker/              Celery worker
infrastructure/
  docker/              Dockerfiles and local runtime docs
datasets/
  fixtures/            Deterministic demo and evaluation fixtures
tests/
  unit/                Fast, isolated tests
  integration/         Service and database integration tests
  e2e/                 Browser and workflow smoke tests
  evaluation/          Retrieval and matching evaluation smoke tests
docs/                  Product, UX, architecture, and planning docs
```

Empty milestone directories contain `.gitkeep` files so the intended structure is tracked before framework code is introduced.

## Local API Development

The API skeleton can run locally from the repository root:

```bash
python -m pip install -e ".[dev]"
python -m uvicorn commerce_ai_api.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Run the current API test:

```bash
python -m pytest tests/unit/api
```

Run PostgreSQL migrations:

```bash
COMMERCE_AI_DATABASE_URL=postgresql+psycopg://commerce_ai:commerce_ai@localhost:5432/commerce_ai \
python -m alembic -c apps/api/alembic.ini upgrade head
```

Validate migrations without a running database, suitable for CI:

```bash
python -m alembic -c apps/api/alembic.ini upgrade head --sql
```

Preview the demo seed fixture without writing to services:

```bash
python -m commerce_ai_api.scripts.seed_demo
```

After installing the project in editable mode, the console script is also available:

```bash
commerce-ai-seed-demo
```

## Local Web Development

The web skeleton can run locally from the web app directory:

```bash
cd apps/web
npm install
npm run dev
```

Run the current web checks:

```bash
npm run typecheck
npm run build
```

## Local Worker Development

The worker skeleton can run locally from the repository root:

```bash
python -m pip install -e ".[dev]"
python -m celery -A commerce_ai_worker.celery_app:celery_app worker --loglevel=INFO
```

With Redis running, enqueue the health task from another terminal:

```bash
python -m commerce_ai_worker.scripts.smoke_health
```

Until the Docker Compose runtime is added in M1-05, the same task can be smoke-tested inline:

```bash
$env:COMMERCE_AI_WORKER_TASK_ALWAYS_EAGER="true"
python -m commerce_ai_worker.scripts.smoke_health
```

Worker settings use the `COMMERCE_AI_WORKER_` environment variable prefix and are documented in [apps/worker/README.md](apps/worker/README.md).

## Local Docker Runtime

The full M1 runtime can start PostgreSQL, Redis, Qdrant, API, worker, and web services:

```bash
docker compose up --build
```

Run database migrations explicitly after PostgreSQL is healthy:

```bash
docker compose run --rm api python -m alembic -c apps/api/alembic.ini upgrade head
```

Smoke checks:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl http://localhost:3000
curl http://localhost:6333/readyz
docker compose run --rm worker python -m commerce_ai_worker.scripts.smoke_health
```

Stop services:

```bash
docker compose down
```

## CI

GitHub Actions runs on pull requests. The CI skeleton validates the current M1 foundation with:

```bash
python -m pytest tests/unit/api tests/unit/worker
python -m alembic -c apps/api/alembic.ini upgrade head --sql
docker compose config --quiet
cd apps/web && npm run typecheck
cd apps/web && npm run build
```

## MVP Architecture Direction

The project starts as a modular monolith with separate deployable processes:

- `web`: Next.js frontend.
- `api`: FastAPI HTTP API.
- `worker`: Celery worker for ingestion, indexing, matching, and evaluation jobs.
- `migration`: one-shot database migration command.

PostgreSQL is the source of truth, Qdrant is a derived retrieval index, and Redis supports queues, locks, and short-lived coordination. AI-assisted outputs are treated as proposals or derived signals; human approval remains the boundary for risky catalog mutations.

## Planning References

- [MVP backlog](docs/planning/mvp-backlog.md)
- [Project roadmap](docs/planning/project-roadmap.md)
- [MVP scope](docs/mvp-scope.md)
- [Architecture overview](docs/architecture/overview.md)
- [v0 design capture](docs/ux/v0-design-capture.md)

## Next Foundation Issues

M1 continues with CI and the fixture data plan with seed command stub.
