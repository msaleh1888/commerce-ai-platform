# ADR 0003: Shared-Schema Multi-Tenancy

## Status

Accepted for MVP.

## Context

The portfolio MVP must demonstrate multi-tenant SaaS behavior without requiring the operational overhead of a database per tenant. The main risk is accidental cross-tenant access through APIs, workers, vector retrieval, caches, or audit views.

## Decision

Use a shared PostgreSQL schema with explicit tenant_id fields on protected business records. Require tenant scope in repository APIs and retrieval filters. Include tenant_id in Qdrant payloads and Celery task context.

## Consequences

- Local development and testing remain practical.
- Tenant isolation must be tested aggressively.
- Repository methods must not allow unscoped queries for protected entities.
- Qdrant filters are part of the authorization boundary and must be validated.

## Reconsider When

- Tenant data volume or compliance requirements justify stronger physical isolation.
- Enterprise deployment requires tenant-dedicated storage.
- Cross-tenant risk cannot be adequately controlled through tests and code review.

