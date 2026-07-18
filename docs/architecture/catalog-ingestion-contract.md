# Catalog Ingestion Contract

## Ownership

`catalog_ingestion` owns catalog sources, uploaded artifacts, imports, rows, content hashes, processing status, and row-level failures. `catalog` owns the resulting supplier/canonical product state. `normalization` owns transformation rules and outcomes; it does not own catalog persistence.

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
- A content hash is unique for the approved duplicate-import scope and is enforced in PostgreSQL.
- Row failures preserve a safe reason code and source reference.
- An import is complete only after its defined downstream indexing requirement is satisfied or explicitly marked partial/failed.
- Reprocessing and worker retry cannot create duplicate effective supplier products or duplicate audit events.

## Execution

The API creates import intent and queues `ProcessImport(import_id, tenant_id, operation_id)`. The worker task calls the ingestion use case. The use case loads durable state, claims the valid transition, parses/validates rows, calls approved normalization and catalog contracts, persists outcomes, and schedules indexing through a typed event/task. No task directly inserts catalog records.

## Required Evidence

Import responses and UI state expose source, status, counts, duplicate-content result, row failures, retryability, and audit history. Tests cover duplicate upload, partial failure, retry after crash, and Tenant A/Tenant B isolation.
