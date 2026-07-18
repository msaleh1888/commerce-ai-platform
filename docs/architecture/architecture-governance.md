# Architecture Governance

## Authority Order

1. Accepted ADRs.
2. [Final Target Architecture](final-target-architecture.md).
3. Canonical backend, frontend, and domain-contract documents.
4. [Architecture Implementation Standards](implementation-guide.md).
5. Agent instructions, CI checks, and PR templates.

A lower item MUST NOT contradict, weaken, or silently reinterpret a higher item.

ADR 0007 formally adopts this governance model and the canonical implementation boundaries.

## Change Policy

An architecture change requires an ADR before implementation. The ADR MUST state the problem, options, decision, consequences, migration path, affected domains, tenant/security impact, test/evidence plan, and documents/checks that must change.

An implementation may not create a new package pattern, dependency direction, infrastructure component, persistence authority, cross-domain contract, task behavior, or mutation path without an existing approved rule or ADR.

## Exceptions

Exceptions are prohibited unless an ADR explicitly grants one. An exception MUST name an owner, expiry milestone, migration path, and verification criteria. It expires automatically at the stated milestone; work may not rely on it afterward without a new ADR.

## Review Gate

Every architecture-affecting change MUST update the applicable ADR and architecture documents before code review. The PR MUST state the domains affected, governing rule, boundary tests, and whether an ADR is required. CI architecture checks are required status checks.
