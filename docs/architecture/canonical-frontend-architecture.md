# Canonical Frontend Architecture

## Package Tree

```text
apps/web/src/
  app/
    (public)/                      # unauthenticated routes
    (app)/                          # authenticated application routes and layouts
    api/                            # Next-only route handlers; never a replacement for FastAPI business APIs
  features/
    <feature>/
      api/                          # typed FastAPI client calls
      components/                   # feature-specific presentation
      hooks/                        # feature interaction and server-state hooks
      schemas/                      # client DTO/view-model validation
      state/                        # feature-local client state only when necessary
      tests/
  components/
    ui/                             # accessible shared primitives; no business imports
    layout/                         # app shell/navigation composition
  lib/
    api-client/                     # transport, auth/session forwarding, common errors
    auth/ tenant/ format/            # cross-feature utilities only
  styles/                            # tokens and global layers
```

## Rules

- `app` routes and layouts compose features and declare route metadata. They MUST NOT contain feature business logic or fetch directly from FastAPI.
- A feature owns its API client calls, feature hooks, view models, and feature components. Another feature MUST NOT import its internals; shared behavior moves to `lib` or a shared component only after an approved repeated need.
- `components/ui` MUST contain accessible, presentational primitives with no imports from `features`, API clients, or tenant/auth business logic.
- Server components fetch only through feature/server API adapters. Client components own interaction, optimistic presentation only when explicitly safe, and browser-only APIs.
- FastAPI remains the authority for permissions and workflow state. Frontend guards and hidden controls are usability features, not authorization.
- Each workflow screen MUST represent loading, empty, error, permission denial, partial completion, retry, and audit/history where the underlying operation supports those states.
- Search and review screens MUST display source evidence, ranking/reason codes, confidence, uncertainty, and approval state at the point of decision.

## Data and State

API DTOs are translated into feature view models. API client errors use a common typed error shape. URL state is used for shareable filters and selected resources; server state remains in the API; local interaction state remains in the smallest owning component or feature.

Realtime delivery is additive. Persisted API workflow status is authoritative, polling is the default, and SSE may update the presentation of that persisted state.

## Frontend Tests

Feature tests cover view-model mapping, error/empty/loading states, and user actions. Browser/workflow tests cover tenant context, authorization presentation, import progress, search evidence, review decisions, and audit visibility. Screenshot checks validate dense operational layouts without substituting for behavior tests.
