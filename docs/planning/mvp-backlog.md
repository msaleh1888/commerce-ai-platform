# MVP Backlog

## Purpose

This backlog turns the roadmap, MVP scope, UX direction, and v0 design capture into GitHub-ready execution work. Use this document to create GitHub milestones, issues, branches, and PRs.

## Project Management Decision

Use GitHub as the execution source of truth:

- GitHub Issues for tasks.
- GitHub Milestones for delivery phases.
- GitHub Projects for board tracking.
- Pull requests for implementation work.
- Repo docs for product, UX, architecture, and decision records.

Avoid using Notion as the main execution system. It can be used for personal notes, but GitHub should own work that connects to code, tests, commits, and PRs.

## Board Columns

Create a GitHub Project with these columns:

```text
Backlog
Ready
In Progress
In Review
Done
Deferred
```

## Labels

Recommended labels:

```text
type:docs
type:design
type:frontend
type:backend
type:worker
type:infra
type:test
type:evaluation
type:security
type:portfolio

area:ux
area:identity
area:tenancy
area:catalog
area:ingestion
area:products
area:retrieval
area:matching
area:approval
area:audit
area:observability

priority:p0
priority:p1
priority:p2
```

## Branch and PR Strategy

Use direct commits to `main` only for early planning docs before the repository is shared. Use branches and PRs for implementation.

Branch naming:

```text
feature/m1-project-foundation
feature/m2-app-shell
feature/m3-catalog-import
feature/m4-search-baseline
feature/m5-hybrid-retrieval
feature/m6-duplicate-review
chore/docs-foundation
```

PR expectations:

- Keep PRs focused on one coherent slice.
- Include screenshots for frontend PRs.
- Include test evidence or explain why tests are not yet applicable.
- Link related issues.
- Do not claim production readiness without measured evidence.

## Milestones

### M0: Product, UX, and Backlog Definition

Goal:

- Finish project definition, UX direction, v0 design capture, and execution backlog.

Status:

- Mostly complete after creating this document.

### M1: Technical Foundation

Goal:

- Create the runnable app skeleton, local services, CI, and basic project standards.

### M2: Identity, Tenancy, and App Shell

Goal:

- Build the SaaS shell, demo tenant context, basic auth/session shape, roles, and design system foundation.

### M3: Catalog Import and Normalization

Goal:

- Upload catalog files, process asynchronously, normalize rows, expose status, and persist audit events.

Implementation planning:

- [M3 Catalog Import Implementation Plan](m3-catalog-import-implementation-plan.md)

### M4: Product Browser and Search Baseline

Goal:

- Browse normalized products and perform tenant-scoped lexical search with evidence.

### M5: Dense and Hybrid Retrieval Evaluation

Goal:

- Add Qdrant indexing, dense search, hybrid fusion, and baseline evaluation reports.

### M6: Duplicate Review and Human Approval

Goal:

- Implement the flagship evidence-first duplicate review workflow and safe approval boundary.

### M7: Portfolio MVP Release

Goal:

- Polish UX, record demo evidence, publish README/case studies/screenshots, and make the project impressive to reviewers.

## M0 Issues

### Issue M0-01: Commit planning docs and UX artifacts

Labels:

```text
type:docs, area:ux, priority:p0
```

Description:

Commit the current blueprint, kickoff docs, UX docs, v0 capture, exported v0 files, and repo-scoped Codex skill.

Acceptance criteria:

- All docs are committed.
- v0 exports are preserved under `docs/ux/artifacts/v0/export`.
- `commerce-saas-product-ux` skill is committed under `.agents/skills`.
- Commit history separates planning docs from Codex customization if practical.

### Issue M0-02: Create GitHub project board and milestones

Labels:

```text
type:docs, priority:p0
```

Description:

Create GitHub Project columns, labels, and milestones matching this backlog.

Acceptance criteria:

