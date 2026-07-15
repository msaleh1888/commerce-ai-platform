# Requirements

## Requirement Levels

- Must: required for the first portfolio MVP.
- Should: expected soon after MVP if time allows.
- Could: useful later, not required for the first release.

## Functional Requirements

### Authentication and Tenancy

- Must support user sign-in for local/demo environments.
- Must support at least one seeded demo tenant.
- Must associate every protected business record with a tenant.
- Must enforce tenant scope in repositories, API handlers, background workers, and retrieval queries.
- Must support roles for administrator, catalog manager, merchandiser, AI engineer, and viewer.
- Should support invitation or seeded membership setup.

### Catalog Sources and Imports

- Must allow CSV and JSON catalog import.
- Must store the original source payload or row-level source representation.
- Must compute a content hash for uploaded files.
- Must detect duplicate imports for the same tenant/source/content.
- Must expose import status and row counts.
- Must preserve row-level validation errors.
- Must process imports asynchronously through Celery.
- Must make worker retries safe and idempotent.
- Should support a simulated supplier API after file import works.

### Product Normalization

- Must normalize brand, category, title, price, currency, identifiers, and attributes where possible.
- Must retain both raw supplier data and normalized internal fields.
- Must create or update supplier product records.
- Must create canonical product records or candidate links.
- Must mark records that require review.
- Should support versioned normalization rules.

### Search

- Must provide product search scoped by tenant.
- Must support lexical baseline search.
- Must support dense retrieval through Qdrant.
- Must support hybrid retrieval using deterministic fusion.
- Must support metadata filters.
- Must return product IDs, ranking positions, score details, and evidence references.
- Must prevent cross-tenant products from appearing in search results.
- Should support query logging for evaluation and debugging.

### Duplicate and Variant Review

- Must generate duplicate candidates from deterministic and semantic signals.
- Must create review cases with evidence and confidence.
- Must allow authorized users to approve, reject, mark variant, or defer.
- Must require human approval before catalog merge or variant mutation.
- Must make approval execution idempotent.
- Must record decision rationale and audit events.
- Should support confidence thresholds that route cases to automatic safe states only when risk is low.

### Evaluation

- Must define frozen evaluation manifests.
- Must compare lexical, dense, and hybrid retrieval on the same query set.
- Must compare matching results against labeled or synthetic match pairs.
- Must record dataset version, index version, model version, app commit, and config.
- Must separate retrieval evaluation from generation evaluation.
- Should support Amazon ESCI subset evaluation.
- Should support WDC Products subset matching evaluation.
- Could support Coveo behavioral replay later.

### Audit

- Must record import creation and completion.
- Must record review decisions.
- Must record approved catalog mutations.
- Must record evaluation runs.
- Must include actor, tenant, timestamp, action, target, and safe metadata.
- Should redact secrets and sensitive raw content from logs.

### Frontend

- Must provide a usable application shell.
- Must show import setup and status.
- Must show product search and result evidence.
- Must show duplicate review queue and case detail.
- Must show evaluation summary.
- Must show audit history.
- Should keep the UI dense, operational, and professional rather than marketing-oriented.

## Non-Functional Requirements

### Correctness

- Must assert state transitions in tests.
- Must assert idempotency for duplicate import and duplicate approval execution.
- Must assert that Qdrant is rebuildable from PostgreSQL.

### Security

- Must enforce tenant isolation in all data paths.
- Must enforce role permissions server-side.
- Must treat AI output as untrusted input.
- Must not log secrets.
- Must include prompt-injection fixtures in tests for product content.

### Reliability

- Must make asynchronous tasks retry-safe.
- Must preserve enough failure details for retry and diagnosis.
- Must avoid marking products searchable until required indexing completes.
- Should include worker crash simulation for import and indexing.

### Performance

- Must record basic latency for search and import processing.
- Should target local MVP search p95 under 1 second before generation.
- Should target generated recommendation or explanation p95 under 8 seconds if LLM generation is included.
- Could add load testing after MVP correctness is stable.

### Operability

- Must expose health endpoints.
- Must provide structured logs.
- Should expose basic metrics counters for imports, search, review decisions, errors, and task duration.
- Could add OpenTelemetry, Prometheus, Grafana, and Langfuse after MVP.

## Acceptance Test Themes

- Tenant A cannot read, search, approve, or audit Tenant B records.
- Re-uploading the same file does not create uncontrolled duplicates.
- Retried tasks do not apply duplicate effective changes.
- Search filters are applied before or during retrieval, not after leaking unauthorized candidates.
- Review decisions produce the expected canonical product state.
- Evaluation reports are reproducible from a frozen manifest.

