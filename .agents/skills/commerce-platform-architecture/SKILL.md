---
name: commerce-platform-architecture
description: Enforce the approved architecture of the commerce AI platform. Use for every architecture, backend, worker, frontend, API, persistence, infrastructure, AI, retrieval, approval, evaluation, or cross-domain implementation or review task in this repository.
---

# Commerce Platform Architecture

Follow the repository architecture contract exactly. Do not substitute common framework conventions for the repository's approved design.

## Mandatory Workflow

1. Read `AGENTS.md`.
2. Read `docs/architecture/architecture-governance.md` and `docs/architecture/final-target-architecture.md`.
3. Read the relevant canonical architecture document and domain contract under `docs/architecture/`.
4. Identify the controlling ADRs.
5. Before editing, state the domain, approved pattern, dependency direction, tenant/authorization impact, and required tests.
6. Implement only the approved pattern.
7. Run `python tools/architecture/check_boundaries.py` and relevant tests.
8. Report the governing rules and any unresolved decision.

## Stop Conditions

Stop and request an ADR before editing when the work needs a new package pattern, a new cross-domain dependency, a new storage authority, direct repository use from a route/task/tool, a new task execution pattern, a new mutation path, an automatic catalog mutation, a model-provider/agent/MCP capability, or an exception to any architecture rule.

## Core Rules

- Routes, worker tasks, agent tools, and MCP tools call application use cases; they do not access repositories or ORM models directly.
- Repositories require tenant scope for protected records.
- Domains do not import another domain's persistence internals.
- PostgreSQL is authoritative; Qdrant, Redis, and model output are derived or untrusted.
- Risky catalog mutation passes through approval execution and audit.
- Existing code is not an exception. Only an ADR can grant one.

## Required Completion Report

State: domain; governing documents/ADRs; architecture checks and tests run; tenant, authorization, idempotency, audit, and evaluation effects; and any `Decision needed before implementation` item.