- Project board exists.
- Milestones M0 through M7 exist.
- Labels exist or an equivalent simplified label set exists.
- This backlog is linked from the README or project description.

### Issue M0-03: Create GitHub issues from MVP backlog

Labels:

```text
type:docs, priority:p0
```

Description:

Convert this backlog into GitHub Issues. Start with M1 and M2 in detail, then create placeholder tracking issues for M3 through M7.

Acceptance criteria:

- M1 and M2 issues are created with acceptance criteria.
- M3 to M7 tracking issues exist.
- Each issue is assigned a milestone and labels.

## M1 Issues: Technical Foundation

### Issue M1-01: Initialize monorepo structure

Labels:

```text
type:infra, priority:p0
```

Description:

Create the initial repository structure for backend, frontend, workers, infrastructure, datasets, and tests.

Suggested structure:

```text
apps/
  api/
  web/
  worker/
infrastructure/
  docker/
datasets/
  fixtures/
tests/
  unit/
  integration/
  e2e/
  evaluation/
```

Acceptance criteria:

- Directory structure exists.
- Root README explains project layout.
- No placeholder framework code remains unexplained.

### Issue M1-02: Create FastAPI skeleton

Labels:

```text
type:backend, priority:p0
```

Description:

Create the API application skeleton with health endpoint, configuration loading, structured project layout, and test setup.

Acceptance criteria:

- `GET /health` returns healthy status.
- Configuration supports local development environment variables.
- Basic pytest test passes.
- API can run locally.

### Issue M1-03: Create Next.js web skeleton

Labels:

```text
type:frontend, area:ux, priority:p0
```

Description:

Create the frontend skeleton using Next.js, Tailwind CSS, and the planned component approach. Do not yet build the full product UI.

Acceptance criteria:

- Web app starts locally.
- Tailwind is configured.
- Basic page renders.
- Project can later support shadcn-style components and lucide icons.

### Issue M1-04: Create Celery worker skeleton

Labels:

```text
type:worker, priority:p0
```

Description:

Create a worker application skeleton that can execute a simple test task through Redis.

Acceptance criteria:

- Worker process starts locally.
- No-op or health task executes.
- Task result or log is visible.
- Worker settings are documented.

### Issue M1-05: Add Docker Compose local runtime

Labels:

```text
type:infra, priority:p0
```

Description:

Create Docker Compose services for PostgreSQL, Redis, Qdrant, API, web, and worker.

Acceptance criteria:

- Local dependencies start reliably.
- API can connect to PostgreSQL and Redis.
- Worker can connect to Redis.
- Qdrant service starts.
- README includes local startup commands.

### Issue M1-06: Add database migration setup

Labels:

```text
type:backend, type:infra, priority:p0
```

Description:

Add migration tooling for PostgreSQL and create an initial empty or metadata migration.

Acceptance criteria:

- Migration command runs locally.
- Migration history table is created.
- CI can validate migrations.

### Issue M1-07: Add CI skeleton

Labels:

```text
type:infra, type:test, priority:p0
```

Description:

Add GitHub Actions workflow for formatting, linting, and minimal tests.

Acceptance criteria:

- CI runs on pull requests.
- Backend tests run.
- Frontend check runs.
- Workflow is documented.

### Issue M1-08: Add fixture data plan and seed command stub

Labels:

```text
type:backend, type:test, area:catalog, priority:p1
```

Description:

Create initial fixture dataset location and a seed command stub for demo tenant, users, suppliers, products, and review cases.

Acceptance criteria:

- Fixture directory exists.
- Seed command is callable, even if initially minimal.
- Demo tenant names match UX docs: Northstar Retail and optional Acme Outlet.

## M2 Issues: Identity, Tenancy, and App Shell

### Issue M2-01: Implement design tokens and base UI primitives

Labels:

```text
type:frontend, area:ux, priority:p0
```

Description:

Create the base design system for the app, informed by `docs/ux/design-direction.md` and v0 exports.

