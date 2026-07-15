# Phase 1: Portfolio MVP

## Objective

Build the first complete workflow: tenant-scoped catalog import, product normalization, searchable catalog, duplicate review, human-approved catalog decision, audit trail, and evaluation summary.

## Workstreams

### 1. Identity and Tenancy

- Implement users, tenants, memberships, and roles.
- Seed demo tenant and users.
- Add tenant context to API requests.
- Add tenant isolation tests.

### 2. Catalog Import

- Implement catalog sources.
- Implement CSV and JSON upload.
- Store import metadata, file hash, and row-level records.
- Process imports asynchronously.
- Track import state and row errors.
- Add duplicate import protection.

### 3. Product Domain

- Implement supplier products.
- Implement canonical products.
- Normalize brand, category, title, price, currency, identifiers, and attributes.
- Record provenance from source rows to product records.

### 4. Retrieval

- Create retrieval record representation.
- Index products into Qdrant.
- Implement lexical baseline.
- Implement dense retrieval.
- Implement hybrid fusion.
- Add tenant and metadata filters.
- Add search UI and evidence display.

### 5. Matching and Review

- Generate duplicate candidates.
- Create review cases.
- Show side-by-side product evidence.
- Allow approve, reject, variant, and defer decisions.
- Execute approved mutation idempotently.
- Record audit events.

### 6. Evaluation

- Add fixture evaluation query set.
- Add retrieval metrics.
- Add matching metrics.
- Add report page.
- Record config and dataset manifest.

### 7. Portfolio Polish

- Create demo data.
- Add screenshots or demo script references.
- Add README case-study section.
- Add known limitations.
- Ensure claims are based on generated evidence.

## MVP Acceptance Criteria

- Demo user can sign in and select a tenant.
- Catalog manager can import a file and watch processing status.
- Imported products are stored and visible.
- Products are indexed and searchable.
- Search results include evidence and stay tenant-scoped.
- Duplicate cases are generated and reviewable.
- Approved decision changes catalog state once, even if retried.
- Audit history shows import, review, and mutation events.
- Evaluation page compares at least lexical, dense, and hybrid retrieval.
- CI covers core unit tests, integration tests, and a small evaluation smoke test.

## Suggested Implementation Order

1. Identity and tenant model.
2. Catalog import persistence.
3. Worker processing and idempotency.
4. Product normalization.
5. Product browser UI.
6. Lexical search.
7. Qdrant indexing and dense search.
8. Hybrid search and evaluation.
9. Duplicate candidate generation.
10. Review queue and approval execution.
11. Audit history.
12. Demo polish and README evidence.

## Deferred After Phase 1

- LangGraph ReAct workflow.
- MCP server.
- Memory.
- Real Shopify integration.
- Full observability stack.
- Kubernetes staging.
- Large-scale load testing.

## Portfolio Output

Phase 1 should produce:

- A working local demo.
- A short recorded walkthrough.
- A README with architecture, setup, demo path, and measured results.
- At least one case study: evaluated hybrid product retrieval.
- At least one case study: duplicate product review with human approval.

