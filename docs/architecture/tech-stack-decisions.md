# Tech Stack Decisions

## Purpose

This document records the major technology choices for the commerce AI platform. It is intentionally broader than the current MVP implementation: the stack should support the final release path across catalog ingestion, normalized product data, evaluated search, duplicate review, human approval, agents, observability, and production-like operations.

Each section lists the selected choice, realistic alternatives, why the choice fits this project, and when the decision should be reconsidered.

## Decision Principles

- Favor reliable business state over impressive but fragile AI demos.
- Make tenant isolation, auditability, idempotency, and human approval easy to test.
- Treat AI and vector indexes as derived or assistive systems, not sources of authority.
- Start with a modular monolith, but draw boundaries that can become services later.
- Prefer boring infrastructure for core product correctness and focused AI tooling for measurable AI quality.
- Keep portfolio claims backed by reproducible tests, evaluation runs, screenshots, or operational evidence.

## Application Architecture

### Choice

Use a modular monolith backend with independently runnable web, API, worker, migration, and later gateway processes.

### Alternatives Considered

- Microservices from the beginning.
- A single full-stack Next.js application with no separate API service.
- A backend-for-frontend only architecture.
- Event-sourced architecture from the beginning.

### Why This Choice

The product has several domains: identity, tenancy, catalogs, products, ingestion, retrieval, matching, approvals, evaluation, audit, and observability. These domains need clear ownership, but the early product also needs fast iteration and simple transactions. A modular monolith gives us explicit module boundaries without the deployment, network, data consistency, and local development overhead of premature microservices.

Separate runtime processes still matter. The web app, API, worker, migration command, and later MCP/agent gateway have different operational responsibilities. Keeping them independently runnable gives the project production-like behavior while preserving one coherent business system.

### Reconsider When

- A module needs independent scaling or release cadence.
- A process creates unacceptable resource contention.
- Team ownership boundaries become real.
- Integration or AI gateway responsibilities require separate deployment security.

## Frontend Framework

### Choice

Use Next.js with the App Router, React, TypeScript, and Tailwind CSS.

### Alternatives Considered

- Next.js Pages Router.
- Vite with React.
- Remix or React Router framework mode.
- Server-rendered templates with minimal React.
- A low-code/internal-tool framework.

### Why This Choice

The final product needs a polished SaaS application shell, nested workflow pages, route-level tenant context, static and dynamic screens, screenshot testing, and a credible modern frontend story. Next.js App Router supports nested layouts and route organization well for a multi-section operations product. TypeScript improves data contract safety as API and frontend models evolve. Tailwind keeps design tokens and dense operational UI styling close to implementation while still allowing a controlled design system.

Vite would be simpler, but the app benefits from Next's routing, metadata, layout, and production conventions. Pages Router is mature but less aligned with a new app. Low-code tools would reduce credibility for a portfolio engineering platform and make deep workflow polish harder to own.

### Reconsider When

- Server rendering becomes unnecessary and Vite would materially simplify the app.
- Next.js operational complexity outweighs its routing/layout benefits.
- The application needs a different deployment/runtime model.

## Frontend UI System

### Choice

Use Tailwind CSS with project-owned design tokens and small base primitives; use shadcn-style component patterns and lucide icons where useful.

### Alternatives Considered

- Ant Design.
- Material UI.
- Chakra UI.
- Fully custom CSS modules.
- Headless UI/Radix only with no local primitives.

### Why This Choice

This product needs to look like a premium B2B operations SaaS, not a generic admin template. Tailwind plus local primitives lets us implement a dense, evidence-focused UI while preserving strong control over spacing, color, status states, and visual tone. shadcn-style composition is a good fit because it encourages owned components built on accessible primitives instead of a large visual framework.

Ant Design and Material UI are productive, but their default visual language can dominate the product. This project needs a distinctive review/evidence workflow and strong portfolio polish. Fully custom CSS would maximize control but slow iteration.

### Reconsider When

- Accessibility or component complexity exceeds what local primitives can maintain.
- A larger team needs a more formal component package.
- Design requirements settle enough to justify extracting a component library.

## Backend Framework

### Choice

Use FastAPI with Pydantic v2 and Uvicorn/Gunicorn-compatible deployment.

### Alternatives Considered

- Django and Django REST Framework.
- Flask.
- Node.js/NestJS.
- Go with chi/gin/fiber.
- A serverless API stack.

### Why This Choice

