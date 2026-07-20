# Architecture Implementation Standards

## Binding Rules

The words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are normative. This document is subordinate to accepted ADRs, [Final Target Architecture](final-target-architecture.md), and the canonical architecture documents. It cannot introduce a new architectural choice.

The canonical layer and enforcement rules are authorized by [ADR 0007](adr/0007-architecture-governance-and-canonical-boundaries.md).

When no approved rule applies, the implementer MUST stop and create or request an ADR. Convenience, speed, existing local code, and "good enough for now" are not valid reasons to create a new pattern.

## Backend

- A route/controller MUST validate transport input, resolve actor and tenant context, invoke one application use case, and translate known application errors to HTTP responses.
- A route/controller MUST NOT import a repository, ORM model, SQLAlchemy session, Celery task, provider SDK, or another domain's internal module.
- A use case/service MUST own one named business operation and its transaction boundary. It MAY call approved public contracts from other domains.
- A use case/service MUST NOT receive `Request`, `Response`, framework exceptions, or frontend types.
- A repository MUST own persistence queries for one aggregate/read model and MUST require `tenant_id` for protected data access.
- A repository MUST NOT contain authorization policy, HTTP behavior, task orchestration, model-provider calls, or cross-domain business workflow logic.
- Provider adapters such as object storage MUST live behind an approved application-facing contract. Routes, worker tasks, and frontend code MUST NOT call provider SDKs directly.
- Object storage MUST NOT be used as catalog metadata, import state, row outcome, audit, idempotency, authorization, or workflow authority. PostgreSQL remains authoritative for those records.
- ORM models MUST remain persistence mappings. Pydantic schemas/DTOs MUST be used across API, task, and domain-contract boundaries.
- A worker task MUST deserialize stable identifiers, tenant context, and operation ID; resolve a use case through the worker composition root; and call it.
- A worker task MUST NOT query repositories/ORM models directly or implement business transitions itself.
- Every durable state transition MUST have a named idempotency/operation key or a database constraint that makes duplicate effective execution impossible.

## Frontend

- Routes and layouts MUST compose feature modules; they MUST NOT contain feature API calls, workflow state machines, or reusable UI primitives.
- Features MUST own their API client functions, view models, hooks, feature components, and feature tests.
- Shared UI primitives MUST be accessible, presentational, and free of business/API imports.
- Browser authorization hints MAY improve UX but MUST NOT be treated as authorization.
- Every operations workflow MUST implement loading, empty, error, permission-denied, partial-success, retry, and audit/history states when applicable.
- AI-derived confidence, evidence, and uncertainty MUST be visible at the decision point. A proposal MUST NOT be presented as an applied catalog fact.

## Cross-cutting

- Protected persistence, retrieval, audit, task, agent, and MCP calls MUST carry tenant scope.
- Qdrant MUST contain derived projections only and MUST be rebuildable from PostgreSQL.
- Provider output MUST pass typed validation before it is persisted or displayed as a proposal.
- Risky catalog mutation MUST pass through the approval execution use case and create an audit event.
- Tests MUST cover behavior at the lowest meaningful layer plus the public contract where a boundary is crossed.
- A new dependency direction, public domain contract, task type, model provider, persistence store, or mutation path MUST have an approved architecture basis before code is added.

## Completion Requirement

Before declaring an implementation complete, an agent or developer MUST report:

1. The domain and canonical pattern used.
2. The controlling architecture document/ADR.
3. Tenant, authorization, idempotency, audit, and evaluation impact as applicable.
4. Tests and architecture checks run.
5. Any unresolved decision requiring an ADR.
