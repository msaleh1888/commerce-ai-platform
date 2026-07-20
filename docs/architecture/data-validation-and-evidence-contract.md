# Data Validation and Evidence Contract

## Purpose

This contract defines how the platform obtains real product data, validates import and normalization behavior, produces repeatable evidence, and publishes only claims that the evidence supports. It applies from M3 catalog ingestion through the final portfolio release.

It prevents two failures:

- treating a successful parse or a unit test as proof that real catalog data works; and
- presenting fabricated, altered, unlicensed, or unversioned data as real-world validation.

This contract is subordinate to the Final Target Architecture, the Catalog Ingestion Contract, the Evaluation Contract, ADR 0006, and the Observability and Operations Contract.

## Scope and Non-Goals

This governs data acquisition, data governance, corpus construction, import acceptance runs, labels, metrics, evidence artifacts, and publication.

It does not authorize a new data store, model provider, ingestion path, catalog mutation path, or benchmark result. M3 implements the approved ingestion path; M4 through M6 add their own task-specific evaluation runs through the existing `evaluation` domain.

## Terms

| Term | Meaning |
| --- | --- |
| Source corpus | Unmodified records obtained from an external publisher or authorized supplier. |
| Frozen subset | A reproducible selection of source records identified by a manifest and content hashes. |
| Golden label | A reviewed expected outcome for a source row or field. |
| Resilience fixture | A controlled transport or schema variation derived from a frozen source corpus. It is not represented as raw supplier data. |
| Holdout corpus | A frozen source subset not used to design mappings, validation rules, or acceptance thresholds. |
| Acceptance run | A complete Compose-backed run through upload, durable import, worker processing, persistence, and evidence collection. |
| Evidence bundle | The immutable manifest, command record, result records, metrics, samples, and report that support a claim. |

## Data-Source Policy

### Approved Source Roles

The platform uses sources for distinct purposes. A source is never selected simply because it is large or easy to download.

| Role | Initial source | Use | Milestone |
| --- | --- | --- |
| Primary commerce corpus | Open Icecat Open Catalog | Real electronics product records for M3 import/normalization and later catalog/search demonstrations. | M3 |
| Messy-data robustness corpus | Open Food Facts export subset | Real incomplete and multilingual records; validates parser and normalization robustness without claiming it is an electronics supplier feed. | M3, after primary corpus |
| Search relevance benchmark | Amazon Shopping Queries / ESCI | Versioned query-product relevance evaluation. | M4-M5 |
| Matching benchmark | WDC Products subset | Product entity-resolution and duplicate-detection evaluation. | M6 |
| Customer corpus | Written-permission supplier or retailer export | Deployment-specific validation. | Only when available |

Open Icecat is the primary M3 source because the MVP demo is electronics-oriented and the catalog includes commerce identifiers, product content, and specifications. Open Food Facts is a secondary robustness source, not a replacement for a supplier catalog. ESCI and WDC are not used to claim M3 import quality.

### Legal and Provenance Gate

No external data enters a validation corpus until a maintainer records all of the following in its source manifest:

- publisher name, source URL, retrieval date, and access method;
- applicable licence, terms, attribution text, and redistribution decision;
- whether the source contains personal data, credentials, contract-restricted data, images, or other excluded content;
- source version or publisher release identifier when available;
- SHA-256 hash, byte size, row count, and original filename for every acquired artifact; and
- the named maintainer who reviewed the source.

Raw external data is never committed to Git unless the licence explicitly permits redistribution and the file is small enough for repository policy. Raw private/customer data, access credentials, cookies, and tokens are never committed. Large frozen artifacts use the approved external-artifact location; Git stores only manifests, acquisition instructions, hashes, permitted tiny fixtures, and derived aggregate reports.

An unlicensed, scraped, unverifiable, or undocumented dataset is inadmissible. A source with unclear rights is rejected until the legal/provenance gate is completed.

## Dataset Layout and Manifests

The repository keeps small deterministic fixtures under `datasets/fixtures/`. It stores source and evaluation metadata under `datasets/manifests/` and evidence reports under `docs/evidence/` when those directories are introduced by their owning milestone. Large source artifacts remain outside Git.

Every corpus has one immutable versioned manifest. A manifest change creates a new version; it never edits the meaning of a prior run.

