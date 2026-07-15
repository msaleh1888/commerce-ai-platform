# Demo Script

## Demo Goal

Show a complete AI commerce operations workflow in under five minutes. The demo should make the project feel like a real SaaS application, not a disconnected benchmark or chatbot.

## Demo Setup

- Demo tenant: Northstar Retail.
- Demo user: catalog.manager@example.com.
- Dataset: small seeded catalog subset with intentional supplier duplicates, category variation, messy titles, and missing attributes.
- Optional second tenant: Acme Outlet, used to prove isolation.

## Main Demo Path

### 1. Open Dashboard

Show the tenant-scoped dashboard.

Key points:

- The user is inside a specific tenant.
- The product has operational surfaces: imports, products, search, review, evaluation, and audit.

### 2. Import Supplier Catalog

Upload a CSV or JSON supplier catalog.

Show:

- Source name.
- File hash or import ID.
- Import status.
- Rows received, valid rows, rejected rows.
- Current state in the import pipeline.

Say:

> This import is asynchronous and retry-safe. PostgreSQL stores the authoritative records, while Qdrant is rebuilt as a derived search index.

### 3. Inspect Processing Results

Open the completed import.

Show:

- Normalized brands and categories.
- Rejected rows with reasons.
- Products created or updated.
- Indexing status.
- Duplicate candidates generated.

### 4. Search the Catalog

Run a realistic query:

```text
noise cancelling headphones under 300 comfortable for long flights
```

Show:

- Hybrid search results.
- Filters for price/category/brand.
- Evidence fields.
- Lexical vs dense vs hybrid comparison if available.

Say:

> Structured constraints like tenant, price, and category are not delegated to embeddings. They are enforced as application and retrieval filters.

### 5. Open Evaluation Summary

Show a small benchmark report.

Show:

- Lexical baseline.
- Dense baseline.
- Hybrid result.
- nDCG@10, MRR, Recall@10, and latency.
- Dataset manifest and config version.

Say:

> The project only claims improvements that are reproducible from frozen evaluation manifests.

### 6. Review Duplicate Candidate

Open the duplicate review queue.

Choose a case where two supplier records probably refer to the same product or a variant.

Show:

- Supplier records side by side.
- Matching identifiers.
- Normalized attributes.
- Similarity signals.
- Evidence snippets.
- Proposed decision and confidence.

### 7. Approve or Reject

Approve a merge or mark as variant.

Show:

- Required permission.
- Human decision form.
- Idempotency key or operation ID.
- Resulting canonical product state.

Say:

> The system can propose, but the catalog mutation crosses a human approval boundary.

### 8. Audit Trail

Open the audit history.

Show:

- Import event.
- Search evaluation event.
- Review decision.
- Approved mutation.
- Actor, tenant, target, timestamp, and safe metadata.

### 9. Tenant Isolation Check

Switch tenant or attempt a bookmarked URL for another tenant's product.

Show:

- No cross-tenant search results.
- Forbidden API state or empty authorized result.

Say:

> Tenant isolation is tested at the API, repository, worker, and retrieval layers.

## Optional Closing Slide or README Section

End with four evidence bullets:

- Processed catalog rows.
- Retrieval metrics compared with baselines.
- Matching precision/false-merge rate.
- Security and idempotency tests passed.

## Demo Rule

Do not spend demo time explaining every future feature. Mention agents, MCP, memory, and Kubernetes only as roadmap items after the MVP workflow is credible.

