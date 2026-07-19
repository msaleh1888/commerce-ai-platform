# M2-04 Dashboard Implementation Plan

## Scope and Authority

This plan exists only to implement GitHub issue #15, `M2-04: Implement dashboard screen`.

It is subordinate to ADR 0008, the canonical frontend architecture, the M2 UI implementation specification, and the M2 demo-data contract. It does not authorize a new API, backend workflow, persistence model, mutation path, or design-system change.

## Purpose

The dashboard is the first operational workspace a Catalog Manager sees after the authenticated shell. Its job is to answer, within one scan:

1. Is this tenant's catalog operation healthy today?
2. What data is moving through ingestion and what is blocked?
3. What needs a human decision next?
4. Is search quality being measured, and what evidence supports that statement?

This screen sets the UX foundation for the application because later product, search, review, evaluation, and audit screens should inherit its visual hierarchy, information density, status language, evidence treatment, and honest handling of prototype data.

The target user is the Northstar Retail Catalog Manager. They need fast operational orientation, not a marketing overview, generic AI messaging, or a wall of charts.

## Design Direction

Use the approved composite direction:

```text
Variant 2 shell and polish
+ Variant 1 dashboard density and information structure
+ the platform's evidence-first, human-in-control trust posture
```

The result must feel calm, premium, and work-focused:

- Use the existing deep blue/blue-teal accent, semantic status colors, restrained borders, and flat operational panels.
- Favor compact tables, explicit labels, stable columns, tabular numbers, and meaningful empty space between groups rather than large decorative gaps.
- Treat metric cards as quick operational signals, not marketing statistics.
- Present evaluation information as a labeled deterministic demo evaluation run with its run and configuration identifiers. Do not imply live model performance.
- Keep AI-derived or quality-related information tied to source context and a next action.
- Do not use gradients, decorative blobs, generic AI imagery, oversized hero type, nested cards, or live-looking controls that have no behavior.

## User Flow

1. The signed-in Catalog Manager lands on `/dashboard` inside the authenticated shell.
2. They identify the active tenant and role in the shell, then scan the primary metric row for exceptions.
3. They check the ingestion pipeline to understand whether records are moving, paused for review, partially successful, or failed.
4. They review recent imports to locate the source of an issue.
5. They see a concise review-queue summary and use its action to move to `/review` when a human decision is needed.
6. They inspect the latest search-quality evaluation with its explicit demo-data label and source identifiers.
7. They use recent audit activity to understand the latest catalog-operation history.

The dashboard is a launch point for work. It does not execute imports, decisions, evaluation runs, or audit writes in M2.

## Information Hierarchy

### Desktop: 1440 x 1024 reference

Use a constrained, unframed workspace inside the existing shell. The visible first viewport should contain the page heading, operational context, metric row, and the beginning of the main work areas.

1. **Page heading and context row**
   - Title: `Catalog operations`
   - Supporting text: tenant-scoped operational summary.
   - A compact, non-clickable `Demo data` status label when the shell is using the development fallback.
   - Do not add a primary action until a real import workflow exists.

2. **Primary metric row: four equal, compact metric panels**
   - Products indexed.
   - Supplier records processed.
   - Open review cases.
   - Search-quality summary.
   - Each panel shows: metric value, operational label, status indicator, and a one-line source context.
   - The review metric must visually signal urgency when high-risk cases are present.
   - The search-quality metric must say `Demo evaluation` and name the relevant run/configuration rather than use an unsupported trend claim.

3. **Pipeline overview: full-width operational band**
   - Render the ingestion stages from left to right as a pipeline/feed-health view.
   - Each stage shows its state, processed count, issue count, and short explanation.
   - Status must use semantic labels such as `Processing`, `Ready`, `Review required`, `Partial success`, or `Failed`.
   - Make the stage with an exception visually stronger without turning the entire band into an alert.

4. **Main split: recent imports plus review queue**
   - Use a two-thirds / one-third desktop grid.
   - Left: `Recent imports` table/list with source, supplier, current status, submitted/completed time, row counts, searchable state, and a concise failure or partial-success explanation where present.
   - Right: `Review queue` summary with open count, high-risk count, assigned-to-me count, oldest-case age, and a clear `Open review queue` link to `/review`.
   - The review summary is a work invitation, not a place to repeat detailed review evidence reserved for #16.