```yaml
manifest_version: 1
corpus_id: icecat-electronics-import-v1
task_type: catalog_import_normalization
source:
  publisher: Open Icecat
  url: https://example.invalid/source-recorded-at-acquisition
  licence: recorded-before-acquisition
  retrieved_at: 2026-07-20T00:00:00Z
  attribution: recorded-before-publication
artifacts:
  - logical_name: supplier-feed-a
    original_filename: source-file.csv
    sha256: required
    bytes: required
    row_count: required
split:
  development: explicit-stable-row-ids
  holdout: explicit-stable-row-ids
labels:
  golden_label_version: required
  reviewer_protocol_version: required
acceptance_thresholds:
  row_conservation: 1.0
  duplicate_replay_effective_changes: 0
  cross_tenant_records: 0
  required_field_accuracy: declared-before-run
provenance:
  app_commit: required-at-run-time
  manifest_hash: required-at-run-time
```

Example values above are a schema illustration, not an acquired source or an achieved result.

## Corpus Construction

### 1. Acquire and Freeze

1. Obtain the source through its documented publisher channel or written customer permission.
2. Preserve the exact original bytes and filename without cleaning, opening in a spreadsheet, or re-exporting the file.
3. Calculate SHA-256, byte size, physical-record count, encoding, delimiter or media type, and retrieval timestamp.
4. Write and review the source manifest before creating any derived file.
5. Freeze an explicit development subset and an explicit holdout subset by stable source IDs or immutable row references.

The holdout subset is not inspected while creating field mappings, normalization rules, or thresholds. It is used only at the acceptance gate.

### 2. Build Golden Labels

Golden labels are a small, reviewed truth set, not labels inferred from the implementation under test.

For M3, sample source rows across suppliers, categories, identifier quality, missingness, languages, and expected failure modes. For each sampled row, record:

- stable source reference and source-artifact hash;
- expected disposition: accepted, rejected, or quarantined;
- expected safe reason code when not accepted;
- expected normalized values for each required field;
- raw value retained for each normalized field;
- reviewer, review date, and rationale/reference; and
- a second-review decision for disputed or high-impact labels.

The label set must include valid rows, missing required identifiers, malformed prices/currencies, duplicate source rows, unsupported categories, header variations, and rows whose correct outcome is rejection. It must never silently remove difficult rows to improve a metric.

### 3. Create Resilience Fixtures Separately

Resilience fixtures are derived only after a real source corpus has been frozen. They may introduce UTF-8 BOMs, alternate delimiters, quoted multiline values, harmless whitespace, header aliases, duplicate deliveries, unsupported currencies, malformed rows, and missing required fields.

Each resilience fixture records its parent manifest hash and transformation script/version. Reports label it as `derived_resilience_fixture`; it is never described as a raw supplier export or used to inflate real-source quality metrics.

## M3 Import and Normalization Acceptance Protocol

### Preconditions

Before an acceptance run:

1. Use the pinned application commit, migration revision, Compose configuration, manifest version, and seed version recorded in the run record.
2. Start a clean local/staging environment with PostgreSQL, Redis, API, worker, and configured artifact storage ready.
3. Create two tenant contexts: one target tenant and one isolation tenant.
4. Confirm the target user has the import capability and the isolation user has no membership in the target tenant.
5. Record correlation IDs and operation IDs for every upload and replay.

### Required End-to-End Runs

For every frozen source artifact, execute these runs through the user-facing API/UI and the real worker path:

| Run | Required proof |
| --- | --- |
| Initial import | Original artifact stored immutably; import progresses through durable states; every row has an outcome; accepted products retain raw and normalized data. |
| Exact replay | Same artifact and tenant produce the documented duplicate-content outcome with zero duplicate effective products, row outcomes, or audit events. |
| Retry/recovery | An interrupted worker run resumes/retries without duplicate effective changes and reaches a documented terminal state. |
| Partial failure | Invalid rows preserve safe reason codes and source references while valid rows follow the configured partial-success behavior. |
| Isolation attempt | A second tenant cannot read, retry, or obtain rows/products/audit records from the target tenant import. |
| Holdout import | The untouched holdout subset completes under the same rules and is reported separately from development results. |

No script may insert rows directly into catalog tables to simulate a successful import. API routes create intent, workers invoke use cases, PostgreSQL remains authoritative, and tests inspect durable results through approved contracts.

### Required Measurements

Every acceptance run reports:

