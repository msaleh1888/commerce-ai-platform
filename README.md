# Commerce AI Platform

Commerce AI Platform is a portfolio SaaS project for multi-tenant commerce operations. The MVP focuses on importing messy supplier catalogs, normalizing and indexing product data, evaluating search quality, detecting duplicate products, and routing risky catalog changes through human approval.

## Project Status

The repository is in Milestone M1: Technical Foundation. Current work is limited to the project foundation and does not include M2 UI polish or production-ready runtime code yet.

## Repository Layout

```text
apps/
  api/                 FastAPI service skeleton, added in M1-02
  web/                 Next.js web app skeleton, added in M1-03
  worker/              Celery worker skeleton, added in M1-04
infrastructure/
  docker/              Docker and local runtime support, expanded in M1-05
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

M1 continues with the FastAPI skeleton, Next.js skeleton, Celery worker skeleton, Docker Compose runtime, database migrations, CI, and fixture seed command stub.
