# ADR 0002: PostgreSQL Source of Truth and Qdrant Derived Index

## Status

Accepted for MVP.

## Context

The platform needs reliable business state, auditability, idempotent mutations, and vector retrieval. Vector indexes are excellent for retrieval, but they should not be the only copy of important product or workflow state.

## Decision

Use PostgreSQL as the source of truth for tenants, imports, products, review cases, approvals, evaluation runs, and audit events. Use Qdrant as a derived retrieval index that can be rebuilt from PostgreSQL.

## Consequences

- Catalog state remains transactional and auditable.
- Search readiness can be tracked explicitly.
- Qdrant drift can be detected and repaired.
- Reindexing must be implemented as a first-class operation.
- Retrieval payloads must include tenant and provenance metadata.

## Reconsider When

- Retrieval records become too large or specialized for the current indexing strategy.
- Rebuild time becomes unacceptable.
- A future search engine replaces or complements Qdrant.