- input physical-row count;
- accepted, rejected, quarantined, and unprocessed row counts;
- row-conservation equation: `input = accepted + rejected + quarantined + explicitly-unprocessed`;
- per-field normalization accuracy on golden labels, including numerator, denominator, and excluded-label rationale;
- disposition precision/recall for accepted versus rejected/quarantined rows;
- identifier preservation and normalization outcomes for GTIN, MPN, SKU, brand, and supplier product reference where present;
- import duration, rows per second, worker retry count, terminal status, and safe failure classifications;
- duplicate-content replay effective-product count and effective-audit-event count;
- cross-tenant record, product, artifact, audit, and retrieval-result counts; and
- manual review sample size, disagreement count, and unresolved-label count.

Row conservation, duplicate replay, and tenant isolation are invariants: a non-zero violation fails the run. Quality thresholds for a specific corpus are declared in its manifest before the holdout run; a threshold is never lowered after observing a holdout result. A failed threshold remains a documented result and creates a remediation task, not a rewritten report.

## Verification and Human Adjudication

Automated checks establish correctness at scale; human review establishes that the checks mean the right thing.

For each acceptance run, a reviewer inspects a stratified sample of accepted, rejected, normalized, and ambiguous rows. The sample must include high-value identifiers, rows changed by normalization, and each failure reason that occurred. The reviewer compares the immutable source representation with the stored raw and normalized records, then records pass, defect, or label disagreement.

Defects are classified as parser, schema mapping, validation, normalization, idempotency, tenant scope, worker/retry, artifact provenance, or reporting defects. A defect is fixed against the development corpus and rerun against the untouched holdout corpus. The original failed evidence remains immutable.

## Evidence Bundle and Report

Every publishable result has an evidence bundle containing:

- source and corpus manifest hashes;
- application commit, migration revision, image/tag, configuration version, and run timestamps;
- tenant-safe import IDs, operation IDs, and correlation IDs;
- immutable input artifact references and hashes;
- machine-readable row outcome summary and metrics;
- golden-label and manual-adjudication summaries;
- replay, recovery, and isolation results;
- safe logs or trace references with secrets and unrestricted source content redacted; and
- the human-readable report and its known limitations.

The human-readable report answers:

1. Which real source records were tested and under what rights?
2. Which application version and configuration processed them?
3. What happened to every row?
4. Which fields were validated against reviewed truth?
5. What failed, why, and what remains uncertain?
6. Did replay, retry, tenant isolation, and audit invariants hold?
7. Which claims are supported, and which claims are not yet supported?

Public README, portfolio, case-study, and sales claims may use only a completed evidence bundle. They must name the dataset/corpus version and distinguish real-source results, derived resilience results, fixture/CI results, and planned targets.

## Milestone Gates

| Milestone | Required evidence |
| --- | --- |
| M3 | Source manifest, golden labels, real-source and holdout import runs, row conservation, idempotent replay, retry/recovery, row-error review, tenant-isolation result, and import/audit report. |
| M4 | M3 evidence plus persisted catalog verification and tenant-scoped lexical-search results. |
| M5 | Frozen retrieval manifest, lexical/dense/hybrid comparison, index/config/model provenance, latency, and tenant-filter proof. |
| M6 | Frozen matching manifest, candidate recall, precision/recall/F1, false-merge analysis, review-workload analysis, approval idempotency, and audit proof. |
| M7 | Reproducible demo script, current evidence bundle links, screenshots/video, documented limitations, and only evidence-supported public claims. |
| Final release | M3-M7 evidence plus observability, failure recovery, reindexing, backup/restore, load/soak, security, and deployment evidence required by the final architecture. |

## CI and Reproducibility Policy

Pull-request CI runs only small committed fixtures and deterministic manifest-validation checks. It verifies schema validity, fixture hashes, row-conservation behavior, tenant isolation, replay behavior, and report-generation logic without downloading external corpora.

Real-source and holdout acceptance runs execute locally or in a controlled scheduled environment using pre-frozen artifacts. Network downloads are never part of a normal CI test. Any run that cannot identify its artifact hashes, manifest version, application commit, and configuration is invalid and cannot produce a published metric.

## Decision Needed Before Implementation

Before M3 data acquisition begins, record the chosen Open Icecat access path, its exact licence/attribution terms, the approved external-artifact location, the first corpus size, and the corpus-specific quality thresholds in the first M3 manifest. Those facts cannot be invented by an implementation agent.
