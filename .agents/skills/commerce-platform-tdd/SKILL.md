---
name: commerce-platform-tdd
description: Enforce strict, architecture-aware red-green-refactor for every implementation or bug-fix task in the commerce AI platform. Use for backend, worker, frontend, API, persistence, infrastructure, AI, retrieval, review, approval, evaluation, and cross-domain changes when tests must drive the work one behavior at a time.
---

# Commerce Platform TDD

Use strict vertical-slice TDD. A slice is one externally observable behavior: write its failing test, make only that behavior pass, then refactor with all tests green. Do not batch tests before implementation and do not batch implementation before feedback.

This skill supplements, never replaces, `.agents/skills/commerce-platform-architecture/SKILL.md`. For product or frontend work, also use `.agents/skills/commerce-saas-product-ux/SKILL.md`.

## Required Reading

Before production-code edits, read in this order:

1. `AGENTS.md`
2. `docs/architecture/architecture-governance.md`
3. `docs/architecture/final-target-architecture.md`
4. The applicable canonical architecture document and domain contract
5. `docs/architecture/implementation-guide.md`
6. The controlling ADRs
7. The issue, accepted plan, and existing tests for the affected seam

When the work is frontend, also read the relevant UX specification and design-capture material. When a required architecture decision is absent, stop with: `Decision needed before implementation`.

## Pre-Code Contract

Before writing a test or production code, state all of the following in a concise update:

- Affected domain and owning module.
- Governing canonical document and ADRs.
- Public seam under test.
- Tenant, authorization, idempotency, audit, and evaluation implications.
- The one behavior in the first vertical slice.
- The focused command that will demonstrate red and green.

A valid seam is an observable public boundary, not a private helper. Use these seams:

| Work | Test seam |
| --- | --- |
| FastAPI | Route request/response plus application use-case contract |
| Application service | Use-case input/output and declared errors |
| Repository | Tenant-scoped persistence contract |
| Celery | Task payload to use-case invocation; never ORM behavior inside a task |
| Frontend feature | Feature adapter, state mapper/hook, and component intent/output |
| Review/approval | Proposal, decision, authorization presentation, durable-operation contract |
| Retrieval/evaluation | Typed request/result with tenant filter, config/version, and evidence |

Do not test private implementation details, CSS class strings as business behavior, framework internals, or fixture internals. Static architecture tests are permitted for import and ownership boundaries.

## The Vertical-Slice Loop

Repeat this loop for every behavior. Do not proceed to the next slice until the current slice is green.

### 1. Red

1. Add one focused behavior test at the approved seam.
2. Name it in domain language, for example: `unknown active tenant becomes a typed review error`.
3. Run only the focused test command.
4. Confirm it fails for the expected missing behavior, not due to syntax, setup, or an unrelated failure.
5. Record the failure cause in the working update.

Production code must not be written before this expected failure is observed. The only permitted pre-test edit is minimal test harness setup required to execute the test.

### 2. Green

1. Implement the smallest approved change that passes the single failing behavior.
2. Preserve dependency direction and package ownership.
3. Do not add a speculative abstraction, additional behavior, unrelated refactor, or dependency.
4. Run the focused test again and confirm it passes.
5. Run the nearest affected test group before starting another slice.

### 3. Refactor

1. Refactor only after the focused and nearest test group are green.
2. Extract only duplication that is now real and only into an architecture-approved owner.
3. Re-run the focused and nearest test group.
4. Keep the behavior test unchanged unless the public contract itself changed through an approved decision.

## Mandatory Behavior Coverage

### Tenant and authorization

Every protected behavior needs a positive tenant-scoped test and a negative isolation test.

- A missing or unmapped tenant fails closed.
- Tenant A never receives Tenant B records, results, evaluation data, or audit data.
- Browser capability data controls presentation only; FastAPI remains authoritative.
- A denied role receives the documented typed denial outcome.

### Stateful and risky operations

Every durable operation needs tests for:

- Happy path.
- Duplicate delivery or repeated operation ID.
- Invalid state transition.
- Authorization denial.
- Audit outcome where applicable.

No test may normalize a direct catalog mutation that bypasses approval execution. Matching creates evidence and proposals; review records decisions; approval execution performs approved risky mutations.

### Frontend operations workflows

Each feature test suite covers:

- Ready state.
- Loading state.
- Empty state.
- Error state.
- Permission-denied state.
- Partial-success state when the workflow supports it.
- Audit/history or provenance presentation when the workflow supports it.

For each feature, test view-model mapping and interaction state before component markup. Keep local interaction state in the smallest feature owner. Routes only compose feature entry points.

### AI, retrieval, matching, and evaluation

Tests must assert the product contract, not hidden reasoning:

- Tenant filter is present at the underlying boundary.
- Evidence, confidence, uncertainty, configuration, and version identifiers are preserved.
- Model output is validated before use.
- Evaluation runs retain manifest, dataset/version, configuration, and result status.
- A demo label is never represented as a verified production measurement.

## Frontend Visual Gate

For a user-facing workflow, behavior tests are necessary but insufficient.

1. Implement the desktop layout at `1440x1024` and mobile layout at `390x844`.
2. Start a stable local server using the current worktree.
3. Capture both states only after data has rendered.
4. Inspect images for horizontal clipping, text overflow, overlap, inaccessible controls, stale data, and hierarchy failures.
5. Fix the problem through a new behavior or presentation slice, then recapture.

Do not commit loading, error, stale, or broken-browser screenshots as product evidence. Do not add Playwright configuration outside its owning issue; use the existing visual-test infrastructure when present.

## Prohibited Shortcuts

- Writing all tests first, then all implementation.
- Calling a change complete because tests pass without confirming the expected red state.
- Replacing a behavior test with a snapshot or CSS-string assertion.
- Mocking away the tenant, authorization, approval, audit, or task boundary under test.
- Adding tests that encode an unapproved architecture pattern.
- Making browser-local state appear durable or authorized.
- Adding a dependency, package pattern, storage authority, mutation path, task type, or cross-domain import without an approved ADR.
- Broad refactors during a green step.
- Marking a test failure as expected without identifying the exact reason.

## Completion Gate

Before declaring the task complete:

1. Confirm every planned behavior has a red-green record in the work updates or commit history.
2. Run the focused suite, affected feature/domain suite, full relevant suite, typecheck/build where applicable, and `git diff --check`.
3. Run `python tools/architecture/check_boundaries.py` for every code change.
4. For UI work, inspect current desktop and mobile evidence.
5. Report the domain, governing documents/ADRs, tests run, tenant/authorization/idempotency/audit/evaluation effects, and any ADR requirement.

## Issue Planning Format

Implementation plans must split work into ordered vertical slices. Each task contains:

```text
Task ID and behavior
Owner and permitted files
Approved seam
Red test and command
Minimal green implementation
Refactor boundary
Focused verification
Completion condition
```

No task combines unrelated behaviors. A task that needs a new architectural choice is replaced with `Decision needed before implementation`.
