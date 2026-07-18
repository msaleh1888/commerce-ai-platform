# M1 Architecture Conformance

## Scope

Reviewed foundation: API skeleton, web skeleton, worker skeleton, migrations, Docker Compose runtime, CI, and fixture/seed groundwork.

## Conformance

| Area | Status | Required follow-up |
| --- | --- | --- |
| Process separation | Conformant | API, web, worker, migration command, PostgreSQL, Redis, and Qdrant have separate runtime roles. |
| Modular domains | Transitional | M1 has no business domains yet. M2+ MUST introduce code below `commerce_ai_api.modules.<domain>` rather than expanding global route/core packages. |
| Routes/services/repositories | Transitional | Existing health/readiness routes are infrastructure endpoints and may remain simple. First protected business route MUST follow canonical route-to-use-case structure. |
| Worker boundary | Transitional | Health task is infrastructure-only. First business task MUST call a domain application use case. |
| Tenant isolation | Not implemented | M2 must establish actor/tenant dependencies, tenant-scoped persistence, and cross-tenant tests before protected catalog work. |
| PostgreSQL/Qdrant authority | Conformant foundation | Compose and migration foundation exist; M3-M5 must add durable state/projection lifecycle and reindex tests. |
| Approval/audit/evaluation | Not implemented | Required in M3-M6 as their owning domains begin. |
| Frontend structure | Transitional | Current app-shell skeleton may remain. M2 MUST introduce `(app)` routes, feature modules, shared UI primitives, and typed API client boundaries. |
| Observability | Transitional | Health/readiness exists. Structured correlation, metrics, traces, and operations evidence follow the roadmap. |

## Required M2 Entry Criteria

Before an identity, tenancy, or app-shell feature merges, the project MUST have the canonical package scaffolding for its affected domain, tenant-isolation test helpers, architecture boundary checks passing, and the agent enforcement files in place.