FastAPI fits a Python-heavy AI and data product. It provides strong typed request/response models, OpenAPI generation, dependency injection, async-friendly HTTP handling, and a smooth path to integrating Python AI, evaluation, and data tooling. Pydantic models are useful at trust boundaries, especially because AI output and supplier catalog data must be validated before use.

Django is excellent for admin-heavy CRUD products, but this app's core difficulty is async ingestion, retrieval, evaluation, and AI-assisted workflows rather than conventional admin scaffolding. Node/NestJS would align with frontend TypeScript but would make Python AI/evaluation integration less direct. Go would be strong operationally but slower for AI/data iteration.

### Reconsider When

- Python runtime performance becomes the bottleneck for core API paths.
- The product becomes mostly conventional CRUD/admin and Django would accelerate delivery.
- A separate high-performance service is justified for a narrow path.

## Primary Database

### Choice

Use PostgreSQL as the source of truth.

### Alternatives Considered

- MongoDB.
- MySQL.
- SQLite for local-first development.
- DynamoDB or another managed NoSQL database.
- Event store as the primary source of truth.

### Why This Choice

The final product's authoritative state is relational and safety-critical: tenants, users, memberships, roles, imports, import rows, supplier products, canonical products, duplicate candidates, review cases, approvals, audit events, evaluation runs, and idempotency records. PostgreSQL gives us transactions, constraints, foreign keys, indexes, row-level query patterns, JSONB where controlled flexibility is useful, and mature migration tooling.

MongoDB is a good fit for highly flexible document-first products, but this platform needs strong integrity around catalog mutation, tenant isolation, review decisions, and audit trails. A document database would push more correctness into application code. MySQL could work, but PostgreSQL has stronger JSON, full-text, extension, and analytical flexibility for this domain. SQLite is useful for tiny local tools but not for the target multi-tenant workflow.

### Reconsider When

- A specific high-volume document workload needs a dedicated document store.
- A specialized analytical store is needed for large evaluation/event analysis.
- Enterprise deployment constraints require a different managed database.

## Vector Index

### Choice

Use Qdrant as a derived vector index for dense and hybrid retrieval.

### Alternatives Considered

- pgvector in PostgreSQL.
- Pinecone, Weaviate, Milvus, Vespa, or OpenSearch vector search.
- A custom FAISS index.

### Why This Choice

The platform must demonstrate dense retrieval, hybrid retrieval, tenant-filtered vector search, and rebuildable derived indexes. Qdrant is strong for local Docker development, payload filtering, and vector-search focused APIs. Keeping it derived from PostgreSQL reinforces the source-of-truth boundary: Qdrant accelerates retrieval, but it does not own product state.

pgvector would simplify infrastructure and may be enough early, but separating vector search into Qdrant makes reindexing, payload filtering, and vector experimentation more visible. Managed services like Pinecone are strong in production, but they reduce local reproducibility and add cost/secrets overhead for a portfolio MVP. FAISS is powerful but would require more index-serving infrastructure.

### Reconsider When

- Local Qdrant no longer matches production requirements.
- Retrieval scale or latency requires a managed vector service.
- PostgreSQL plus pgvector is proven sufficient and reduces operational burden.
- Hybrid lexical/vector ranking requires a search engine such as OpenSearch or Vespa.

## Object Storage

### Choice

Use an S3-compatible object-storage abstraction for immutable original catalog upload bytes and large immutable evidence artifacts. Use MinIO as the Docker Compose local implementation. Use a managed S3-compatible provider in production-like deployments behind the same approved adapter contract.

PostgreSQL remains authoritative for import records, artifact metadata, content hashes, workflow state, row outcomes, idempotency records, audit references, and evaluation run records. Object storage holds immutable bytes only.

This decision is governed by [ADR 0009](adr/0009-s3-compatible-import-artifact-storage.md).

### Alternatives Considered

- PostgreSQL large-object or bytea storage for original uploads.
- Local filesystem storage.
- Provider-specific cloud SDK usage directly from use cases.
- Redis, Celery results, Qdrant, browser state, or task logs as artifact storage.

### Why This Choice

Catalog imports need durable original bytes for retry, duplicate detection, row provenance, audit, and evidence. S3-compatible storage keeps those bytes outside the relational source of truth while preserving a portable local-to-production contract. MinIO fits the required Docker Compose topology and lets API and worker processes exercise the same object-storage boundary locally.

Keeping PostgreSQL authoritative prevents object storage from becoming a second business database. Browser state, Redis, Celery result metadata, Qdrant, and logs are not durable artifact authorities and cannot decide whether an import exists or has completed.

