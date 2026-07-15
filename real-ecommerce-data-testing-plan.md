# Real E-Commerce Data Testing Plan

## Purpose

This document defines the real-world public datasets that will be used to build, test, and optimize the commerce AI platform before any merchant-specific validation.

The project will not be demonstrated using a single PDF, invented catalog, mock text file, or a handful of manually written queries. It will be evaluated on product catalogs, shopping queries, relevance judgments, browsing sessions, and purchase-related events originating from real e-commerce environments.

## What This Testing Can Prove

Testing with these datasets can provide credible evidence that the platform:

- Operates on realistically large commerce datasets.
- Improves product retrieval and ranking against measurable baselines.
- Handles difficult, ambiguous, and underspecified shopping queries.
- Identifies duplicate or equivalent product offers.
- Processes realistic behavioral event streams.
- Supports reproducible experiments rather than subjective demonstrations.
- Meets defined latency, throughput, reliability, and cost targets.

This testing demonstrates technical and product-quality performance on real commercial data. It does not, by itself, prove revenue improvement for a particular merchant.

## Primary End-to-End Dataset: Coveo SIGIR E-Commerce

The **Coveo SIGIR 2021 E-Commerce Data Challenge dataset** will be the platform's main end-to-end environment.

It contains real e-commerce behavior, including:

- Approximately 10 million product interactions.
- Approximately 57,000 products.
- Shopper sessions.
- Search queries.
- Product-detail views.
- Add-to-cart events.
- Purchase events.
- Product catalog metadata.

Sources:

