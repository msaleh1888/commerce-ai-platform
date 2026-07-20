# Catalog Ingestion Contract

## Ownership

`catalog_ingestion` owns catalog sources, import reservations, uploaded artifact metadata, imports, rows, content hashes, processing status, row-level failures, and durable import-dispatch outbox records. Object storage owns immutable original upload bytes only under [ADR 0009](adr/0009-s3-compatible-import-artifact-storage.md). `catalog` owns the resulting supplier/canonical product state. `normalization` owns transformation rules and outcomes; it does not own catalog persistence.

## State Machine

```text
created -> artifact_stored -> queued -> processing -> completed
                                  |          |             |
                                  +-> failed +-> partial ---+
```

Only named application use cases may transition status. Invalid transitions fail explicitly and are audit-worthy when externally visible.

## Invariants

- Every import, row, artifact reference, and outcome is tenant-scoped.
- Original source representation is immutable after storage; normalized fields never replace it. A reservation records the deterministic object key and expected SHA-256/byte size before storage. Once artifact metadata exists, its recorded provider version ID, key, SHA-256, and byte size identify the only artifact version that may be read for the import.
- PostgreSQL is authoritative for import/artifact metadata, content hashes, import state, row outcomes, idempotency records, and audit references.
- Object storage stores immutable original bytes only. Browser state, Redis, Celery results, Qdrant, task logs, and model output are never artifact authority.
- A content hash is unique for the approved duplicate-import scope and is enforced in PostgreSQL.
- Row failures preserve a safe reason code and source reference.
- An import is complete only after its defined downstream indexing requirement is satisfied or explicitly marked partial/failed.
- Reprocessing and worker retry cannot create duplicate effective supplier products or duplicate audit events.

## Initial Intake Contract

M3 accepts `text/csv` and `application/json` only. A CSV is UTF-8 or UTF-8-with-BOM, comma-delimited, RFC 4180-compatible, and has one header row. JSON is UTF-8 and its top level is an array of objects. The API does not trust the browser-supplied media type: it validates the declared type and bounded bytes before parsing.

The intake limits are 50 MiB per file, 50,000 rows, 256 columns, and 64 KiB per field. Unsupported media types, encodings, delimiters, structures, malformed rows, and limit violations produce typed safe import failures. They never trigger heuristic parsing.

The initial supplier-row mapping is versioned as `m3_supplier_v1`. It accepts these source headers: `supplier_sku` or `sku`; `title`, `name`, or `product_name`; `brand`; `category`; `price`; `currency`; `gtin`, `ean`, or `upc`; and `manufacturer_part_number` or `mpn`. `supplier_sku`, `title`, `price`, and `currency` are required after mapping. Unknown headers remain raw-source evidence only and do not create normalized product fields.

## Execution

The `CreateImport` use case first commits a tenant-scoped import reservation. It conditionally writes the immutable artifact through the approved S3-compatible adapter, then commits the artifact metadata, `artifact_stored -> queued` transition, initial lifecycle audit event, and durable dispatch outbox record in one PostgreSQL transaction under [ADR 0010](adr/0010-durable-import-dispatch-outbox.md). The dispatcher publishes only the durable task identifiers. The worker task calls the ingestion use case. The use case loads durable state, verifies the tenant-scoped recorded artifact key/version/hash/size, claims the valid transition, parses/validates rows, calls approved normalization and catalog contracts, persists outcomes, and schedules indexing through a typed event/task. No route or task calls object storage directly, accesses the outbox repository directly, or directly inserts catalog records.

## Required Evidence

Import responses and UI state expose source, status, counts, duplicate-content result, row failures, retryability, safe artifact reference, content hash, and audit history. Tests cover duplicate upload, partial failure, retry after crash, object-storage failure/mismatch handling, and Tenant A/Tenant B isolation.