### Reconsider When

- A production deployment target cannot provide S3-compatible storage.
- Artifact immutability, retention, encryption, or legal-hold requirements exceed the selected provider.
- Evaluation artifacts need a specialized artifact-management platform with a new ADR.

## Cache, Queue, and Coordination

### Choice

Use Redis for Celery broker/backend, short-lived coordination, locks, and cache-like data.

### Alternatives Considered

- RabbitMQ.
- PostgreSQL-backed task queues.
- Kafka or Redpanda.
- Cloud queues such as SQS, Pub/Sub, or Azure Service Bus.

### Why This Choice

Redis is simple to run locally, well supported by Celery, and enough for M1 through MVP async work. The product needs background processing, not a full streaming platform at the beginning. Redis also supports short-lived locks and coordination for idempotent ingestion/indexing tasks.

RabbitMQ is stronger as a broker and may be better for heavier production Celery workloads, but adds operational complexity. Kafka/Redpanda are useful for event streaming, not the current job-processing shape. Cloud queues are good deployment targets later but would reduce local reproducibility now.

### Reconsider When

- Redis-backed Celery becomes unreliable under load.
- Queue semantics require stronger delivery, routing, or dead-letter behavior.
- Deployment moves to managed cloud primitives.
- Event streaming becomes a first-class product need.

## Background Processing

### Choice

Use Celery workers with idempotent task design.

### Alternatives Considered

- RQ, Dramatiq, Huey, Arq.
- Temporal, Prefect, Dagster, Airflow.
- Native cloud workflow engines.
- In-process background tasks.

### Why This Choice

Catalog imports, indexing, matching, evaluation, and later AI jobs can be slow and failure-prone. Celery is mature, Python-native, and practical with Redis. It lets HTTP requests record intent and return quickly while workers process durable state transitions. The architecture requires idempotency keys, durable status records, and database constraints because Celery delivery can be at least once.

Temporal is attractive for complex long-running workflows and may become relevant later, but it would add significant infrastructure and conceptual weight before the core product workflow is proven. In-process background tasks are too fragile for imports and catalog mutations.

### Reconsider When

- Workflows need durable multi-step orchestration that Celery makes awkward.
- Retry/recovery logic becomes difficult to reason about.
- A managed workflow service becomes available in the target deployment.

## Search Strategy

### Choice

Use PostgreSQL-backed lexical search first, Qdrant dense retrieval second, and deterministic hybrid fusion for comparison.

### Alternatives Considered

- Qdrant-only search.
- OpenSearch/Elasticsearch from the beginning.
- Managed search service.
- LLM-only search/reasoning.

### Why This Choice

The product's credibility depends on measured search quality, not vague AI claims. Lexical search provides a transparent baseline. Dense retrieval adds semantic recall. Hybrid retrieval allows measurable comparison. Keeping lexical baseline and dense retrieval separate makes evaluation honest and helps explain why AI retrieval improves or fails.

OpenSearch is powerful but heavy for early local development. Qdrant-only search would make it harder to compare dense search against a deterministic baseline. LLM-only search is not appropriate for catalog retrieval because it is harder to constrain, evaluate, and tenant-filter safely.

### Reconsider When

- Product browsing/search needs advanced lexical ranking, faceting, typo tolerance, or analytics.
- PostgreSQL lexical search is insufficient at scale.
- Hybrid retrieval needs a dedicated ranking/search engine.

## AI Model Integration

### Choice

Start with narrow model-provider adapters for embeddings and structured proposals; add LangGraph/ReAct agents only after deterministic workflows and evaluations are strong.

### Alternatives Considered

- Build an agent-first architecture.
- Use a multi-provider abstraction from day one.
- Use only deterministic algorithms and no LLM/embedding providers.
- Put model calls directly in services or routes.

### Why This Choice

The platform needs AI that is measurable, bounded, and safe. Embeddings and structured proposals are useful in retrieval and duplicate review, but they should flow through adapters that validate outputs and record model/config metadata. Agents can be valuable later, but only after the product has stable tools, permissions, evaluation data, and approval boundaries.

An agent-first architecture would be flashier but riskier: it can blur authority, permissions, and auditability. A broad provider abstraction too early often hides important differences and slows useful implementation. Direct model calls in routes/services would scatter cost, latency, prompt, and validation concerns.

### Reconsider When

