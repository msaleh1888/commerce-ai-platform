# ADR 0007: Architecture Governance and Canonical Boundaries

## Status

Accepted.

## Context

The platform already has decisions for its modular-monolith style, data authority, tenancy, asynchronous processing, approval boundary, and evaluation reproducibility. Without a canonical implementation structure and enforcement mechanism, future contributors or AI agents could implement those decisions through incompatible patterns: routes accessing persistence directly, worker tasks duplicating business workflows, cross-domain ORM imports, or unreviewed infrastructure and mutation paths.

The project needs a durable architecture contract that guides every milestone from M2 through the final release and converts important boundaries into automated checks.

## Decision

Adopt the architecture authority order and canonical implementation boundaries defined by:

- `docs/architecture/architecture-governance.md`
- `docs/architecture/final-target-architecture.md`
- `docs/architecture/canonical-backend-architecture.md`
- `docs/architecture/canonical-frontend-architecture.md`
- applicable domain contracts under `docs/architecture/`
- `docs/architecture/implementation-guide.md`

Use a domain-oriented backend structure. Routes/controllers, Celery tasks, agent tools, and MCP tools are adapters that invoke application use cases. Application use cases own business workflows and transaction boundaries. Repositories own tenant-scoped persistence access. Domains do not import another domain's persistence models or repositories.

Require an ADR before creating or changing a package pattern, dependency direction, storage authority, cross-domain contract, task execution pattern, mutation path, infrastructure component, or exception. Require architecture checks in CI and mandatory architecture instructions for AI agents and developers.

## Consequences

- M2 and later work must introduce domain code under the canonical package structure rather than extending global route/core modules.
- The worker and API share application use cases instead of developing separate business workflow implementations.
- Future architecture changes are slower to introduce but explicit, reviewable, and migratable.
- Static boundary checks initially cover direct route/task persistence access and cross-domain persistence imports; checks expand as real modules are added.
- The existing M1 health/readiness routes and worker health task remain infrastructure-only transitional code and are documented in the M1 conformance report.

## Migration Path

1. Keep M1 infrastructure code unchanged unless a boundary check identifies a violation.
2. Create M2 identity, tenancy, and app-shell features in the canonical package trees.
3. Add stronger architecture tests as repositories, use cases, and frontend features are introduced.
4. Refactor any transitional code only when its owning milestone begins or an enforced rule requires correction.

## Security and Tenant Impact

This decision reinforces ADR 0003. Protected repositories, tasks, retrieval, audit, agent, and MCP paths require explicit tenant scope. It also preserves ADR 0005 by requiring risky catalog mutations to pass through approval execution and audit.

## Verification

- `python tools/architecture/check_boundaries.py` passes.
- `tests/architecture/test_architecture_boundaries.py` passes.
- CI runs the boundary checker and architecture test suite on pull requests.
- The M1 conformance report identifies current transitional code and M2 entry criteria.
