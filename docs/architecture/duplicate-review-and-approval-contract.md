# Duplicate Review and Approval Contract

## Ownership

`matching` owns candidate generation, signals, confidence, and evidence. `review` owns human-facing review cases and decisions. `approval` owns the only authorized execution path for risky catalog mutations. `audit` owns append-only event records.

## Review State Machine

```text
open -> approved -> executed
     -> rejected
     -> variant
     -> deferred -> open
```

A state change requires the current state, actor, tenant, role, decision rationale where required, and correlation/operation ID. `approved` is not equivalent to `executed`; execution is an idempotent operation with its own durable result.

## Invariants

- Candidate generation may not mutate canonical products.
- A reviewer sees only cases and evidence within their tenant and role scope.
- Only approval execution may apply merge/variant mutation.
- Execution records one effective outcome for an operation ID, even across retries.
- Every externally meaningful decision and execution creates an audit event with safe metadata.
- Automatic mutation is forbidden without a superseding ADR.

## Required Evidence

A case includes candidate identities, deterministic/semantic signals, confidence, reason codes, source provenance, and uncertainty. The UI must distinguish proposal, decision, and executed state. Tests cover unauthorized approval, duplicate execution, rejected/deferred behavior, audit completeness, and cross-tenant denial.
