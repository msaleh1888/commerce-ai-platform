# M2 Frontend Demo-Data Contract

## Purpose

M2 frontend prototypes use deterministic local data before their backend APIs exist. This contract prevents screen-specific mock objects from becoming accidental API designs.

## Location and Ownership

M2-03 owns `apps/web/src/features/demo-data/`. It contains TypeScript contracts, scenario fixtures, and mock adapters only. Feature modules consume typed adapters; routes and shared UI primitives do not import fixture files directly.

```text
features/demo-data/
  contracts.ts
  scenarios/northstar-retail.ts
  scenarios/acme-outlet.ts
  adapters/dashboard.ts
  adapters/review.ts
```

## Required Types

The initial contracts are API-shaped and read-only:

- `DemoSessionView`: actor, active tenant, memberships, role, allowed capabilities.
- `DashboardSummary`: metric cards, recent imports, feed/pipeline stages, review summary, evaluation summary, audit events.
- `ImportSummary`: ID, source, status, timestamps, row counts, searchable state.
- `ReviewCaseSummary`: case ID, status, risk, proposal, confidence, reason codes, source/import, age, assignee.
- `ReviewCaseDetail`: summary plus two product records, provenance, raw/normalized/canonical comparison, conflicts, signals, approval context, audit preview, evaluation context.
- `EvaluationSummary`: manifest/run/configuration identifiers, metrics, baseline comparison, and explicit demo-data status.
- `AuditEventSummary`: timestamp, actor, tenant, action, target, safe metadata.

M2 uses stable IDs and ISO 8601 timestamps. It does not generate dates, random values, or confidence values at render time.

## Scenarios

`Northstar Retail` is the active demo tenant. It includes the Catalog Manager user, realistic supplier records, a selected unresolved duplicate case, a failed/partial import, audit entries, and demo evaluation context.

`Acme Outlet` is the isolation fixture. It has distinct records, review cases, and user membership. Northstar data MUST NOT appear in Acme adapters, and vice versa.

Use the realistic suppliers and product names defined in the UX direction. Do not use lorem ipsum, anonymous "Product 1" values, or fabricated claims presented as current system results.

## Mutation Simulation

Prototype actions may update feature-local presentation state for confirmation and resolved-state demonstrations. They MUST NOT mutate shared fixture objects, persist to browser storage as authoritative state, or claim a server-side catalog mutation. The adapter result includes `mode: "demo"` and an explanatory status message.

## Replacement Path

When real API routes arrive, each feature replaces its demo adapter with a typed API adapter that returns the same feature contract. The fixture types evolve only through an API-contract change or approved architecture decision.