5. **Lower split: latest evaluation plus recent audit activity**
   - Left: `Latest search evaluation` with run ID, manifest ID, configuration ID, selected metrics, baseline comparison, and an explicit `Deterministic demo evaluation` notice.
   - Right: `Recent audit activity` as a compact chronological list of actor, action, target, timestamp, and safe metadata summary.
   - Audit rows are read-only and link behavior is deferred until the audit feature exists.

### Mobile: 390 x 844 reference

- Stack every group in the same decision order: heading, metric panels, pipeline, recent imports, review queue, evaluation, audit.
- Show metric panels as a two-column grid when text remains readable; otherwise use one column. Do not reduce labels to unexplained icons.
- Make pipeline stages vertically scrollable or stacked with stable status labels. Do not depend on a wide horizontal diagram.
- Keep recent-import columns readable through stacked row details before allowing horizontal table scrolling.
- Keep `Open review queue` visible without forcing the user to scan below audit content.
- Respect the app-shell mobile drawer and never create a second navigation pattern.

## Content and Demo-Data Mapping

The dashboard feature consumes only `features/demo-data/adapters/dashboard.ts` and the API-shaped `DashboardSummary` contract. It must not import scenario fixture files directly.

| Dashboard surface | Contract source | Required presentation rule |
| --- | --- | --- |
| Tenant/role | Auth shell safe session | Shell owns this context; the dashboard does not reimplement it. |
| Metric row | `metricCards` | Render label, value, semantic status, and `sourceContext`. |
| Pipeline | `pipelineStages` | Preserve deterministic stage ordering and status values. |
| Recent imports | `recentImports` | Show real fixture IDs and ISO-derived display values; no generated dates/counts. |
| Review summary | `reviewSummary` | Link to `/review`; do not simulate a decision. |
| Evaluation | `evaluationSummary` | Display manifest, run, configuration, baseline comparison, and demo-data notice. |
| Audit activity | `auditEvents` | Render safe tenant-scoped event summaries only. |

The active safe session selects the dashboard scenario now. Northstar Retail is the default only when the shell is in its explicitly labelled development demo fallback; it is never an implicit fallback for an authenticated tenant.

Use the approved `lib/auth` cross-feature utility boundary to expose the current shell session to dashboard features:

```text
Authenticated shell boundary
  -> lib/auth current-session provider
  -> dashboard feature current-session hook
  -> typed tenant-to-scenario mapper
  -> features/demo-data/adapters/dashboard.ts
```

The mapper is closed and explicit:

| Active `DemoTenantId` | Dashboard `DemoScenarioId` |
| --- | --- |
| `tenant_northstar_retail` | `northstar-retail` |
| `tenant_acme_outlet` | `acme-outlet` |

An unknown tenant ID is a typed dashboard error state. It must never silently render Northstar data. The dashboard receives the current safe session from the provider; it must not import shell internals, scenario fixture files, or independently re-fetch the session.

## Component and Route Ownership

Implement under the canonical frontend structure:

```text
apps/web/src/
  app/(app)/dashboard/page.tsx              # route composition only
  features/dashboard/
    api/                                    # dashboard adapter boundary
    components/                             # metric row, pipeline, imports, review, evaluation, audit
    hooks/                                  # local loading/error state only if needed
    schemas/                                # dashboard view-model mapping, if mapping needs its own layer
    state/                                  # only local presentational state, if needed
    tests/                                  # feature behavior and mapping tests
  lib/auth/                                 # current safe-session provider and hook shared by shell/features
```

Rules:

- `page.tsx` composes one dashboard feature entry component and contains no data access or view-model construction.
- The dashboard feature owns its demo adapter call, mapping, local state, and feature components.
- The authenticated shell boundary owns session retrieval. It supplies the safe session to the `lib/auth` provider; the dashboard reads that provider through its public hook.
- `lib/auth` is the only permitted shared session-context boundary for this issue. Dashboard components must not import `features/auth` internals or re-fetch `/auth/session`.
- It may import shared primitives from `components/ui` and shared formatting helpers from `lib`.
- It must not import review feature internals, shell internals, scenario fixture files, or FastAPI code.
- `components/ui` stays presentational and receives only props; do not modify shared primitives unless a reusable need is demonstrated and separately approved.
- Browser role/capability presentation may improve clarity but must never be treated as authorization. FastAPI remains authoritative.

