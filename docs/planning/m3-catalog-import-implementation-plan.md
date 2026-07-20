# M3 Catalog Import Implementation Plan

## Purpose

M3 delivers the first real customer workflow: a catalog manager uploads supplier CSV/JSON, processing runs asynchronously, valid rows become normalized supplier products, invalid rows keep row-level reasons, duplicate/retry behavior is idempotent, and real-data acceptance evidence proves the result.

This plan is implementation guidance only. It is governed by:

- [Final Target Architecture](../architecture/final-target-architecture.md)
- [Canonical Backend Architecture](../architecture/canonical-backend-architecture.md)
- [Catalog Ingestion Contract](../architecture/catalog-ingestion-contract.md)
- [Data Validation and Evidence Contract](../architecture/data-validation-and-evidence-contract.md)
- [Tech Stack Decisions](../architecture/tech-stack-decisions.md)
- [ADR 0002](../architecture/adr/0002-postgres-source-of-truth-qdrant-derived-index.md)
- [ADR 0003](../architecture/adr/0003-shared-schema-multi-tenancy.md)
- [ADR 0004](../architecture/adr/0004-celery-idempotent-processing.md)
- [ADR 0006](../architecture/adr/0006-versioned-evaluation-manifests.md)
- [ADR 0007](../architecture/adr/0007-architecture-governance-and-canonical-boundaries.md)
- [ADR 0008](../architecture/adr/0008-application-managed-demo-auth-and-active-tenant-context.md)
- [ADR 0009](../architecture/adr/0009-s3-compatible-import-artifact-storage.md)

## M3-01 Prerequisites

M3-01 must complete these decisions and setup items before any import runtime path is merged:

- Record exact object-storage configuration names for local MinIO and managed S3-compatible providers.
- Record bucket or logical namespace naming convention.
- Record object key format and collision policy.
- Record maximum upload size and supported MIME/media-type validation.
- Record allowed CSV/JSON encodings and parser limits.
- Record artifact cleanup policy for failed pre-metadata writes.
- Record provider-level encryption and retention settings for local and production-like deployments.
- Add the local MinIO Compose service only after the above are documented.
- Add the provider interface and S3-compatible adapter only behind `catalog_ingestion.application` and `catalog_ingestion.infrastructure.providers`.
- Record Open Icecat access path, exact licence/attribution terms, first corpus size, corpus-specific thresholds, and acquired artifact location in the first M3 manifest before data acquisition.

## Vertical 1: Valid CSV/JSON Import Completes Asynchronously

Customer outcome: a catalog manager uploads a valid CSV or JSON file, sees the import progress asynchronously, and finds normalized supplier products persisted for the active tenant.

### M3-01: Artifact Storage Foundation

| Field | Plan |
| --- | --- |
| Owner | Backend/infra owner. |
| Permitted files | `docs/architecture/**`, `docs/planning/**`, `infrastructure/docker/**`, `apps/api/src/commerce_ai_api/modules/catalog_ingestion/**`, `apps/api/src/commerce_ai_api/core/**`, `apps/worker/src/commerce_ai_worker/**`, `tests/unit/catalog_ingestion/**`, `tests/integration/persistence/**`, `tests/architecture/**`. |
| Approved seam | `catalog_ingestion.application` provider contract with S3-compatible implementation under `catalog_ingestion.infrastructure.providers`; API and worker composition roots wire the adapter. |
| Red test | Import artifact storage contract test fails for put/read/verify by tenant-scoped reference; architecture test fails if routes/tasks import an object-storage SDK. |
| Green implementation | Add MinIO Compose configuration, settings, provider interface, adapter, deterministic fake for unit tests, and hash/size verification. |
| Customer end-to-end validation | Upload path can store immutable bytes and return a safe artifact reference without exposing raw bytes or provider credentials. |
| Tenant/authorization implications | Artifact metadata is tenant-protected; actor must have import capability before storage. Object keys are not authorization. |
| Audit/idempotency implications | Operation ID and content hash are available before processing; duplicate put with same hash is safe, mismatch fails. |
| Merge dependency | This ADR PR merged; M2 auth/tenant context available; M3-01 prerequisite decisions recorded. |

### M3-02: Import Intent API and Persistence

