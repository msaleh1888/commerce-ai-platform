# M3 Catalog Import Implementation Plan

## Purpose

M3 delivers the first real customer workflow: a catalog manager imports a supplier catalog safely and can understand the durable result. Every implementation PR in this plan must deliver a testable customer outcome through the real API, PostgreSQL, object storage, Celery worker, and web application. Infrastructure-only or backend-only PRs are not M3 delivery slices.

This plan is governed by the Final Target Architecture, Canonical Backend Architecture, Catalog Ingestion Contract, Data Validation and Evidence Contract, Implementation Guide, and ADRs 0002 through 0010.

## Approved Preconditions

The following are already decided and MUST NOT be reinvented by an implementation agent:

- MinIO is the local/Compose S3-compatible implementation; `commerce-ai-import-artifacts` is its versioned import bucket.
- Production-like buckets use `commerce-ai-<environment>-import-artifacts` through the same adapter configuration contract.
- Artifact keys derive from tenant ID, source ID, and SHA-256; original filenames are metadata only.
- The reservation persists the deterministic key and expected SHA-256/byte size before storage. The adapter conditionally creates the immutable object; a successful metadata transaction records the provider version ID. Recovery verifies the reserved key/hash/size, records the observed version, and reads that version before parsing.
- Application storage roles cannot overwrite or delete artifacts. MVP import artifacts have no automatic expiration.
- Import intake first creates a PostgreSQL reservation. Artifact metadata, the `queued` transition, initial audit event, and outbox record commit together after successful object storage.
- ADR 0010 transactional outbox dispatch is the only approved PostgreSQL-to-Celery handoff.
- Initial intake accepts `text/csv` UTF-8/UTF-8-with-BOM, comma-delimited RFC 4180 headered CSV and `application/json` UTF-8 arrays of objects only; limits are 50 MiB, 50,000 rows, 256 columns, and 64 KiB per field. `m3_supplier_v1` maps the headers and required fields defined by the Catalog Ingestion Contract.
- Source-specific Open Icecat access, licence/attribution, corpus size, thresholds, and acquired artifact references remain acquisition-time manifest facts. They must not be invented.

## Required TDD Execution

Every implementation PR follows one vertical slice at a time: add the named failing behavior test, run its focused command and confirm the expected failure, make the smallest architecture-compliant change, rerun it green, then run the listed affected suite. A developer does not begin the next slice while the current one is red. Browser validation follows the completed slice; it never substitutes for API, persistence, worker, or tenant-isolation coverage.

## M3-01: Valid Import Completes Asynchronously

**Customer outcome:** A Catalog Manager uploads one valid CSV or JSON supplier catalog, sees `queued -> processing -> completed`, and can inspect normalized supplier-product rows, raw source values, provenance, counts, and import lifecycle audit history for the active tenant.

| Field | Plan |
| --- | --- |
| Owner | Full-stack import owner. |
| Permitted files | `docker-compose.yml`, `infrastructure/docker/**`, `apps/api/src/commerce_ai_api/modules/{catalog_ingestion,normalization,catalog,audit}/**`, import-specific API routes/schemas/dependencies, API and worker composition roots, `apps/web/src/features/imports/**`, `apps/web/src/app/(app)/imports/**`, the approved API client boundary, import fixtures, migrations, and import-focused tests only. |
| Approved seam | `POST /imports` resolves actor/tenant and calls `CreateImport`; the use case owns reservation, storage, transaction, audit, and outbox. The dispatcher invokes Celery; `ProcessImport(import_id, tenant_id, operation_id, correlation_id)` calls one use case; the import UI calls typed import API functions only. |
| Vertical slice order | 1. Reject an unsupported or unauthorized upload at `POST /imports`. 2. Create a valid reservation, immutable artifact metadata, audit event, and pending outbox record. 3. Dispatch and process the valid import to one completed supplier-product result despite duplicate task delivery. 4. Render typed upload, queued/processing/completed detail, provenance, counts, and audit history without a fixture fallback. |
| Red tests and focused commands | `test_catalog_manager_upload_creates_one_queued_import_with_an_outbox_record` and tenant/role denials: `pytest tests/integration/api/test_import_routes.py -q`. `test_process_import_completes_one_tenant_scoped_supplier_product_on_duplicate_delivery`: `pytest tests/integration/worker/test_import_tasks.py -q`. `test_import_feature_renders_completed_status_from_api_view_model`: `npm --prefix apps/web exec tsx --test src/features/imports/tests/imports.test.ts`. |
| Green implementation | Add MinIO provisioning/configuration, provider adapter, reservation/import/artifact/outbox/audit/product migrations, CSV/JSON valid-path parsing, normalization, supplier-product persistence, dispatcher/task wiring, import status query, and import upload/detail UI. |
| Affected-suite verification | `pytest tests/unit/catalog_ingestion tests/integration/api/test_import_routes.py tests/integration/worker/test_import_tasks.py tests/integration/persistence/test_import_persistence.py -q`; `npm --prefix apps/web run test`; `npm --prefix apps/web run typecheck`; `python tools/architecture/check_boundaries.py`; `git diff --check`. |
| Customer validation | In Compose, seed and authenticate Northstar Catalog Manager; upload one valid CSV and one valid JSON fixture through the browser; observe terminal `completed`; inspect counts, normalized values, immutable source provenance, and audit history; verify Acme cannot access any Northstar record. |
| Tenant/authorization | API resolves active tenant and `catalog.import:write`/read capability; repositories, outbox, worker payload, artifact read, product write, and audit query carry tenant scope. |
| Audit/idempotency | One initial lifecycle audit event and one processing-completed event per effective operation; duplicate Celery delivery creates no duplicate effective supplier products or audit events. |
| Merge dependency | ADR 0009 and ADR 0010 merged. |