- Multiple providers are actively used and duplicated adapter code appears.
- Agent workflows have clear tools, budgets, checkpoints, and evaluation metrics.
- Model calls become latency/cost-critical enough to need centralized orchestration.

## Human Approval and Audit

### Choice

Use explicit approval records and append-only audit events for risky catalog mutations.

### Alternatives Considered

- Fully automatic duplicate merges above a confidence threshold.
- Soft audit through application logs only.
- Event sourcing for all state changes.
- Manual review with no persisted proposal lifecycle.

### Why This Choice

False product merges can corrupt catalog state. The final product should demonstrate responsible AI operations: AI can identify candidates and propose actions, but authorized humans approve risky mutations. Approval execution must be idempotent, transactional, and audited. Audit events should be queryable product data, not only logs.

Event sourcing could provide a strong audit model, but it adds complexity before the core state model is mature. Automatic merge thresholds may come later for very low-risk cases, but the portfolio story is stronger when uncertainty and human approval are visible.

### Reconsider When

- Evaluation proves certain mutation classes are safe for automatic handling.
- Compliance requirements demand a stricter event-sourced model.
- Audit volume requires a separate analytical/event store.

## Authentication and Tenancy

### Choice

Use application-level authentication with shared-schema multi-tenancy and explicit tenant scope in every protected data path.

### Alternatives Considered

- Database-per-tenant.
- Schema-per-tenant.
- Row-level security as the only isolation mechanism.
- Single-tenant demo mode only.

### Why This Choice

The product is a SaaS platform, so tenant isolation is core to the architecture and portfolio credibility. A shared schema with explicit tenant IDs keeps local development and MVP workflows practical while still forcing the codebase to handle real multi-tenant boundaries. Repository APIs, API dependencies, worker payloads, Qdrant filters, audit queries, and evaluation runs must all carry tenant scope.

Database-per-tenant and schema-per-tenant can improve physical isolation for enterprise needs, but they add migration and operational complexity. PostgreSQL row-level security may be valuable later as defense-in-depth, but application code still needs explicit tenant-aware APIs and tests.

### Reconsider When

- Enterprise/compliance needs require physical isolation.
- Tenant volume or data size changes operational economics.
- Row-level security can be added cleanly as an additional protection layer.

## Backend Persistence Pattern

### Choice

Use repositories and services/use cases over SQLAlchemy and Alembic.

### Alternatives Considered

- Put SQLAlchemy queries directly in routes.
- Active Record style models.
- Raw SQL everywhere.
- A strict domain-driven design aggregate model from the beginning.

### Why This Choice

Routes should stay thin and services should own business workflows. Repositories isolate SQL mechanics and make tenant-scoped query requirements visible. SQLAlchemy provides composable SQL access and connection/session management, while Alembic gives versioned migrations. Raw SQL remains acceptable for complex search/evaluation paths where it is clearer or faster.

A strict DDD model could become valuable in parts of approvals or products, but applying it everywhere too early would slow delivery. Direct queries in routes would quickly undermine tenant isolation, testing, and worker reuse.

### Reconsider When

- Repository abstractions become pass-through noise.
- Complex workflows need stronger aggregate boundaries.
- Performance-critical queries are clearer as dedicated SQL modules.

## API Contract Style

### Choice

Use REST/JSON APIs with Pydantic models and generated OpenAPI documentation.

### Alternatives Considered

- GraphQL.
- tRPC.
- gRPC.
- Event-only APIs.

### Why This Choice

REST fits the product's resource and workflow shape: imports, products, searches, review cases, decisions, evaluations, and audit events. It is easy to test, document, and expose later through governed MCP tools. Pydantic models give strong request/response validation and OpenAPI makes the platform legible.

GraphQL could be useful for complex frontend aggregation, but it adds authorization and caching complexity. tRPC is attractive in TypeScript-only stacks but less natural across FastAPI/Python. gRPC is better for internal service-to-service communication than browser-facing product APIs.

### Reconsider When

- Frontend data composition becomes too chatty.
- Internal services are extracted and need typed RPC.
- External API consumers need a different contract style.

## Realtime and Progress Updates

### Choice

Start with persisted status polling; add Server-Sent Events or WebSockets for long-running workflow freshness after import/review flows are stable.

### Alternatives Considered

- SSE from the beginning.
- WebSockets from the beginning.
- Polling only forever.
- Push notifications.

### Why This Choice

