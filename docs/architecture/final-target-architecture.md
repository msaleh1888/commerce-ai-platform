# Final Target Architecture

## Status and Authority

This is the approved target architecture for the final platform release. It describes the intended end state and the permitted path toward it. It is not a record of only what exists today.

Authority is defined in [Architecture Governance](architecture-governance.md). Implementation details are binding only when they comply with this document, the accepted ADRs, and the canonical architecture documents.

## Architectural Style

The platform is a modular monolith with separate runtime processes. The business system remains one deployable codebase and one transactional source of truth while its web, API, worker, migration, and later agent/MCP gateway processes scale and deploy independently.

Microservices are not an implementation option unless an ADR proves a module needs independent scaling, release cadence, security isolation, or ownership. A service extraction MUST preserve its module contract, tenant boundary, audit semantics, and migration/recovery path.

## Final Runtime Topology

```text
Next.js web
    | REST/JSON, authenticated session
    v
FastAPI API ---------------------> PostgreSQL (authoritative state)
    |                                  |
    |                                  +-- tenants, catalog, reviews, approvals,
    |                                      audit, workflow status, evaluations
    +------------------------------> Redis (broker, result backend, short-lived locks)
    +------------------------------> Qdrant (derived retrieval projection)
    +------------------------------> S3-compatible object storage
                                      (immutable original upload artifacts)
    +------------------------------> model-provider adapters
    +------------------------------> telemetry exporters

Celery worker -------------------> application use cases only
    |                                  |
    +-- ingestion, normalization,      +-- durable status and idempotency state
        indexing, matching, evaluation

Later MCP/agent gateway --------> authorized API/application use cases only
```

## Component Responsibilities

| Component | Owns | Must not own |
| --- | --- | --- |
| Web | presentation, interaction state, route composition, accessible operational workflows | authorization decisions, durable workflow state, business mutation logic |
| API | HTTP contract, authentication resolution, authorization entry point, use-case invocation | direct UI state, long-running processing, unscoped persistence access |
| Worker | task delivery, retry policy, durable asynchronous use-case invocation | alternate business workflows, direct domain-table mutation |
| PostgreSQL | authoritative business state, constraints, idempotency records, workflow states, audit, evaluation runs | disposable cache or vector-only state |
| Redis | broker/backend and short-lived coordination | authoritative catalog, approval, audit, or tenant state |
| Qdrant | tenant-filtered vector projections and retrieval scores | canonical product state or approval state |
| Object storage | immutable original upload artifacts and large evaluation artifacts through the ADR 0009 S3-compatible adapter | catalog metadata, import state, row outcomes, idempotency, audit, authorization, or mutable workflow authority |
| Model adapters | validated calls for embeddings and structured proposals | direct persistence mutation or authorization |
| Agent/MCP gateway | governed tool adapters, budgets, checkpoints, audit correlation | bypassing API/use cases, direct database access |

## Domains and Ownership

The canonical backend domains are `identity`, `tenancy`, `catalog_ingestion`, `normalization`, `catalog`, `retrieval`, `matching`, `review`, `approval`, `audit`, `evaluation`, `ai`, and `observability`.

| Domain | Owns records and rules | May depend on |
| --- | --- | --- |
| identity | users, credentials, sessions | tenancy contracts |
| tenancy | tenants, memberships, roles, tenant context | identity contracts |
| catalog_ingestion | sources, imports, rows, content hashes, import state machine | tenancy, normalization and catalog use-case contracts |
| normalization | source-to-normalized transformation rules and outcomes | no catalog persistence |
| catalog | supplier products, canonical products, variants, product provenance | tenancy contracts |
| retrieval | lexical query composition, index projections, fusion, search evidence | catalog read contracts, AI embedding contracts |
| matching | duplicate signals, candidate evidence, confidence | catalog read contracts, retrieval and AI contracts |
| review | review cases and reviewer decisions before execution | matching contracts, approval contracts |
| approval | authorized execution of risky mutations and operation idempotency | catalog mutation contracts, audit contracts |
| audit | append-only product audit events | public domain event contracts |
| evaluation | manifests, datasets, run records, metrics, artifacts | retrieval, matching, AI public contracts |
| ai | provider adapters, structured output validation, prompt/config metadata | no business persistence |
| observability | telemetry correlation and redaction policy | public domain event contracts |