Use:

- v0 `globals.css` as reference, not direct final source.
- Deep blue or blue-teal primary.
- Status colors for processing, ready, review, failed.
- Consistent border radius and spacing.

Acceptance criteria:

- Global styles and CSS tokens exist.
- `StatusBadge` component exists.
- Button, panel/card, table, and shell primitives exist or are planned through a component library.
- UI does not look all-white/sterile in the shell.

### Issue M2-02: Implement app shell from selected design direction

Labels:

```text
type:frontend, area:ux, priority:p0
```

Description:

Build the main app shell using:

```text
Variant 2 app shell
+ Variant 1 dashboard density
+ Variant 3 evidence-first workflow
```

Code references:

- `docs/ux/artifacts/v0/export/variant-2-premium-saas.tsx`
- `docs/ux/artifacts/v0/export/variant-1-dense-console.tsx`
- `docs/ux/artifacts/v0/export/variant-3-evidence-first.tsx`

Acceptance criteria:

- Sidebar navigation exists.
- Top bar shows tenant context.
- Global search placeholder exists.
- User menu placeholder exists.
- Navigation includes Dashboard, Imports, Products, Search, Review Queue, Evaluation, Audit, Settings.
- Screenshot is captured for review.

### Issue M2-03: Create demo data module for frontend prototypes

Labels:

```text
type:frontend, area:ux, priority:p0
```

Description:

Create frontend demo data based on v0 exports and UX docs so screens can be built before backend APIs are ready.

Acceptance criteria:

- Demo data includes metrics, imports, review cases, evaluation metrics, feed health, pipeline, and audit events.
- Data uses realistic commerce product names.
- No `Lorem ipsum` or generic placeholders.
- Demo data shape can later be replaced by API responses.

### Issue M2-04: Implement dashboard screen

Labels:

```text
type:frontend, area:ux, priority:p0
```

Description:

Implement the dashboard using Variant 1 density and Variant 2 polish.

Acceptance criteria:

- Products indexed, supplier records processed, open review cases, and search quality metrics are shown.
- Recent imports are shown.
- Ingestion pipeline or equivalent processing overview is shown.
- Review queue summary is shown.
- Latest evaluation summary is shown.
- Screenshot passes UX review.

### Issue M2-05: Implement flagship duplicate review static prototype

Labels:

```text
type:frontend, area:ux, area:approval, priority:p0
```

Description:

Implement the evidence-first duplicate review screen as a static frontend prototype using local demo data.

Base reference:

```text
docs/ux/artifacts/v0/export/variant-3-evidence-first.tsx
```

Required improvements:

- `Merge records` becomes `Approve merge`.
- Recommendation is framed as `Recommended proposal`.
- Human approval context is visible.
- Detection signals are MVP-safe.
- Provenance metadata is visible.
- Field comparison includes raw incoming, normalized incoming, existing canonical, and status.
- Matching evaluation panel is visible.

Acceptance criteria:

- Review queue appears on the left.
- Case detail appears on the right.
- Human approval boundary is obvious.
- Evidence and conflicts are easy to scan.
- Screenshot is saved for UX review.

### Issue M2-06: Add Playwright screenshot smoke test

Labels:

```text
type:test, type:frontend, area:ux, priority:p1
```

Description:

Add Playwright setup and capture screenshots for dashboard and duplicate review prototype.

Acceptance criteria:

- Playwright can launch the local frontend.
- Dashboard screenshot is captured.
- Review detail screenshot is captured.
- Screenshots can be used in PR review.

### Issue M2-07: Establish identity and tenancy domain foundation

Labels:

```text
type:backend, type:security, type:test, area:identity, area:tenancy, priority:p0
```

Description:

Implement the `identity` and `tenancy` backend modules under the canonical architecture. Add users, tenants, memberships, roles, migrations, tenant-scoped repository contracts, deterministic Northstar/Acme fixtures, and cross-tenant test helpers.

