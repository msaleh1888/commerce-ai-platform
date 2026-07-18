# Architecture Overview

## Architecture Contract

The approved architecture is a modular monolith with separate web, API, worker, and migration runtimes. This page is an orientation map only. Binding implementation rules live in:

- [Architecture Governance](architecture-governance.md)
- [Final Target Architecture](final-target-architecture.md)
- [Canonical Backend Architecture](canonical-backend-architecture.md)
- [Canonical Frontend Architecture](canonical-frontend-architecture.md)
- [Architecture Implementation Standards](implementation-guide.md)

Every implementation must also follow the relevant domain contract and accepted ADRs.

The governing adoption decision is [ADR 0007](adr/0007-architecture-governance-and-canonical-boundaries.md).

## MVP System Diagram

```mermaid
flowchart TD
    UI["Next.js web app"] --> API["FastAPI API"]
    API --> PG["PostgreSQL source of truth"]
    API --> Redis["Redis broker/cache"]
    API --> Q["Qdrant derived retrieval index"]
    API --> Celery["Celery queues"]
    Celery --> Worker["Worker process"]
    Worker --> PG
    Worker --> Q
    Worker --> Models["Embedding/model provider"]
    API --> Logs["Structured logs and basic metrics"]
    Worker --> Logs
```

## Deployable Processes

- web: Next.js frontend.
- api: FastAPI HTTP application.
- worker: Celery worker for ingestion, indexing, matching, and evaluation jobs.
- scheduler: optional Celery Beat process for scheduled evaluation or maintenance.
- migration: one-shot database migration command.

## Canonical Domain Modules

- identity: users, credentials, sessions.
- tenancy: tenants, memberships, roles, tenant context.
- catalog_ingestion: sources, imports, rows, artifacts, content hashes, state.
- normalization: transformation rules and outcomes.
- catalog: supplier products, canonical products, variants, provenance.
- retrieval: projections, indexing, lexical/dense/hybrid search, evidence.
- matching: duplicate candidates, signals, confidence.
- review: review cases and decisions.
- approval: authorized risky mutation execution and idempotency.
- audit: append-only product audit events.
- evaluation: manifests, runs, metrics, artifacts.
- ai: provider adapters and validated proposals.
- observability: correlation, telemetry, redaction policy.

## Source of Truth

PostgreSQL owns business state. Qdrant stores derived retrieval records and can be rebuilt from PostgreSQL. Redis is used for queueing, locks, and short-lived coordination, not authoritative business state.

## Data Flow

1. User submits catalog import through the web app.
2. API validates request, records import metadata, and enqueues work.
3. Worker parses rows, validates schema, stores raw and normalized product data.
4. Worker generates retrieval records and writes them to Qdrant after PostgreSQL commits.
5. Worker generates duplicate candidates and review cases.
6. User searches products through the API; retrieval is tenant-filtered.
7. User reviews duplicate cases and approves or rejects proposed changes.
8. API executes approved mutations transactionally and records audit events.
9. Evaluation jobs compare retrieval/matching configurations against frozen manifests.

## Tenant Isolation Strategy

Every protected table includes tenant ownership directly or through a parent entity. All repository methods require tenant scope. Retrieval payloads include tenant_id, and search queries must include tenant filters. Worker payloads carry tenant context and are revalidated before state changes.

## AI Boundary

AI components may assist with embeddings, similarity, recommendations, explanations, or later agent proposals. They do not own permissions, identity, state transitions, prices, or final catalog mutation authority. Structured AI output must be validated before use.

## MVP Observability

The MVP begins with structured logs, health checks, task status, and basic metrics hooks. Full OpenTelemetry, Prometheus, Grafana, and Langfuse are deferred until core workflows work.

## Domain Contracts

- [Catalog Ingestion Contract](catalog-ingestion-contract.md)
- [Retrieval and Indexing Contract](retrieval-and-indexing-contract.md)
- [Duplicate Review and Approval Contract](duplicate-review-and-approval-contract.md)
- [Evaluation Contract](evaluation-contract.md)
- [AI, Agent, and MCP Contract](ai-agent-and-mcp-contract.md)
- [Observability and Operations Contract](observability-and-operations-contract.md)
