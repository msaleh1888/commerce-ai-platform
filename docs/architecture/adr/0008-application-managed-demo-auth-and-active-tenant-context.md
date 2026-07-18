# ADR 0008: Application-Managed Demo Authentication and Active Tenant Context

## Status

Accepted.

## Context

M2 must demonstrate an authenticated multi-tenant SaaS foundation, not only a visual tenant label. The platform needs a local-first approach that runs in Docker Compose, supports deterministic demo users, enforces role permissions server-side, and leaves a clean path to a future external identity provider.

## Decision

FastAPI owns application authentication, session validation, active-tenant selection, and server-side authorization. Next.js consumes the resulting session and never decides whether an operation is permitted.

Use these M2 records in PostgreSQL:

- `users`: identity and password credential metadata.
- `tenants`: tenant identity and display metadata.
- `memberships`: a user's tenant membership and role.
- `sessions`: opaque session-token hash, user ID, active tenant ID, issued/expiry/revocation metadata, and safe request metadata.

Passwords are stored only as Argon2id hashes. Session tokens are cryptographically random opaque values; PostgreSQL stores only their hashes. The API sends the token in a `commerce_ai_session` cookie with `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` enabled outside local HTTP development. Sessions are revocable and expire after 12 hours.

The active tenant is held by the session, not trusted from an arbitrary browser header. Tenant switching uses an authenticated API endpoint and succeeds only when an active membership exists. Each protected API dependency resolves actor, active tenant, and membership role together. A use case receives that tenant context explicitly; repository and retrieval filtering rules from ADR 0003 remain mandatory.

M2 ships only seeded demo users and memberships. There is no public sign-up, invitation workflow, password-reset workflow, SSO, or external identity-provider integration in M2.

## Roles

| Role | M2 permission baseline |
| --- | --- |
| `administrator` | Manage tenant members/settings and perform all tenant operations. |
| `catalog_manager` | Import/manage catalog data, review and approve catalog changes, view audit and evaluation. |
| `merchandiser` | Browse/search catalog data and view evaluation; cannot import, administer, or approve mutations. |
| `ai_engineer` | View catalog/search/evaluation evidence and run approved evaluation operations when introduced; cannot approve catalog mutations. |
| `viewer` | Read permitted dashboard, catalog, search, evaluation, and audit views only. |

## API Contract

M2 exposes these FastAPI-owned contracts:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/session`
- `PUT /auth/active-tenant`

`GET /auth/session` returns a safe session view: actor, active tenant, memberships, role, and allowed capability identifiers. It never returns password data or the opaque session token.

The web application sends credentialed requests to the API through the approved API client. Development CORS permits only the configured web origin with credentials; production deployment uses the same parent-site policy or an explicitly configured trusted web origin.

## Consequences

- M2 gains demonstrable tenant isolation and role-aware navigation without adopting external infrastructure.
- API routes remain thin adapters over identity/tenancy application use cases.
- Session, membership, and tenant-switch tests become required M2 evidence.
- Replacing demo auth with an external provider later requires a new adapter and ADR, while preserving the same actor/tenant application contract.

## Migration Path

1. Add identity and tenancy module scaffolding, models, migrations, repositories, use cases, and cross-tenant test helpers.
2. Seed Northstar Retail and Acme Outlet with deterministic demo memberships.
3. Implement the session API contracts and server-side dependencies.
4. Connect the M2 app shell to the safe session view and tenant switcher.
5. Add protected-route and cross-tenant integration tests before protected catalog capabilities begin.

## Verification

- Passwords and raw session tokens never appear in database query results, logs, API responses, fixtures, or audit payloads.
- An unauthenticated request receives an authenticated failure response.
- A user cannot switch to, read from, search, or mutate a tenant without membership.
- A lower-privilege role cannot invoke an approval or administration use case.
- A revoked or expired session cannot access protected routes.
