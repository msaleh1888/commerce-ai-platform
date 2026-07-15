# ADR 0004: Celery with Idempotent Task Processing

## Status

Accepted for MVP.

## Context

Catalog imports, indexing, matching, and evaluation jobs can be slow. They should not block HTTP requests. Celery provides a practical Python worker model, but task delivery can be at least once, so duplicate execution must be safe.

## Decision

Use Celery with Redis for MVP background processing. Design every task around idempotency keys, durable status records, and database constraints that prevent duplicate effective actions.

## Consequences

- Import and indexing work can run outside request handling.
- Task status can be shown in the UI.
- Duplicate task delivery must be tested.
- Worker crashes must leave enough durable state to resume safely.
- Operations that cross state boundaries need clear transactions and retry behavior.

## Reconsider When

- Workflows require more complex orchestration than Celery can comfortably express.
- Queue throughput or reliability requirements exceed Redis-backed Celery.
- A managed queue or workflow engine becomes necessary.

