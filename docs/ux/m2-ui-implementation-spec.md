# M2 UI Implementation Specification

## Purpose

This specification turns the selected v0 direction into stable implementation contracts for M2. It governs issues M2-01 through M2-06. It is read with the [Canonical Frontend Architecture](../architecture/canonical-frontend-architecture.md), ADR 0008, and the UX direction documents.

## Product Focus

The primary M2 user is the Catalog Manager at Northstar Retail. The app must feel like a real operations product before catalog APIs exist: the tenant is visible, operational status is believable, AI proposals remain separate from approved state, and review evidence is easy to scan.

M2 delivers a typed, interactive frontend prototype and the identity/tenancy shell it consumes. It does not claim that import processing, retrieval, matching, approval execution, or evaluation computation is implemented yet.

## Route Map

All authenticated pages live beneath `apps/web/src/app/(app)/` and render inside one app-shell layout.

| Route | M2 behavior | Owning issue |
| --- | --- | --- |
| `/dashboard` | Operational dashboard with local typed demo state. | M2-04 |
| `/imports` | Navigation destination and explicit prototype/empty state. | M2-02 |
| `/products` | Navigation destination and explicit prototype/empty state. | M2-02 |
| `/search` | Navigation destination and explicit prototype/empty state. | M2-02 |
| `/review` | Review queue and selected case detail using local typed demo state. | M2-05 |
| `/evaluation` | Navigation destination and explicit prototype/empty state. | M2-02 |
| `/audit` | Navigation destination and explicit prototype/empty state. | M2-02 |
| `/settings` | Role-aware tenant/settings placeholder. | M2-02 and M2-08 |

The app shell MUST display current tenant, current role, processing indicator, global-search placeholder, and user menu. It MUST NOT imply that a placeholder route has a live backend workflow.

## Implementation Boundaries

```text
apps/web/src/
  app/(app)/<route>/page.tsx             # route composition only
  components/ui/                         # shared accessible primitives
  components/layout/                     # sidebar, top bar, app shell
  features/dashboard/                    # dashboard API adapter, hooks, components, tests
  features/review/                       # review API adapter, hooks, components, tests
  features/demo-data/                    # typed scenario data and mock adapters
  lib/api-client/                        # common HTTP and typed error handling
  styles/tokens.css                      # M2 design tokens
```

Routes MUST compose feature modules. `components/ui` MUST not import feature, demo-data, auth, or API modules. Dashboard and review features MUST not import one another.

## Token and Primitive Contract

M2-01 owns `styles/tokens.css`, global style integration, and the shared primitives. Use semantic CSS variables rather than component-specific color literals.

Required token groups:

- Surface: application, sidebar, raised, selected, subtle evidence.
- Text: primary, secondary, muted, inverse.
- Border and focus.
- Accent: deep blue/blue-teal.
- Status: processing/blue, ready/green, review/amber, failed/red, inactive/gray.
- Spacing, typography, shadow, and radius scales.

Required initial primitives: `Button`, `IconButton`, `StatusBadge`, `Panel`, `DataTable`, `Tabs`, `Select`, `Dialog`, `Drawer`, `Tooltip`, and `EmptyState`.

Use lucide icons. Buttons with a familiar icon-only action MUST have a tooltip and accessible label. Panels remain flat operational surfaces; do not nest decorative cards.

## Responsive and State Contract

Desktop reference viewport: `1440x1024`. Mobile reference viewport: `390x844`.

On narrow screens, the sidebar collapses to an accessible navigation control and the duplicate-review comparison becomes a stacked detail workflow without hiding evidence or approval context. Tables may scroll horizontally only when columns cannot be reflowed without losing meaning.

Each M2 feature must show appropriate loading, empty, error, permission-denied, partial-success, and audit/history states. Prototype data may drive these states locally, but labels must make their status clear.

## Dashboard Contract

M2-04 displays tenant-scoped demo data for products indexed, supplier records processed, open review cases, search-quality summary, recent imports, pipeline/feed health, review-queue summary, latest evaluation, and recent audit activity.

Each metric has a concrete operational label and source context. Evaluation data is labelled as a demo evaluation run, including run/configuration identifier; it is never presented as a verified current production measurement.

## Duplicate Review Contract

M2-05 uses a left review queue and a detail workspace. The detail view displays both records, a recommended proposal, confidence, conflicts, deterministic MVP-safe signals, provenance, raw/normalized/canonical field comparison, human-approval requirement, operation ID, audit preview, and compact matching-evaluation context.

The only affirmative control is `Approve merge`; it must open a confirmation dialog explaining the proposed effect. Static prototype actions update local display state only and MUST state that the proposal has not changed catalog data. `Mark as variant`, `Keep separate`, and `Defer` are distinct actions.

## Screenshot Contract

M2-06 installs Playwright and captures, at minimum:

- `/dashboard` at desktop and mobile viewports.
- `/review` with an unresolved case selected at desktop and mobile viewports.

CI uploads current screenshots as PR artifacts. Baseline images are committed only when a visual-regression assertion is deliberately approved; screenshots used only for review remain generated artifacts. Screenshot tests wait for stable demo-data rendering and must not depend on live APIs.

## Design Reference Decision

Use the existing v0 exports as reference only: Variant 2 for shell/polish, Variant 1 for dashboard density, and Variant 3 for evidence-first review. Do not run a new v0 generation pass before M2. Local implementation plus Playwright capture is the approved iteration loop.