- [Official Coveo dataset repository](https://github.com/coveooss/SIGIR-ecom-data-challenge)
- [SIGIR E-Commerce challenge description](https://sigir-ecom.github.io/ecom2021/data-task.html)

### Why It Is the Primary Dataset

Coveo provides both catalog information and behavioral events. This makes it possible to exercise the entire platform rather than evaluating only an isolated retrieval model.

The end-to-end workflow can include:

1. Importing and validating a real product catalog.
2. Ingesting historical commerce events asynchronously.
3. Building lexical and vector search indexes.
4. Replaying shopper sessions and queries.
5. Retrieving and reranking products.
6. Running agent workflows over catalog and search tools.
7. Recording traces, metrics, evaluations, failures, and costs.
8. Comparing alternative retrieval and ranking configurations.
9. Reindexing after configuration or data changes.
10. Testing scheduled jobs, retries, recovery, and deployment behavior.

### Capabilities to Optimize

The Coveo environment will be used to optimize:

- Product-search relevance.
- Query understanding and reformulation.
- Zero-result and low-result query recovery.
- Product discovery.
- Session-aware product ranking.
- Add-to-cart and purchase-related ranking signals.
- Performance for infrequent and newly encountered products.
- Search quality across product categories.
- Agent tool selection and execution reliability.
- Retrieval latency, throughput, infrastructure usage, and model cost.

### Evaluation Discipline

Behavioral data must be divided chronologically whenever the task depends on time. Earlier events will be used for development and later events for evaluation. Randomly mixing future interactions into training data could leak information and produce misleading results.

Evaluation splits and dataset versions must be immutable and version-controlled through manifests. Every experiment must record:

- Dataset version and time window.
- Index version.
- Embedding model.
- Reranking model.
- Retrieval configuration.
- Prompt and agent-graph versions.
- Random seed where applicable.
- Application commit.
- Infrastructure configuration.
- Latency and cost measurements.

## Specialist Dataset 1: Amazon Shopping Queries / ESCI

The **Amazon Shopping Queries Dataset** will be used for rigorous product-search relevance evaluation.

The full dataset contains approximately:

- 130,000 unique shopping queries.
- 2.6 million manually judged query-product relationships.
- English, Spanish, and Japanese examples.
- Product titles, descriptions, brands, colors, and other catalog fields.

Each query-product relationship has an ESCI label:

- **Exact:** the product directly satisfies the query.
- **Substitute:** the product is a reasonable alternative.
- **Complement:** the product is related but serves a complementary need.
- **Irrelevant:** the product does not appropriately satisfy the query.

Sources:

- [Amazon Science dataset page](https://www.amazon.science/code-and-datasets/shopping-queries-dataset-a-large-scale-esci-benchmark-for-improving-product-search)
- [Official dataset repository](https://github.com/amazon-science/esci-data)

### What ESCI Will Test

- BM25 or sparse retrieval baselines.
- Dense vector retrieval.
- Hybrid dense-sparse retrieval.
- Rank fusion strategies.
- Cross-encoder or LLM-assisted reranking.
- Query rewriting and expansion.
- Synonym and attribute-aware retrieval.
- Exact-product versus substitute recognition.
- Complementary-product confusion.
- Multilingual retrieval if added later.

The core metrics should include:

- nDCG@10.
- MRR.
- Recall@10 and Recall@50.
- Precision@K.
- ESCI classification metrics where classification is evaluated.
- P50, P95, and P99 retrieval latency.
- Cost per 1,000 queries.

Every advanced retrieval configuration must be compared with a simple baseline. Increased complexity is justified only when it produces a repeatable improvement at an acceptable latency and cost.

## Specialist Dataset 2: Web Data Commons Products

The **Web Data Commons Product Data Corpus and Gold Standard** will be used for catalog matching and entity resolution.

Version 2.0 contains:

- Approximately 26 million product offers.
- Offers originating from approximately 79,000 websites.
- Approximately 16 million clusters representing equivalent products.
- Product identifiers such as GTINs and manufacturer part numbers.
- A manually verified match/non-match gold standard.

Source:

- [WDC Product Data Corpus and Gold Standard](https://webdatacommons.org/largescaleproductcorpus/v2/)

### What WDC Will Test

- Candidate generation for possible duplicate products.
- Exact and fuzzy identifier matching.
- Brand and model normalization.
- Product-title and attribute similarity.
- Cross-source supplier-offer matching.
- Entity resolution with missing or inconsistent attributes.
- Safe match, non-match, and needs-review decisions.

The core metrics should include:

- Pairwise precision, recall, and F1.
- Precision-recall curves.
- False-merge rate.
- Missed-match rate.
- Candidate-generation recall.
- Review workload at different confidence thresholds.
- Processing throughput.
- Cost per 10,000 product pairs or offers.

False merges are particularly important. The system must not optimize overall F1 while silently accepting an unsafe number of incorrect product merges.

## Dataset-to-Capability Map

| Platform capability | Primary dataset | Main evidence |
| --- | --- | --- |
| End-to-end catalog and event ingestion | Coveo | Successful processing, data-quality reports, throughput and recovery behavior |
| Product search and ranking | Amazon ESCI and Coveo | nDCG, MRR, recall, behavioral replay results and latency |
| Query rewriting and advanced RAG | Amazon ESCI | Improvement over unchanged-query and simple retrieval baselines |
| Session-aware ranking | Coveo | Chronological next-event, add-to-cart, or purchase-related evaluation |
| Product matching and deduplication | WDC Products | Precision, recall, false-merge rate and review workload |
| ReAct and tool orchestration | All three through platform tools | Task success, correct tool use, grounded outputs and failure recovery |
| Asynchronous processing | Coveo and WDC | Throughput, retries, idempotency and dead-letter behavior |
| Scaling and observability | Scaled subsets of all datasets | Latency, saturation, traces, error rates and cost |
| Multi-tenancy | Partitioned real datasets | Isolation, authorization, filtered retrieval and noisy-neighbor tests |

## End-to-End Test Scenarios

### 1. Cold Platform Bootstrap

Start with empty PostgreSQL and Qdrant instances, ingest the selected catalog and event data, build indexes, and verify that all expected records and indexes are created without manual database intervention.

### 2. Historical Query Replay

Replay real queries against the retrieval API, capture ranked results, and calculate relevance and operational metrics. Compare lexical, dense, hybrid, and reranked configurations.

### 3. Catalog Matching Batch

Submit WDC offers through the asynchronous matching pipeline. Verify candidate generation, match decisions, confidence scores, evidence, review queues, idempotency, and recovery after worker interruption.

### 4. Agent Catalog Investigation

Give the ReAct agent a bounded catalog-resolution task that requires it to search products, inspect structured attributes, request matching candidates, and produce a cited recommendation. Evaluate the final decision and the intermediate tool trajectory.

### 5. Incremental Update and Reindexing

Introduce catalog changes after the initial index is built. Verify that affected products are updated, stale vectors are removed, indexes remain consistent, and queries return the new state.

### 6. Failure and Recovery

Interrupt workers, temporarily disable dependencies, inject rate limits, and submit duplicate events. Verify retries, exponential backoff, idempotency, dead-letter handling, alerts, and eventual recovery.

### 7. Tenant Isolation

Partition real products and queries into independently authorized tenants. Attempt cross-tenant access through APIs, metadata filters, vector retrieval, background jobs, caches, traces, and exports. Any cross-tenant disclosure is a release blocker.

### 8. Load and Capacity Testing

Replay queries and ingestion events at increasing rates. Determine sustainable throughput, saturation points, queue growth, autoscaling behavior, P95/P99 latency, error rates, and infrastructure cost.

## Required Baselines

The project should retain simple baselines so improvements remain credible:

- Lexical search without embeddings.
- Dense retrieval without lexical fusion.
- Hybrid retrieval without reranking.
- Deterministic catalog matching using exact identifiers.
- Direct tool workflow without an autonomous agent.

Each more advanced system must be evaluated against the relevant baseline using the same frozen test split.

## Evidence to Publish

The portfolio should eventually include:

- Dataset cards explaining sources, licenses, scope, and limitations.
- Reproducible dataset preparation commands.
- Frozen evaluation manifests.
- Baseline and advanced-system comparison tables.
- Retrieval-quality and entity-matching reports.
- Latency and throughput results.
- Failure-injection and recovery results.
- Observability screenshots or exported dashboards.
- A description of unsuccessful experiments and why they were rejected.
- Exact hardware, model, and infrastructure assumptions.

A defensible summary could use language such as:

> The platform was evaluated on public datasets derived from real e-commerce catalogs, search queries, relevance judgments, shopper sessions, and product interactions. Advanced retrieval and catalog-matching configurations were compared with reproducible baselines using frozen evaluation splits, while the complete containerized platform was exercised under ingestion, query-load, dependency-failure, recovery, and tenant-isolation scenarios.

## Important Limitations

- Public real-world datasets may be anonymized and may not expose every field available inside a merchant's production system.
- Historical behavioral events demonstrate offline performance, not guaranteed future revenue.
- Relevance labels and clicks measure different things; clicks can contain position and popularity bias.
- Product domains and languages represented in a dataset may not generalize to all stores.
- Dataset licenses and usage conditions must be reviewed before redistribution or publication.
- Results must state whether they come from labeled relevance evaluation, historical replay, simulation, or operational load testing.

## Recommended Starting Order

1. Begin with an English subset of Amazon ESCI to establish retrieval baselines.
2. Add hybrid retrieval and reranking experiments.
3. Integrate Coveo for the complete ingestion and behavioral replay workflow.
4. Add a manageable WDC subset for product matching and deduplication.
5. Expand data volume only after correctness and reproducibility are established.
6. Run reliability, security, multi-tenant, and load-testing suites.
7. Publish a versioned evaluation report alongside the deployed application.

This order keeps early development manageable while ensuring that the final evidence comes from substantial real e-commerce data rather than toy demonstrations.