A domain MUST NOT import another domain's ORM models or repositories. Cross-domain collaboration occurs through public application contracts, typed domain events, or read models expressly exposed by the owning domain.

## Trust and Data Boundaries

### Authority

PostgreSQL is the source of truth. Each protected business record MUST contain `tenant_id`. Constraints, transactions, foreign keys, and unique indexes enforce invariants that code must not reimplement inconsistently.

Object storage stores immutable bytes only under [ADR 0009](adr/0009-s3-compatible-import-artifact-storage.md). PostgreSQL stores authoritative artifact metadata, content hashes, import state, row outcomes, idempotency, audit, and references.

Qdrant, Redis, caches, task results, model output, object storage metadata, and browser state are non-authoritative for business state. Qdrant projections MUST be rebuilt from PostgreSQL. No repair operation may use Qdrant or object storage alone to overwrite catalog state.

### Tenant isolation

Tenant scope is created by an authenticated API dependency or durable worker payload, then required in every protected use case, repository query, task, Qdrant filter, audit lookup, evaluation run, agent tool, and MCP tool. A missing tenant scope is an error. Global access requires an ADR-defined, audited administrative capability.

### Untrusted input

Supplier files, browser requests, model output, retrieved content, and MCP arguments are untrusted. Each boundary validates typed input, limits size and shape, redacts sensitive data, and records safe provenance. Model output cannot directly mutate catalog state.

## Workflow Contracts

### Ingestion

`POST import` records an import intent and content hash in PostgreSQL, stores the original artifact through the approved S3-compatible adapter, records artifact metadata, then enqueues a task using only durable IDs and tenant context. The task invokes the ingestion use case, which transitions durable state, records row outcomes, and schedules downstream work. A retry reads current PostgreSQL state, verifies immutable artifact bytes by hash/size when needed, and produces no duplicate effective product changes.

### Indexing and search

An indexing use case projects eligible catalog records into Qdrant with `tenant_id`, product ID, provenance references, and index version. PostgreSQL records projection status. Lexical, dense, and hybrid queries are separate implementations behind one retrieval contract; hybrid fusion is deterministic and configuration-versioned. All retrieval filters are applied inside the underlying query.

### Matching and approval

Matching creates candidates and evidence only. Review records a human decision. Approval execution is the sole use case permitted to perform a risky catalog mutation; it uses a durable operation ID, transaction, authorization check, and audit event. A duplicate delivery or retry returns the original effective outcome rather than repeating it.

### Evaluation

Evaluation executes from a frozen manifest and creates a durable run record containing dataset/version, labels, metrics, retrieval configuration, model and index versions, application commit, artifacts, and result status. Retrieval, matching, generation, agent, and memory evaluations remain separate run types.

## Deployment and Operations

Compose is the required local topology. CI validates code, architecture boundaries, migrations, and container configuration. The final release candidate deploys web, API, workers, a migration job, PostgreSQL-compatible storage, Redis-compatible queue, Qdrant-compatible retrieval, and object storage to Kubernetes with readiness/liveness probes, resource requests/limits, secret management, backups, restore testing, reindexing, and failure recovery exercises.

Structured logs and correlation IDs are required foundation behavior. OpenTelemetry, metrics, dashboards, alerts, and optional AI tracing become production-release requirements. Telemetry does not replace product audit events.

## Milestone Adoption

| Milestones | Required architecture adoption |
| --- | --- |
| M1 | runnable process boundaries, migrations, local runtime, CI, seed/fixture conventions |
| M2 | identity/tenancy contracts, app shell boundaries, tenant-isolation tests |
| M3-M4 | ingestion and catalog modules, worker/service contract, state machines, audit events, lexical retrieval |
| M5-M6 | Qdrant projection lifecycle, retrieval/matching evaluations, review and approval execution |
| M7 | reproducible demo evidence and portfolio release quality gates |
| M8-M10 | bounded agents, MCP adapters, memory provenance and evaluation |
| M11-M12 | telemetry, resilience, Kubernetes and recovery evidence |

No milestone may bypass a required boundary because the supporting implementation is inconvenient. The missing supporting work becomes a dependency or an ADR decision.