Long-running imports, indexing, matching, and evaluation jobs need visible progress. Persisted status must be the source of truth regardless of realtime delivery. Polling is enough to build correct workflows first. SSE is a likely final fit because the server mostly pushes one-way progress/state updates to the browser. WebSockets are more powerful but unnecessary unless bidirectional realtime collaboration appears.

### Reconsider When

- Polling creates unacceptable latency or load.
- Multiple screens need consistent live progress updates.
- Collaborative review or bidirectional interactions become product requirements.

## Evaluation and Experiment Tracking

### Choice

Use versioned evaluation manifests and stored evaluation run records; consider Langfuse or a dedicated experiment tracker later.

### Alternatives Considered

- Manual README metrics.
- Ad hoc notebooks only.
- MLflow, Weights & Biases, Langfuse, or custom experiment database from day one.

### Why This Choice

The project's AI claims must be reproducible. Versioned manifests can record dataset subset, labels, model/index/config versions, metric definitions, and commit SHA. This is enough to support honest portfolio claims and compare lexical, dense, hybrid, and matching approaches. A dedicated tracker can be added when there are enough experiments to justify it.

Manual metrics are not credible. Notebooks are useful for exploration but weak as product evidence. Dedicated trackers are powerful but can distract from building the workflow.

### Reconsider When

- Evaluation runs become frequent enough to need dashboards and experiment comparison.
- LLM traces and prompt/version analysis become central.
- Team collaboration requires a managed experiment store.

## Observability

### Choice

Use structured logs and health/readiness early; add OpenTelemetry traces, metrics, dashboards, and AI observability as the product matures.

### Alternatives Considered

- Full OpenTelemetry, Prometheus, Grafana, and Langfuse from day one.
- Logs only.
- Vendor-specific observability only.

### Why This Choice

The final release should show production-minded operation: traces across API and worker, queue age, import latency, search latency, matching/evaluation metrics, error rates, and model cost/latency. OpenTelemetry is the right neutral instrumentation foundation. Prometheus/Grafana are strong local and production-like evidence tools. Langfuse may be useful when LLM/agent traces become meaningful.

Adding the full stack before core workflows exist creates instrumentation without signal. Logs only would be insufficient for the final release because failure diagnosis, latency, and AI cost/quality need evidence.

### Reconsider When

- A deployment target standardizes on a managed observability platform.
- LLM/agent workflows require specialized tracing earlier.
- Metrics volume requires a different storage backend.

## Local Runtime and Deployment

### Choice

Use Docker Compose for local development; target Kubernetes or a production-like orchestrator for the final release candidate.

### Alternatives Considered

- Local native services only.
- Dev Containers only.
- Docker Compose as the only deployment model.
- Serverless/container-app managed platforms only.

### Why This Choice

The platform has multiple services and dependencies: PostgreSQL, Redis, Qdrant, API, worker, web, and later observability. Docker Compose gives a repeatable local runtime and CI validation surface. For the final production-readiness story, Kubernetes or a similar orchestrator is useful because it demonstrates migrations, readiness/liveness probes, resource limits, rollout behavior, and recovery exercises.

Compose alone is excellent for local development but not enough to demonstrate production-like operation. Managed platforms can be a later deployment option, but Kubernetes evidence is portable and recognizable.

### Reconsider When

- The final deployment target is a specific managed platform.
- Kubernetes scope would distract from stronger product evidence.
- Local Compose no longer represents necessary integration behavior.

## CI/CD

### Choice

Use GitHub Actions for CI, validation, and later release automation.

### Alternatives Considered

- Manual local validation only.
- GitLab CI, CircleCI, Azure Pipelines.
- A custom build server.

### Why This Choice

The repository is hosted on GitHub and PR-driven development is already part of the workflow. GitHub Actions is the simplest place to run backend tests, frontend checks, migration validation, Compose validation, and later Docker/integration/evaluation smoke tests. It also gives portfolio reviewers visible evidence that checks are automated.

### Reconsider When

- Deployment target requires another CI/CD platform.
- Build times require a more specialized runner strategy.
- Release automation becomes complex enough for a dedicated pipeline system.

## Package and Tooling

### Choice

Use Python packaging through `pyproject.toml`, npm for the web app, pytest for Python tests, and Playwright for browser smoke tests.

### Alternatives Considered

- uv as the primary Python workflow.
- Poetry or PDM.
- Bun or pnpm for frontend tooling.
- unittest instead of pytest.
- Cypress instead of Playwright.

### Why This Choice