## Required States

The implementation must include explicit visual states driven locally by typed feature state. Each state must preserve the shell and page hierarchy.

| State | Required behavior |
| --- | --- |
| Loading | Use stable-height skeleton or muted loading rows for metric, pipeline, and list regions; do not shift the page layout. |
| Data ready | Render the deterministic summary mapped from the active tenant; Northstar is the default only for the labelled development demo fallback. |
| Empty | Explain that no imports or review cases are present for the active tenant; do not show fake zero-value charts. |
| Error | Show a contained retryable dashboard-data error with a `Retry` control that only retries feature loading. |
| Permission denied | Render only from a typed denied response/state fixture, while leaving the shell tenant/role context visible. Do not infer denial or hide the dashboard from browser role/capability data. |
| Partial success | Surface partial import results and the affected count near the pipeline and relevant import row. |
| Audit/history | Keep recent audit events visible in the ready state; do not imply complete audit coverage before the audit domain exists. |

## Interaction Rules

- `Open review queue` navigates to `/review`.
- Import rows and audit rows are non-interactive until their route/detail contracts exist; do not style them as live links.
- The dashboard may use local state only for loading, error, and retry demonstration. It must not mutate shared demo fixtures, browser storage, or catalog state.
- A displayed status is evidence, not a command. Do not render a button when it has no implemented behavior.
- Every interactive element has a visible label or accessible name, keyboard access, focus treatment, and a stable hit target.

## Implementation Sequence

1. Create the dashboard feature entry point and a typed adapter interface returning `DashboardSummary`.
2. Replace the current `/dashboard` placeholder with route composition of that feature.
3. Implement the page heading/context and four primary metric panels using the existing `Panel` and `StatusBadge` primitives.
4. Implement pipeline overview and recent-imports area before lower-priority audit polish; this establishes the core operational scan path.
5. Add review summary with navigation to `/review`.
6. Add evaluation and audit sections with their explicit demo-data labels.
7. Add loading, empty, error, permission-denied, and partial-success state fixtures/view models.
8. Verify desktop and mobile layouts, text truncation, keyboard order, and non-overlap.
9. Add focused feature tests, capture desktop/mobile screenshots, and review them against this plan before opening the PR.

## Verification and Review Gate

The implementation PR must provide:

- Desktop screenshot at `1440x1024` and mobile screenshot at `390x844`.
- A visible active tenant/role in the app shell, sourced from the safe session when available.
- A clear deterministic-demo label on evaluation data and any development fallback session.
- Tests for view-model/adapter mapping and all required dashboard states.
- A test that serialized Northstar dashboard output does not contain Acme tenant IDs or names.
- A reciprocal test that serialized Acme dashboard output does not contain Northstar tenant IDs or names.
- Tests that the current-session tenant-to-scenario mapper selects Northstar for `tenant_northstar_retail`, Acme for `tenant_acme_outlet`, and produces a typed error for an unknown tenant.
- `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build`.
- `python tools/architecture/check_boundaries.py`.

Review the screen using these questions:

1. Can a Catalog Manager identify the highest-priority operational exception in under ten seconds?
2. Does every metric state what it measures and where it came from?
3. Are demo evaluation values visibly framed as demo evidence rather than production claims?
4. Does the layout remain dense and legible without appearing like a generic marketing dashboard?
5. Does mobile preserve decision order, readable labels, and access to the review queue?
6. Does the screen avoid suggesting an automatic catalog mutation or a workflow that does not exist?

## Non-Goals

This issue does not implement:

- Supplier file upload, ingestion execution, normalization, indexing, or task progress.
- Live search, retrieval, matching, or evaluation computation.
- Product, import, audit, or review detail pages.
- Approval execution or any catalog mutation.
- Tenant switching, login UI, or new authorization policy.
- Playwright setup; screenshot automation remains issue #17.

## Architecture and Decision Status

Affected area: frontend dashboard feature and route composition.

Tenant and authorization impact: dashboard data is scoped by the active session/tenant contract for presentation; browser rendering does not authorize access. The M2 demo adapter is temporary and replaceable by a typed FastAPI dashboard adapter without changing feature component contracts.

Idempotency, audit, and evaluation impact: no durable mutation is introduced. Audit and evaluation are read-only deterministic demo evidence.

Decision needed before implementation: none. This plan follows existing M2 and architecture decisions.
