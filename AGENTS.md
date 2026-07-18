# Mandatory Architecture Contract

This file applies to every human and AI implementation in this repository.

## Required Reading Before Editing

Read, in order:

1. `docs/architecture/architecture-governance.md`
2. `docs/architecture/final-target-architecture.md`
3. The applicable canonical architecture document and domain contract.
4. `docs/architecture/implementation-guide.md`
5. Any controlling ADR.

Use `.agents/skills/commerce-platform-architecture/SKILL.md` for any architecture, backend, worker, frontend, infrastructure, AI, retrieval, approval, evaluation, or cross-domain implementation task.

## Non-Negotiable Rules

- Do not create a new architectural pattern, package shape, dependency direction, storage authority, task behavior, or mutation path without an approved ADR.
- Do not bypass route-to-use-case, task-to-use-case, tenant scope, approval, audit, or derived-index boundaries.
- Do not treat existing code as permission to repeat a pattern that the architecture does not approve.
- Do not add a temporary shortcut unless an ADR explicitly grants an exception with owner, expiry milestone, migration path, and verification criteria.
- When a required design choice is missing, stop implementation and state: `Decision needed before implementation`.

## Completion Gate

Before declaring work complete, report the affected domain, governing document/ADR, boundary and tenant implications, tests/architecture checks run, and any ADR required. Run `python tools/architecture/check_boundaries.py` for every code change.
