# ADR 0010: Durable Import Dispatch Outbox

## Status

Accepted for M3.

## Context

An import is not complete when PostgreSQL metadata and immutable artifact bytes exist. It must also reach the Celery worker. Publishing directly to Redis after a database commit can fail or the process can crash, leaving a queued import with no task. Publishing before the commit can deliver a task that cannot find durable state.

ADR 0004 requires at-least-once task safety. The catalog-ingestion workflow needs a durable dispatch decision that preserves that requirement across the PostgreSQL-to-Celery boundary.

## Decision

Use a PostgreSQL transactional outbox for catalog-ingestion task dispatch.

The `CreateImport` use case commits the following in one PostgreSQL transaction:

- the `artifact_stored -> queued` import transition;
- authoritative artifact metadata and content integrity fields;
- the initial lifecycle audit event; and
- one outbox record carrying only event ID, import ID, tenant ID, operation ID, correlation ID, and event type.

The catalog-ingestion outbox dispatcher publishes the event to Celery and records dispatch outcome durably. A publish failure leaves the outbox record pending. A crash after publish but before marking dispatched can publish again; `ProcessImport` remains idempotent and uses the durable import and operation state as authority. The worker task never receives artifact bytes, raw request data, credentials, or mutable snapshots.

## Alternatives Considered

### Publish directly after the database transaction

Rejected because a broker failure or process crash can permanently strand an import without a durable redispatch signal.

### Publish before committing import state

Rejected because a worker can observe missing or rolled-back import state.

### Treat Celery result metadata as the delivery record

Rejected because task results are non-authoritative and may expire.

### Use a separate workflow engine

Rejected for M3 because it introduces an additional runtime authority before the modular-monolith workflow requires it.

## Consequences

- PostgreSQL owns dispatch intent and outcome; Redis/Celery remains delivery infrastructure.
- A dispatcher may run from the API process after commit and from a retryable worker/management entry point, but every path invokes the same catalog-ingestion dispatch use case.
- Import status remains `queued` until `ProcessImport` claims it. Dispatch failure is visible through durable state and audit history.
- M3 adds an outbox table, tenant-scoped query contract, dispatcher use case, and recovery tests.

## Security and Tenant Impact

Outbox records include tenant ID and only safe durable identifiers. The dispatcher re-loads the tenant-scoped import before publishing. It never authorizes browser requests, reads artifact bytes, or exposes broker payloads to the browser.

## Verification

- Database commit followed by broker failure leaves one pending outbox record and a visible queued import.
- Dispatcher retry publishes the same durable payload without duplicate effective products or audit events.
- A duplicate Celery delivery returns the original effective processing outcome.
- Tenant B cannot read, dispatch, retry, or infer Tenant A import/outbox records.
- Routes and tasks do not access repositories, storage SDKs, or Celery broker APIs directly.
