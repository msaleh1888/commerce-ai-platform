# ADR 0009: S3-Compatible Import Artifact Storage

## Status

Accepted for M3.

## Context

M3 catalog import must preserve immutable original upload bytes so imports, retries, duplicate detection, row provenance, evidence bundles, and later audits can prove what was processed. The existing architecture already makes PostgreSQL the source of truth and names object storage for original upload artifacts, but implementation work needs a precise storage decision before any catalog-import code is added.

The decision must preserve:

- [ADR 0002](0002-postgres-source-of-truth-qdrant-derived-index.md): PostgreSQL is authoritative business state.
- [ADR 0003](0003-shared-schema-multi-tenancy.md): protected records are tenant-scoped.
- [ADR 0004](0004-celery-idempotent-processing.md): worker delivery is at least once and must be idempotent.
- [ADR 0006](0006-versioned-evaluation-manifests.md): evidence and artifacts are versioned and reproducible.
- [ADR 0007](0007-architecture-governance-and-canonical-boundaries.md): new infrastructure and storage authority require an ADR.
- [ADR 0008](0008-application-managed-demo-auth-and-active-tenant-context.md): API authorization resolves actor, role, and active tenant before protected operations.

This ADR does not choose Open Icecat licence terms, access paths, corpus sizes, acceptance thresholds, or acquired artifact locations. Those are acquisition-time decisions governed by [Data Validation and Evidence Contract](../data-validation-and-evidence-contract.md).

## Alternatives Considered

### Store original uploads in PostgreSQL

This would keep all data in the source-of-truth database and simplify local infrastructure. It was rejected because original supplier files and later evidence artifacts can become large, backup/restore economics differ from relational state, and large byte storage would blur the distinction between authoritative metadata and immutable external bytes.

### Store original uploads on the local filesystem

This would be simple for one developer, but it does not fit Docker Compose, worker/API process separation, CI, or future production deployment. It also makes tenant isolation, backup, restore, and evidence reproducibility harder to prove consistently.

### Store original uploads in Redis, Celery results, Qdrant, or browser state

This was rejected because these systems are not durable artifact authorities. Redis is for broker/backend and short-lived coordination, Celery results are task metadata, Qdrant is a derived retrieval projection, and browser state is untrusted presentation state.

### Use a cloud-provider-specific SDK directly

This would make one production provider easier at first, but it would couple domain use cases to a provider-specific contract and weaken local reproducibility. Production storage must be replaceable behind the same object-storage adapter.

### Use an S3-compatible abstraction with MinIO locally

This supports Docker Compose, immutable object semantics, production provider portability, and a clean provider boundary. It keeps PostgreSQL authoritative for metadata while object storage holds original bytes only.

## Decision

Use an S3-compatible object-storage abstraction for immutable original catalog upload bytes and large immutable evidence artifacts.

M3 local development and CI-like Compose environments use MinIO as the S3-compatible implementation. Production or production-like deployments use a managed S3-compatible provider behind the same approved adapter contract.

PostgreSQL stores authoritative import and artifact metadata only:

- tenant ID;
- import ID and source ID;
- artifact reference/key;
- bucket or logical storage namespace;
- content type, original filename, byte size, and SHA-256 content hash;
- import state, row counts, row outcomes, and duplicate/import lifecycle state;
- idempotency and operation IDs;
- audit/event references; and
- evidence manifest/run references.

Object storage stores immutable original bytes only for catalog uploads. It MUST NOT own catalog metadata, import status, row outcomes, authorization decisions, audit state, idempotency records, normalized products, or mutable workflow authority.

The browser, Redis, Celery results, Qdrant, task logs, and model output are never artifact authority. They may contain safe references or derived summaries only when allowed by the relevant contract.

## Approved Adapter Contract

Runtime code introduced by M3 MUST use a domain-owned provider interface under the canonical backend architecture. Routes and worker tasks MUST call application use cases; they MUST NOT call the object-storage SDK directly.

The approved import-artifact storage seam is:

- `catalog_ingestion.application` defines the use-case-facing artifact storage contract.
- `catalog_ingestion.infrastructure.providers` implements the S3-compatible adapter.
- the API composition root and worker composition root wire the same implementation through configuration.
- application use cases coordinate database metadata, content hashing, storage calls, state transitions, and audit emission.

The contract MUST support:

- put original bytes once with tenant/import scoped metadata;
- read original bytes by tenant-scoped artifact reference for processing/retry;
- verify stored object hash/size against PostgreSQL metadata;
- fail safely when an object exists with a different hash or size;
- return no provider-specific object identity across application boundaries except a safe opaque reference/key; and
- avoid exposing presigned read/write URLs to the browser in M3 unless a later ADR approves browser-direct upload/download.

## Consequences

