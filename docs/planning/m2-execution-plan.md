# M2 Execution Plan

## Scope Correction

M2 retains its stated goal: identity, tenancy, and app shell. Existing issues M2-01 through M2-06 cover the frontend prototype path. M2-07 and M2-08 add the required server-side identity, tenancy, session, and authorization work.

## Start Gate

Do not start an implementation branch until all of these are true:

- ADR 0008 is accepted.
- The M2 UI specification and demo-data contract are accepted.
- M2-07 and M2-08 exist in the M2 milestone.
- The implementation branch names its domain, governing ADR, and required tests.
- Branches start from the merged `main` commit containing the M2 preparation documents.

## Merge Waves

| Wave | Issues | Branch ownership | Merge condition |
| --- | --- | --- | --- |
| 1 | M2-01, M2-03, M2-07 | design tokens/shared primitives; demo-data contracts; API identity/tenancy modules | Token API, fixture contracts, migrations, and tenant tests are stable. |
| 2 | M2-02, M2-08 | shell/layout/routes; auth/session API and web session adapter | Shell consumes safe session view and tenant context. |
| 3 | M2-04, M2-05 | dashboard feature; review feature | Both compose the merged shell and consume the merged demo-data contracts. |
| 4 | M2-06 | Playwright config and visual smoke tests | Dashboard and review routes are present and stable. |

Use separate worktrees for simultaneous branches. Do not make two active branches edit the same ownership area: global tokens/package dependencies, app-shell layout, shared demo contracts, or Playwright configuration.

## Worktree Map

```text
feature/m2-design-system          M2-01
feature/m2-demo-data              M2-03
feature/m2-identity-tenancy       M2-07
feature/m2-app-shell              M2-02
feature/m2-auth-session           M2-08
feature/m2-dashboard              M2-04
feature/m2-review-prototype       M2-05
feature/m2-playwright             M2-06
```

## Required Review Evidence

- M2-01: token/primitives inventory and accessibility checks.
- M2-02: desktop and mobile shell screenshots with tenant/role context.
- M2-03: fixture-contract tests and scenario review.
- M2-07/M2-08: migration, session, role, tenant-switch, and cross-tenant denial tests.
- M2-04/M2-05: desktop and mobile screenshots plus loading/empty/error/permission states.
- M2-06: Playwright artifacts from CI.

## M2 Completion Criteria

M2 is complete only when the shell is polished, dashboard and review prototypes are available, a signed-in user has an active tenant and role, protected API boundaries enforce membership, and cross-tenant tests pass. Static UI alone does not complete the milestone.
