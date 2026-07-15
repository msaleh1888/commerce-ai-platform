# Phase 0: Definition and Foundation

## Objective

Create the project skeleton and professional working agreements needed to build the MVP without drifting back into the full long-term scope too early.

## Deliverables

- Final or temporary project name.
- Repository structure.
- Backend, frontend, worker, and infrastructure skeleton.
- Docker Compose for PostgreSQL, Redis, Qdrant, API, worker, and web.
- CI skeleton.
- Formatting, linting, and test commands.
- Initial database migration setup.
- Seeded demo tenant and user plan.
- Initial ADRs.
- Evaluation manifest format.
- Small deterministic fixture dataset.

## Technical Decisions to Close

- Python dependency tool.
- Node/package manager.
- FastAPI project layout.
- SQLAlchemy or alternative persistence layer.
- Migration tool.
- Frontend component system.
- Authentication approach for MVP.
- Embedding provider and local test stub.
- Test database strategy.

## Suggested Task Breakdown

1. Create monorepo layout:
   - apps/api
   - apps/web
   - apps/worker
   - packages or app-internal modules
   - infrastructure/docker
   - datasets/fixtures
   - tests
2. Add backend health endpoint.
3. Add frontend app shell.
4. Add worker process with a no-op task.
5. Add Docker Compose services.
6. Add PostgreSQL migrations.
7. Add CI with formatting and minimal tests.
8. Add seed data command for demo tenant.
9. Add evaluation manifest schema.
10. Add README quickstart.

## Acceptance Criteria

- A developer can start local dependencies with Docker Compose.
- API health check responds.
- Web app loads.
- Worker can execute a test task.
- PostgreSQL migration command runs cleanly.
- CI runs at least one backend test and one frontend check.
- Initial ADRs are committed.
- MVP scope is documented and linked from README.

## Risks

- Spending too long on tooling before product value appears.
- Choosing stack pieces that slow down implementation.
- Adding observability or Kubernetes before the app has a core workflow.

## Exit Rule

Move to Phase 1 when the skeleton runs reliably and the team can add real domain features without redesigning the project layout.