- Docker Compose must eventually include MinIO before M3 runtime code can execute imports.
- Object keys and bucket names become implementation details of the provider adapter, not business identifiers.
- PostgreSQL remains the only durable authority for whether an import exists, which tenant owns it, what its state is, and whether a duplicate upload has already been handled.
- Import recovery can compare PostgreSQL metadata with object storage bytes, but object storage alone cannot create or repair authoritative import state.
- Evidence bundles can reference immutable artifact keys and content hashes without committing large raw data to Git.
- Provider failures become part of the catalog-ingestion failure model and must be classified, retried, or surfaced through durable import state.

## Migration Path

1. M3-01 adds the provider interface, S3-compatible implementation, configuration, and local MinIO service behind this ADR.
2. M3 import creation stores original bytes before enqueueing processing and records the `artifact_stored` transition in PostgreSQL.
3. Existing tiny fixtures remain in Git under `datasets/fixtures/` when permitted; large acquired corpora remain outside Git and are referenced by manifests.
4. Later evaluation work may reuse the same object-storage adapter for large immutable evaluation artifacts, while evaluation run metadata remains in PostgreSQL.
5. Production deployment replaces MinIO configuration with a managed S3-compatible provider without changing application use-case contracts.

## Security and Tenant Implications

- Every artifact metadata record is protected tenant data and MUST include tenant scope directly or through an import/source parent enforced in PostgreSQL.
- Artifact read/write use cases require the authenticated actor, active tenant, and import capability established by ADR 0008.
- Worker payloads carry tenant ID, import ID, operation ID, and correlation ID; workers re-load tenant-scoped metadata before reading object storage.
- Object keys MUST be unguessable or tenant-partitioned implementation details and MUST NOT be treated as authorization.
- Logs, task results, API responses, and audit events may include safe artifact references and hashes, but MUST NOT include raw supplier content, secrets, cookies, credentials, or unrestricted customer data.
- Provider credentials are environment/secret-manager configuration and are never committed to Git.

## Failure and Retry Behavior

- If object storage write fails before metadata reaches `artifact_stored`, the import creation fails or remains in a safe failed state without enqueueing processing.
- If metadata write fails after a successful object write, retry uses the content hash and intended tenant/import scope to reach one effective metadata record or marks the orphan for operational cleanup; the object alone is not authoritative.
- If a duplicate upload has the same tenant-approved duplicate scope and content hash, the use case returns the documented duplicate-content outcome without storing duplicate effective products, row outcomes, or audit events.
- If a retry finds the object exists with the expected hash and size, it may continue from durable PostgreSQL state.
- If a retry finds a missing object, mismatched hash, mismatched size, or access denial, the import transitions to a safe retryable or failed state according to the catalog-ingestion state machine and records audit-worthy evidence.
- Celery retries MUST use durable import state and idempotency keys; task result metadata cannot decide whether processing has happened.

## Test and Evidence Plan

M3 implementation PRs must add tests at the lowest meaningful layer and through the public boundary:

- provider contract tests using the configured S3-compatible local implementation or a deterministic fake at unit level;
- import creation tests proving metadata and artifact storage transition together without duplicate effective state;
- worker retry tests for object already present, missing object, hash mismatch, and transient provider failure;
- tenant isolation tests proving Tenant B cannot read, retry, process, or infer Tenant A artifact metadata or bytes;
- duplicate upload tests proving replay creates zero duplicate effective supplier products, row outcomes, and audit events;
- evidence-manifest tests proving artifact references include SHA-256, byte size, source filename, and acquisition metadata without raw large data in Git; and
- architecture checks proving routes/tasks do not call object-storage SDKs directly.

Required validation commands for code changes remain:

- `python tools/architecture/check_boundaries.py`
- relevant backend, worker, persistence, and API tests
- `git diff --check`

This documentation PR runs only documentation-appropriate checks.

## Affected Documents

- [Final Target Architecture](../final-target-architecture.md)
- [Catalog Ingestion Contract](../catalog-ingestion-contract.md)
- [Data Validation and Evidence Contract](../data-validation-and-evidence-contract.md)
- [Tech Stack Decisions](../tech-stack-decisions.md)
- [Architecture Overview](../overview.md)
- [M3 Catalog Import Implementation Plan](../../planning/m3-catalog-import-implementation-plan.md)

## Decisions Deferred to M3-01

M3-01 must record these prerequisites before implementation proceeds:

- exact object-storage configuration names for local MinIO and managed S3-compatible providers;
- bucket or logical namespace naming convention;
- object key format and collision policy;
- maximum upload size and supported MIME/media-type validation;
- allowed CSV/JSON encodings and parser limits;
- artifact cleanup policy for failed pre-metadata writes;
- provider-level encryption and retention settings for local and production-like deployments;
- Open Icecat access path, exact licence/attribution terms, first corpus size, corpus-specific thresholds, and acquired artifact location in the first M3 manifest.