`pyproject.toml` is the standard Python packaging center and keeps console scripts, dependencies, and test config visible. npm is the most universally available frontend package manager and fits the current Next.js skeleton. pytest is the strongest practical default for Python service tests. Playwright is well suited to screenshot smoke tests and cross-browser UI verification.

uv is attractive and may be adopted later for speed/reproducibility, but requiring it too early can add local setup friction. pnpm or Bun could improve frontend installs, but npm is the least surprising default. Cypress is good, but Playwright better supports screenshot and multi-browser validation for the planned UX review loop.

### Reconsider When

- Dependency lock/reproducibility needs become stricter.
- CI speed becomes a bottleneck.
- Frontend workspace complexity grows.

## MCP and External Tool Boundary

### Choice

Add a separate MCP server later as an anti-corruption layer over governed backend APIs.

### Alternatives Considered

- Build MCP into the main API.
- Let agents access the database or internal services directly.
- Skip MCP entirely.

### Why This Choice

The final architecture should support external AI clients and governed tools without duplicating product authorization or catalog mutation rules. A separate MCP server can authenticate agent clients, expose curated read/proposal workflows, and call backend APIs that already enforce tenant scope, permissions, approval boundaries, and audit.

Embedding MCP directly in the main API would couple agent protocol concerns to product HTTP concerns. Direct database access for agents would violate the product's safety model.

### Reconsider When

- MCP remains outside the final product story.
- A single deployment is simpler and secure enough.
- Agent traffic or security requirements justify a dedicated gateway earlier.

## Memory

### Choice

Add memory only where evaluation proves it improves workflow quality.

### Alternatives Considered

- Add long-term memory early.
- Store all user and agent interactions as memory.
- Avoid memory entirely.

### Why This Choice

Commerce matching preferences, approved decisions, and merchant-specific normalization rules may become useful memory. But memory can create stale, cross-tenant, or unexplainable behavior. The product's trust model requires provenance, lifecycle, tenant boundaries, and with/without-memory evaluation. Memory should follow measured need, not AI fashion.

### Reconsider When

- Approved decisions show repeatable patterns that improve matching/search.
- Memory can be evaluated against clear metrics.
- Tenant isolation and memory expiry can be tested.

## Data Files and Fixtures

### Choice

Use small deterministic fixture files for local demos, CI smoke tests, import examples, prompt-injection cases, and evaluation seeds; move large datasets and immutable original uploads to the approved S3-compatible artifact storage path from [ADR 0009](adr/0009-s3-compatible-import-artifact-storage.md).

### Alternatives Considered

- Generate all demo data procedurally.
- Store large benchmark datasets in Git.
- Fetch all datasets dynamically from external sources.

### Why This Choice

The project needs repeatable evidence. Small checked-in fixtures make tests and demos deterministic. Larger datasets such as Amazon ESCI or WDC subsets should not be committed wholesale; they need documented acquisition, frozen subsets, manifests, and approved artifact storage.

Procedural data can be useful, but it often feels fake and weakens portfolio credibility. Dynamic fetches make CI and local demos fragile.

### Reconsider When

- Fixture size grows beyond what Git should hold.
- Evaluation requires versioned artifact storage.
- Real supplier sample data becomes available with redistribution rights.

## Security and Secrets

### Choice

Use environment-driven configuration, local `.env` files for development, and secret managers in production-like deployments.

### Alternatives Considered

- Hardcoded development secrets.
- Committed environment files.
- Database-stored secrets.
- Secret manager from day one for all local development.

### Why This Choice

The platform will handle tenant data, catalog content, model credentials, and external integrations. Environment-driven config works locally and in containers while keeping secrets out of Git. Production-like deployments should use platform secret managers and scoped service identities.

Hardcoded or committed secrets are unacceptable. A secret manager for every local value would slow early development.

### Reconsider When

- Deployment target standardizes the secret backend.
- Local development needs encrypted shared secrets.
- External integrations require rotation workflows.

## Production Readiness Target

### Choice

Treat the final release as production-like evidence, not a claim of commercial production readiness.

### Alternatives Considered

- Stop at a local MVP.
- Claim production readiness after Docker Compose.
- Build enterprise-grade infrastructure before product workflows.

### Why This Choice

The portfolio should be honest and impressive. The final release should show correctness, AI quality, reliability, tenant isolation, performance, operability, and presentation evidence. It does not need to pretend to be a real commercial SaaS serving customers at scale. This framing keeps the architecture ambitious but credible.

### Reconsider When

- The project becomes a real commercial product.
- A specific customer/deployment environment defines production requirements.
