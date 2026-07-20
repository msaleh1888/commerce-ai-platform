# Project Roadmap

## Purpose

This roadmap turns the blueprint and MVP scope into a professional delivery plan. It is detailed for the next milestone and intentionally higher level for later milestones. The goal is to reach a final portfolio release that satisfies the product, engineering, evaluation, security, reliability, and presentation requirements without losing focus.

## Delivery Strategy

Build the project in evidence-producing milestones:

1. Define the product and user experience.
2. Build the technical foundation.
3. Ship the portfolio MVP workflow.
4. Add advanced AI capabilities only after the core workflow works.
5. Add production-readiness evidence.
6. Package the project for hiring managers and Upwork clients.

The design step happens before frontend implementation, after the MVP scope is stable and before building the app shell in earnest.

## Milestone 0: Product, UX, and Delivery Definition

### Objective

Turn the project from a broad idea into a buildable product with a clear demo path, polished UX direction, and implementation-ready backlog.

### Why This Comes First

The app is meant to impress professionals. That means the UI cannot be improvised screen by screen while coding. The design must express the product story: serious commerce operations, evaluated AI, trustworthy workflows, and clean human approval.

### Deliverables

- Confirmed project name or strong working name.
- Finalized MVP scope.
- User roles and permissions matrix.
- Main demo journey.
- Information architecture.
- Screen inventory.
- Low-fidelity wireframes.
- High-fidelity Figma designs.
- Design system direction.
- Technical backlog for Phase 0 and Phase 1.
- Updated README project positioning draft.

### Design Deliverables

Create Figma screens for:

- Sign in.
- Tenant/dashboard overview.
- Catalog import.
- Import processing status.
- Product catalog browser.
- Product search with evidence.
- Duplicate review queue.
- Duplicate review detail.
- Evaluation summary.
- Audit history.
- Settings or tenant administration.

Define design system primitives:

- Typography.
- Color palette.
- Spacing scale.
- Layout grid.
- Sidebar and top navigation.
- Buttons.
- Inputs.
- Tables.
- Status badges.
- Tabs.
- Empty states.
- Error states.
- Charts.
- Review/evidence panels.
- Toasts and loading states.

### Recommended Tools

- Figma as the design source of truth.
- Optional AI design tools for first drafts only.
- shadcn/ui, Tailwind CSS, lucide-react, TanStack Table, and Recharts for implementation.
- Playwright screenshots for visual validation after implementation.

### Detailed Next Tasks

1. Choose or shortlist product names.
2. Create `docs/product-positioning.md` with target audience, hiring story, and demo promise.
3. Create `docs/ux/screen-inventory.md`.
4. Create `docs/ux/user-flows.md`.
5. Create `docs/ux/design-direction.md`.
6. Create Figma low-fidelity wireframes for the core demo path.
7. Review the flow for clarity, density, and wow factor.
8. Create high-fidelity Figma designs.
9. Extract design tokens from Figma.
10. Convert the approved design into frontend implementation tasks.
11. Create GitHub issues or a markdown backlog for Milestone 1 and Milestone 2.

### Acceptance Criteria

- A reviewer can understand the product from the demo flow without reading the blueprint.
- The core screens are designed before major frontend coding begins.
- The UI direction feels like a premium B2B SaaS operations product.
- The design supports dense professional workflows, not a generic AI dashboard.
- Every MVP screen maps to a backend capability or planned fixture.

## Milestone 1: Technical Foundation

### Objective

Create the runnable project skeleton and local development environment.

### Deliverables

- Monorepo structure.
- FastAPI API skeleton.
- Next.js frontend skeleton.
- Celery worker skeleton.
- PostgreSQL, Redis, and Qdrant in Docker Compose.
- Database migration setup.
- Basic authentication approach.
- Seed data command.
- CI skeleton.
- Formatting, linting, and test commands.
- Health checks.
- Initial README quickstart.

### Acceptance Criteria

- Local services start reliably.
- API health endpoint responds.
- Web app loads.
- Worker executes a test task.
- Database migrations run.
- CI runs a minimal backend and frontend check.

## Milestone 2: Identity, Tenancy, and App Shell

### Objective

Build the secure SaaS foundation and implement the visual shell from the approved design.

### Deliverables

- Users, tenants, memberships, roles, and permissions.
- Session/auth flow.
- Tenant-scoped API dependency.
- App shell with sidebar/top navigation.
- Tenant switcher or fixed demo tenant.
- Dashboard overview.
- Server-side authorization tests.
- First Playwright screenshot checks.

### Acceptance Criteria

- Demo user can sign in.
- User sees only authorized tenant context.
- App shell matches the Figma direction.
- Tenant isolation tests pass for core protected routes.

## Milestone 3: Catalog Import and Normalization

### Objective

Implement the first real operational workflow: importing messy catalog data safely.

### Deliverables

- Catalog sources.
- CSV and JSON upload.
- Import records and row records.
- Content hash duplicate detection.
- Celery import processing.
- Validation and normalization.
- Import state machine.
- Row-level errors.
- Import UI and status UI.
- Audit events for import lifecycle.
- Vertical implementation plan: [M3 Catalog Import Implementation Plan](m3-catalog-import-implementation-plan.md).

### Acceptance Criteria

- User can upload a fixture catalog.
- Worker processes it asynchronously.
- Duplicate upload is safe.
- Rejected rows show useful reasons.
- Products are persisted with raw and normalized fields.

## Milestone 4: Product Catalog and Search Baseline

### Objective

Make the imported catalog useful through browsing and baseline search.

### Deliverables