| Field | Plan |
| --- | --- |
| Owner | Backend owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/catalog_ingestion/**`, `apps/api/src/commerce_ai_api/api/routes/**`, `apps/api/src/commerce_ai_api/api/schemas/**`, `apps/api/src/commerce_ai_api/db/**`, `tests/unit/catalog_ingestion/**`, `tests/integration/api/**`, `tests/integration/persistence/**`. |
| Approved seam | FastAPI route calls one `CreateImport` use case; repositories own tenant-scoped import/source/artifact metadata; migrations create protected tables. |
| Red test | Authenticated catalog manager upload returns created import and `artifact_stored`; viewer/other tenant upload/read is denied; route has no repository/provider direct access. |
| Green implementation | Add import/source/artifact metadata models, repository, state transitions, upload DTOs, and API endpoint that stores bytes before enqueue. |
| Customer end-to-end validation | User uploads a small valid fixture and receives import ID, status, counts initialized to zero, content hash, and safe artifact reference. |
| Tenant/authorization implications | Active tenant comes from session; import capability required; all reads scoped to tenant. |
| Audit/idempotency implications | Record operation ID, content hash, and initial lifecycle audit event once. |
| Merge dependency | M3-01. |

### M3-03: Asynchronous Processing and Normalized Supplier Products

| Field | Plan |
| --- | --- |
| Owner | Backend/worker owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/catalog_ingestion/**`, `apps/api/src/commerce_ai_api/modules/normalization/**`, `apps/api/src/commerce_ai_api/modules/catalog/**`, `apps/worker/src/commerce_ai_worker/**`, `tests/unit/catalog_ingestion/**`, `tests/unit/normalization/**`, `tests/integration/worker/**`, `tests/integration/api/**`. |
| Approved seam | Worker task deserializes `ProcessImport(import_id, tenant_id, operation_id, correlation_id)` and calls `ProcessImport` use case; catalog persistence happens only through approved catalog application contracts. |
| Red test | Queued valid CSV/JSON import remains unprocessed until worker runs, then reaches `completed`; task retry does not create duplicate products. |
| Green implementation | Add parser, validation, normalization, product creation contract, task wiring, durable state transitions, and status query endpoint. |
| Customer end-to-end validation | Catalog manager uploads valid CSV/JSON, sees processing complete, and browses resulting supplier products with raw and normalized fields. |
| Tenant/authorization implications | Worker re-loads tenant-scoped import and writes tenant-scoped products only. |
| Audit/idempotency implications | Processing lifecycle and product creation emit idempotent audit events tied to operation/import IDs. |
| Merge dependency | M3-02. |

## Vertical 2: Mixed-Validity Import Reaches Partial Status

Customer outcome: a catalog manager uploads a mixed-validity file, valid rows are retained, invalid rows show safe row-level reasons, and the import reaches `partial`.

### M3-04: Row Outcome and Failure Reason Model

| Field | Plan |
| --- | --- |
| Owner | Backend owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/catalog_ingestion/**`, `tests/unit/catalog_ingestion/**`, `tests/integration/persistence/**`, `tests/integration/api/**`. |
| Approved seam | `catalog_ingestion` owns import rows, row outcomes, safe reason codes, and source references. |
| Red test | Mixed fixture fails because row outcomes and safe reason codes are not persisted or exposed. |
| Green implementation | Persist accepted/rejected/quarantined row outcomes, source row references, safe reason codes, and counts that satisfy row conservation. |
| Customer end-to-end validation | Import status shows accepted/rejected/quarantined counts and per-row reasons without raw sensitive content leakage. |
| Tenant/authorization implications | Row lookup requires tenant-scoped import ownership and import-read capability. |
| Audit/idempotency implications | Partial status transition and row summaries are audit-worthy; retry cannot duplicate row outcomes. |
| Merge dependency | M3-03. |

### M3-05: Partial Import UI and Status Contract

| Field | Plan |
| --- | --- |
| Owner | Frontend/backend owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/catalog_ingestion/**`, `apps/api/src/commerce_ai_api/api/routes/**`, `apps/web/src/**`, `tests/integration/api/**`, `tests/e2e/**`. |
| Approved seam | Frontend calls catalog-ingestion API client only; backend route calls status/query use case only. |
| Red test | UI/API cannot distinguish `partial` from `failed` or show row-level safe reasons. |
| Green implementation | Add status response, row-failure pagination, partial-success UI state, retry affordance, and error/empty/loading states. |
| Customer end-to-end validation | User can inspect why invalid rows failed while valid products remain available. |
| Tenant/authorization implications | Browser authorization hints are display only; server enforces tenant and role. |
| Audit/idempotency implications | UI displays audit/history references from PostgreSQL, not task results. |
| Merge dependency | M3-04. |

## Vertical 3: Duplicate Upload and Retry Remain Idempotent

Customer outcome: an exact duplicate upload or worker retry produces the original effective outcome, does not duplicate products or audit events, and leaves lifecycle evidence.

### M3-06: Duplicate Content Scope and Replay

| Field | Plan |
| --- | --- |
| Owner | Backend owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/catalog_ingestion/**`, `tests/unit/catalog_ingestion/**`, `tests/integration/api/**`, `tests/integration/persistence/**`. |
| Approved seam | PostgreSQL unique constraints and `CreateImport` use case enforce duplicate-content scope. |
| Red test | Re-uploading the same bytes in the same tenant creates duplicate effective products or audit events. |
| Green implementation | Add duplicate-content detection, response semantics, unique constraints, and replay-safe lifecycle audit. |
| Customer end-to-end validation | User re-uploads the same file and sees documented duplicate result with link/reference to original import outcome. |
| Tenant/authorization implications | Duplicate scope is tenant-approved; Tenant B cannot infer Tenant A content hash or import existence. |
| Audit/idempotency implications | Duplicate replay records at most the approved duplicate-attempt evidence and zero duplicate effective product/audit mutations. |
| Merge dependency | M3-03. |

### M3-07: Worker Retry and Failure Recovery

| Field | Plan |
| --- | --- |
| Owner | Worker/backend owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/catalog_ingestion/**`, `apps/worker/src/commerce_ai_worker/**`, `tests/integration/worker/**`, `tests/unit/catalog_ingestion/**`. |
| Approved seam | Celery task calls `ProcessImport`; use case reads durable state and object-storage bytes; task result is not authority. |
| Red test | Simulated crash after row persistence or artifact read causes duplicate rows/products/audit events on retry. |
| Green implementation | Add idempotent checkpoints, retry classification, provider transient error handling, object missing/mismatch failure states, and lifecycle audit evidence. |
| Customer end-to-end validation | Interrupted import resumes or reaches safe retryable/failed status with clear audit history and no duplicate effective changes. |
| Tenant/authorization implications | Worker validates tenant ID against import metadata before artifact read or product write. |
| Audit/idempotency implications | Every retry uses operation/import IDs; audit events are deduplicated by operation and lifecycle phase. |
| Merge dependency | M3-06. |

## Vertical 4: Real-Data and Holdout Acceptance Evidence Completes M3

Customer outcome: M3 can make honest evidence-backed claims about import behavior on frozen real-source and holdout data.

### M3-08: Source Manifest and Golden Labels

| Field | Plan |
| --- | --- |
| Owner | Evaluation/data owner. |
| Permitted files | `datasets/manifests/**`, `datasets/fixtures/**`, `docs/evidence/**`, `docs/architecture/data-validation-and-evidence-contract.md`, `tests/evaluation/**`. |
| Approved seam | Data-validation manifests record acquisition facts; no runtime code downloads external corpora during CI. |
| Red test | Manifest validation fails when publisher, source URL, retrieval date, licence/terms, attribution, hash, bytes, row count, reviewer, split, labels, or thresholds are missing. |
| Green implementation | Add schema/checks for manifests and golden-label metadata using only acquired facts. |
| Customer end-to-end validation | Reviewer can see which data was used, under what rights, and what expected row outcomes were reviewed. |
| Tenant/authorization implications | Customer/private data is excluded unless written permission and handling rules are recorded. |
| Audit/idempotency implications | Manifest hash links acceptance runs to immutable artifact hashes and import IDs. |
| Merge dependency | M3-01 decisions; do not invent Open Icecat facts. |

### M3-09: Acceptance Runs and Evidence Bundle

| Field | Plan |
| --- | --- |
| Owner | Evaluation/backend owner. |
| Permitted files | `docs/evidence/**`, `datasets/manifests/**`, `tests/evaluation/**`, `tests/integration/api/**`, `tests/integration/worker/**`, `apps/api/src/commerce_ai_api/modules/evaluation/**` when introduced. |
| Approved seam | Acceptance runs go through user-facing API/UI and real worker path; evidence metadata persists through approved evaluation/import contracts. |
| Red test | Evidence report generation fails without row conservation, replay, retry/recovery, tenant isolation, holdout result, artifact hashes, app commit, and correlation/operation IDs. |
| Green implementation | Add acceptance runner/reporting that records immutable evidence bundle references and produces a human-readable report. |
| Customer end-to-end validation | M3 report answers what was imported, what failed, what was normalized, whether duplicates/retries/tenant isolation held, and what claims are supported. |
| Tenant/authorization implications | Acceptance includes target tenant and isolation tenant; cross-tenant artifact/import/product/audit count must be zero. |
| Audit/idempotency implications | Evidence records duplicate replay effective-product count and effective-audit-event count as zero for passing runs. |
| Merge dependency | M3-04, M3-06, M3-07, and completed source manifest/golden labels. |