Acceptance criteria:

- Identity and tenancy modules follow ADR 0008 and canonical backend boundaries.
- PostgreSQL migrations create users, tenants, memberships, and session-ready records.
- Seed fixtures create Northstar Retail and Acme Outlet with distinct memberships.
- Protected repository methods require tenant scope.
- Cross-tenant read and mutation denial tests pass.

### Issue M2-08: Implement demo authentication, session, and authorization boundary

Labels:

```text
type:backend, type:frontend, type:security, type:test, area:identity, area:tenancy, priority:p0
```

Description:

Implement ADR 0008: application-managed demo login/logout, opaque sessions, active-tenant switching, current-session contract, FastAPI actor/tenant/role dependencies, and web session consumption.

Acceptance criteria:

- Login, logout, current-session, and active-tenant API contracts work.
- Password hashes and raw session tokens are never exposed.
- Session expiry/revocation behavior is tested.
- Tenant switching requires membership.
- Role checks deny administration and approval operations to unauthorized users.
- App shell displays the safe session tenant and role context.

## M3 Tracking Issue: Catalog Import and Normalization

Labels:

```text
type:backend, type:worker, type:frontend, area:ingestion, priority:p0
```

Description:

Build the first real vertical slice: catalog import UI, API, database records, worker processing, normalization, row errors, import status, and audit events.

Use [M3 Catalog Import Implementation Plan](m3-catalog-import-implementation-plan.md) to split implementation into vertical customer outcomes.

Acceptance criteria:

- User can upload CSV/JSON fixture.
- Import processes asynchronously.
- Duplicate upload is safe.
- Row-level validation errors are visible.
- Import status page reflects pipeline state.
- Audit event is recorded.

## M4 Tracking Issue: Product Browser and Search Baseline

Labels:

```text
type:backend, type:frontend, area:products, area:retrieval, priority:p0
```

Description:

Implement product browser and tenant-scoped lexical search with filters and evidence.

Acceptance criteria:

- Products can be browsed.
- Search is tenant-scoped.
- Filters work.
- Result evidence is visible.
- Search tests prevent cross-tenant leakage.

## M5 Tracking Issue: Dense and Hybrid Retrieval Evaluation

Labels:

```text
type:backend, type:evaluation, area:retrieval, priority:p0
```

Description:

Add Qdrant indexing, dense retrieval, hybrid fusion, and evaluation reports comparing lexical, dense, and hybrid search.

Acceptance criteria:

- Products are indexed in Qdrant.
- Dense and hybrid search work.
- Evaluation manifest is recorded.
- Baseline comparison metrics are visible.
- Cross-tenant retrieval results are zero.

## M6 Tracking Issue: Duplicate Review and Human Approval

Labels:

```text
type:backend, type:frontend, type:test, area:matching, area:approval, priority:p0
```

Description:

Implement the real duplicate detection and review workflow behind the flagship UI.

Acceptance criteria:

- Duplicate candidates are generated.
- Review cases are persisted.
- Reviewer can approve, reject, mark variant, or defer.
- Approved operation is idempotent.
- Audit event is recorded.
- False-merge risk is measured.

## M7 Tracking Issue: Portfolio MVP Release

Labels:

```text
type:portfolio, type:docs, type:test, priority:p0
```

Description:

Package the MVP for hiring managers and Upwork clients.

Acceptance criteria:

- README includes setup, architecture, demo path, screenshots, and measured results.
- Demo video exists or script is ready.
- Case study for hybrid retrieval exists.
- Case study for duplicate review exists.
- Known limitations are honest.
- Public claims are backed by generated evidence.

## Immediate Next Actions

1. Initialize git if needed.
2. Commit current docs and v0 artifacts.
3. Create GitHub repo.
4. Create milestones M0 to M7.
5. Create M0, M1, and M2 issues from this backlog.
6. Start implementation with `feature/m1-project-foundation`.