- Supplier products.
- Canonical products.
- Product browser.
- Product detail page.
- Lexical search.
- Search filters.
- Search result evidence.
- Tenant-scoped search tests.

### Acceptance Criteria

- Catalog manager can browse imported products.
- Search returns correct tenant-scoped results.
- Filters work for category, brand, price, and status.
- Product evidence is visible and understandable.

## Milestone 5: Dense and Hybrid Retrieval

### Objective

Add AI retrieval with measured quality improvements.

### Deliverables

- Retrieval record representation.
- Embedding generation.
- Qdrant indexing.
- Dense search.
- Hybrid fusion.
- Search configuration tracking.
- Retrieval evaluation harness.
- Evaluation summary UI.

### Acceptance Criteria

- Products are indexed into Qdrant.
- Dense and hybrid search work.
- Lexical, dense, and hybrid retrieval can be compared.
- Evaluation report records metrics and config.
- Cross-tenant retrieval result count is zero.

## Milestone 6: Duplicate Detection and Human Review

### Objective

Deliver the strongest MVP workflow: AI-assisted catalog resolution with human approval.

### Deliverables

- Duplicate candidate generation.
- Review case model.
- Confidence and reason codes.
- Review queue UI.
- Review detail UI.
- Approve, reject, variant, and defer decisions.
- Idempotent approved mutation execution.
- Audit trail.
- Matching evaluation report.

### Acceptance Criteria

- Duplicate cases are generated from imported data.
- Reviewer can inspect evidence side by side.
- Approved mutation updates canonical product state once.
- Rejected/deferred cases remain traceable.
- False-merge risk is measured.

## Milestone 7: MVP Portfolio Release

### Objective

Package the first release so it impresses hiring managers and Upwork clients.

### Deliverables

- Polished UI pass.
- Demo dataset.
- Demo script.
- Screenshots.
- README with architecture, setup, demo flow, and measured results.
- Short demo video.
- Case study 1: evaluated hybrid product retrieval.
- Case study 2: duplicate review and human approval.
- Known limitations section.

### Acceptance Criteria

- A fresh reviewer can run or understand the project quickly.
- UI feels cohesive and professional.
- Public claims are backed by generated evidence.
- MVP workflow works end to end.

## Milestone 8: ReAct Agent Workflow

### Objective

Add a bounded agent only after deterministic retrieval and review workflows are strong.

### Deliverables

- LangGraph workflow for product resolution assistance.
- Tool registry with read-only tools and proposal tools.
- Step, token, time, and cost budgets.
- Checkpointing.
- Proposal validation.
- Agent run history.
- Agent evaluation dataset.

### Acceptance Criteria

- Agent can produce review proposals with evidence.
- Agent cannot mutate catalog state directly.
- Invalid tool calls and unauthorized attempts are tested.
- Agent performance is compared with deterministic workflow.

## Milestone 9: MCP and External Tool Boundary

### Objective

Expose governed catalog tools through MCP as a professional integration story.

### Deliverables

- Catalog MCP server.
- Authenticated tool access.
- Tenant-scoped tool discovery.
- Tool contract tests.
- Security tests for cross-tenant access.
- External client demo scenario.

### Acceptance Criteria

- MCP client can complete an approved read/proposal scenario.
- Tool permissions are enforced.
- MCP tenant isolation tests pass.

## Milestone 10: Memory and Advanced Evaluation

### Objective

Add memory only where it improves measurable workflow quality.

### Deliverables

- Episodic memory from approved decisions.
- Semantic memory for merchant preferences or matching rules.
- Memory provenance and lifecycle.
- With/without-memory evaluation.
- Stale and cross-tenant memory tests.

### Acceptance Criteria

- Memory improves a defined metric or is documented as not worth retaining.
- Memory records have provenance.
- Cross-tenant memory leakage count is zero.

## Milestone 11: Observability and Operations

### Objective

Show production-minded operation and diagnosis.

### Deliverables

- OpenTelemetry traces.
- Prometheus metrics.
- Grafana dashboards.
- Langfuse traces/evaluations if useful.
- Alert rules.
- Failure-injection scenarios.
- Cost and latency reporting.

### Acceptance Criteria

- Import, search, matching, and approval flows emit useful telemetry.
- Injected failures are diagnosable from logs/traces/metrics.
- Sensitive data is redacted.

## Milestone 12: Kubernetes and Production-Like Release Candidate

### Objective

Produce final production-readiness evidence for the capstone version.

### Deliverables

- Kubernetes manifests.
- Migration job.
- API/web/worker deployments.
- Readiness and liveness probes.
- Resource requests and limits.
- Backup and restore exercise.
- Reindexing exercise.
- Load and soak tests.
- Resilience tests.
- Release candidate report.

### Acceptance Criteria

- Staging deployment works.
- Load, failure, recovery, and tenant-isolation results are documented.
- Release candidate quality gates pass.
- Public case study distinguishes portfolio production-worthiness from real commercial production.

## Final Release Definition

The final release satisfies the project requirements when it has evidence across:

- Correctness: complete workflows produce expected state.
- AI quality: retrieval, matching, generation, agents, and memory meet versioned thresholds where implemented.
- Reliability: retries, duplicate delivery, crashes, and partial failures do not corrupt data.
- Security: tenant, role, tool, and approval boundaries hold in tests.
- Performance: latency, throughput, error rate, and queue age are measured.
- Operability: failures can be detected, diagnosed, recovered, and rolled back.
- Presentation: README, demo video, screenshots, and case studies are clear enough for hiring and client acquisition.