## M3-02: Mixed-Validity Import Reaches Partial Success

**Customer outcome:** A Catalog Manager imports a mixed-validity file; valid rows become supplier products while invalid rows remain inspectable with safe reasons, and the import reaches `partial` rather than hiding the problem.

| Field | Plan |
| --- | --- |
| Owner | Full-stack import-quality owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/{catalog_ingestion,normalization,catalog,audit}/**`, import API route/schema/query files, `apps/web/src/features/imports/**`, `apps/web/src/app/(app)/imports/**`, mixed-validity fixtures, and import-focused tests only. |
| Approved seam | `ProcessImport` persists row outcomes through catalog-ingestion contracts; import status query returns safe paginated row outcomes; the import feature renders API view models and has no fixture fallback. |
| Vertical slice order | 1. Persist one stable result for every source row and enforce row conservation. 2. Expose safe, paginated row outcomes and a `partial` import result. 3. Render partial success, row failures, loading, empty, error, and permission-denied states from typed API data. |
| Red tests and focused commands | `test_mixed_import_conserves_accepted_rejected_and_quarantined_rows`: `pytest tests/unit/catalog_ingestion/test_row_outcomes.py -q`. `test_import_rows_are_tenant_scoped_and_paginated`: `pytest tests/integration/api/test_import_rows_routes.py -q`. `test_import_feature_distinguishes_partial_from_failed`: `npm --prefix apps/web exec tsx --test src/features/imports/tests/imports.test.ts`. |
| Green implementation | Add row outcome persistence, source-row references, safe reason codes, row-conservation counts, `partial` transition, safe pagination, and partial-success/error/empty/loading UI states. |
| Affected-suite verification | `pytest tests/unit/catalog_ingestion tests/integration/api/test_import_routes.py tests/integration/api/test_import_rows_routes.py tests/integration/worker/test_import_tasks.py -q`; `npm --prefix apps/web run test`; `npm --prefix apps/web run typecheck`; `python tools/architecture/check_boundaries.py`; `git diff --check`. |
| Customer validation | Upload a mixed CSV; see valid rows retained, invalid rows explained without unrestricted raw content leakage, and a `partial` status with accurate counts and audit history. |
| Tenant/authorization | Import and row queries require active-tenant import-read authorization; Tenant B receives no rows, counts, or failure details. |
| Audit/idempotency | Partial terminal transition and summary are written once; a retry reuses row identity and does not duplicate outcomes. |
| Merge dependency | M3-01. |

## M3-03: Duplicate Upload and Recovery Are Safe

**Customer outcome:** A Catalog Manager can re-upload the same source file or recover a transient processing failure without duplicate supplier products, row outcomes, or lifecycle audit events.

| Field | Plan |
| --- | --- |
| Owner | Backend/worker reliability owner. |
| Permitted files | `apps/api/src/commerce_ai_api/modules/{catalog_ingestion,catalog,audit}/**`, import API route/schema/query files, worker task/composition files, `apps/web/src/features/imports/**`, import-focused fixtures, and integration/worker/browser tests only. |
| Approved seam | `CreateImport` enforces tenant-approved duplicate-content scope through PostgreSQL constraints; outbox dispatcher and `ProcessImport` recover from durable import state only. |
| Vertical slice order | 1. Return a same-tenant duplicate-content result that references the original import without exposing another tenant. 2. Recover a pending outbox record after broker failure. 3. Recover a transient worker failure from durable checkpoints without duplicate products, row outcomes, or lifecycle audit events. 4. Present duplicate and recovery history in the existing import detail feature. |
| Red tests and focused commands | `test_same_tenant_duplicate_upload_returns_original_import_without_new_effective_state`: `pytest tests/integration/api/test_import_routes.py -q`. `test_dispatcher_retries_pending_outbox_after_publish_failure`: `pytest tests/integration/worker/test_import_dispatch.py -q`. `test_process_import_recovery_is_idempotent_after_transient_failure`: `pytest tests/integration/worker/test_import_tasks.py -q`. `test_import_feature_shows_duplicate_and_recovery_history`: `npm --prefix apps/web exec tsx --test src/features/imports/tests/imports.test.ts`. |
| Green implementation | Add duplicate-content response semantics linking the original import, operation/lifecycle deduplication, retry classification, idempotent checkpoints, recovery status, and audit history presentation. |
| Affected-suite verification | `pytest tests/unit/catalog_ingestion tests/integration/api/test_import_routes.py tests/integration/worker/test_import_dispatch.py tests/integration/worker/test_import_tasks.py tests/integration/persistence/test_import_persistence.py -q`; `npm --prefix apps/web run test`; `npm --prefix apps/web run typecheck`; `python tools/architecture/check_boundaries.py`; `git diff --check`. |
| Customer validation | Re-upload the exact file and see the original import referenced with no new effective product changes; inject one transient failure, retry, and see one terminal outcome with clear lifecycle history. |
| Tenant/authorization | Duplicate scope never exposes whether Tenant A owns a matching hash; workers verify payload tenant against durable import metadata before read/write. |
| Audit/idempotency | Duplicate attempts may have one safe attempt record only when approved by the audit contract; effective product and lifecycle audit events remain exactly once. |
| Merge dependency | M3-01. M3-02 may merge independently; resolve normal import-feature conflicts conventionally. |

## M3-04: Real-Data Acceptance Evidence Completes M3

**Customer outcome:** The team can truthfully show what real frozen source data was imported, what happened to every row, which holdout results passed or failed, and which claims are supported.

| Field | Plan |
| --- | --- |
| Owner | Evaluation/data-validation owner. |
| Permitted files | `datasets/manifests/**`, permitted tiny fixtures, `docs/evidence/**`, `tests/evaluation/**`, import/evaluation acceptance tooling, and `apps/api/src/commerce_ai_api/modules/evaluation/**` only when required by the existing evaluation contract. |
| Approved seam | Manifests and evidence runs reference immutable artifact hashes/version references and execute through the real API/UI, outbox, worker, and tenant-scoped persistence contracts. Normal CI never downloads external data. |
| Vertical slice order | 1. Reject an incomplete manifest or evidence record. 2. Run the frozen tiny resilience corpus through the real import path and assert row conservation, duplicate replay, recovery, and tenant isolation. 3. Run an acquired holdout through the same path outside normal CI and emit machine-readable metrics plus a human-readable report. |
| Red tests and focused commands | `test_import_evidence_manifest_rejects_missing_required_provenance_or_result_fields`: `pytest tests/evaluation/test_import_evidence_manifest.py -q`. `test_import_acceptance_run_records_row_conservation_recovery_and_isolation`: `pytest tests/evaluation/test_import_acceptance.py -q`. |
| Green implementation | Add manifest validation, reviewed golden labels, controlled acceptance runner, machine-readable metrics, immutable evidence references, and a human-readable report. |
| Affected-suite verification | `pytest tests/evaluation -q`; `python tools/architecture/check_boundaries.py`; `git diff --check`. The controlled acquired-data command is documented with its manifest ID and is never a normal CI requirement. |
| Customer validation | A reviewer follows the documented acceptance procedure and can inspect real-source versus resilience versus holdout results, limitations, failures, and supported claims. |
| Tenant/authorization | Acceptance uses a target tenant and isolation tenant; cross-tenant import, artifact, product, row, audit, and retrieval counts must be zero. |
| Audit/idempotency | Evidence records duplicate replay effective-product/audit counts and recovery outcome; failed evidence remains immutable rather than rewritten. |
| Merge dependency | M3-01, M3-02, M3-03, and an acquired manifest with verified facts. |

## Merge and Team Sequence

```text
ADR 0009 + ADR 0010
        |
      M3-01
       /  \
   M3-02  M3-03
       \  /
      M3-04
```

M3-02 and M3-03 are the only parallel implementation PRs. Each starts from merged M3-01, owns one customer outcome, and may resolve ordinary import-feature conflicts during merge. No task may replace an end-to-end customer path with a mock, direct database insertion, or fixture-only success claim.
