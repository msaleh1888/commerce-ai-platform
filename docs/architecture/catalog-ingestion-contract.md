# Catalog Ingestion Contract

## Ownership

`catalog_ingestion` owns catalog sources, uploaded artifact metadata, imports, rows, content hashes, processing status, and row-level failures. Object storage owns immutable original upload bytes only under [ADR 0009](adr/0009-s3-compatible-import-artifact-storage.md). `catalog` owns the resulting supplier/canonical product state. `normalization` owns transformation rules and outcomes; it does not own catalog persistence.

## State Machine

```text
created -> artifact_stored -> queued -> processing -> completed
                                  |          |             |
                                  +-> failed +-> partial ---+
```

Only named application use cases may transition status. Invalid transitions fail explicitly and are audit-worthy when externally visible.

## Invariants

- Every import, row, artifact reference, and outcome is tenant-scoped.
- Original source representation is immutable after storage; normalized fields never replace it.
- PostgreSQL is authoritative for import/artifact metadata, content hashes, import state, row outcomes, idempotency records, and audit references.
- Object storage stores immutable original bytes only. Browser state, Redis, Celery results, Qdrant, task logs, and model output are never artifact authority.
- A content hash is unique for the approved duplicate-import scope and is enforced in PostgreSQL.
- Row failures preserve a safe reason code and source reference.
- An import is complete only after its defined downstream indexing requirement is satisfied or explicitly marked partial/failed.
- Reprocessing and worker retry cannot create duplicate effective supplier products or duplicate audit events.

## Execution

The API creates import intent, stores the immutable original artifact through the approved S3-compatible adapter, records artifact metadata and content hash in PostgreSQL, then queues `ProcessImport(import_id, tenant_id, operation_id)`. The worker task calls the ingestion use case. The use case loads durable state, verifies the tenant-scoped artifact reference, claims the valid transition, parses/validates rows, calls approved normalization and catalog contracts, persists outcomes, and schedules indexing through a typed event/task. No route or task calls object storage directly, and no task directly inserts catalog records.

## Required Evidence

Import responses and UI state expose source, status, counts, duplicate-content result, row failures, retryability, safe artifact reference, content hash, and audit history. Tests cover duplicate upload, partial failure, retry after crash, object-storage failure/mismatch handling, and Tenant A/Tenant B isolation.
