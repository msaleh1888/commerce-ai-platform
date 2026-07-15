# ADR 0005: Human Approval Boundary for Catalog Mutations

## Status

Accepted for MVP.

## Context

Incorrect product merges or variant decisions can corrupt catalog state. AI and matching algorithms can provide useful evidence, but false confidence is dangerous. The portfolio should demonstrate safe AI-assisted operations.

## Decision

The system may generate duplicate candidates and proposed decisions, but risky catalog mutations require an authorized human approval before execution. Approval execution must be idempotent and audited.

## Consequences

- The demo shows responsible AI behavior.
- Review cases become a core product surface.
- Automated matching can still reduce workload without owning final authority.
- Approval permissions, operation IDs, and audit trails must be implemented carefully.

## Reconsider When

- A match class reaches extremely high measured precision.
- The product adds configurable automatic approval thresholds.
- Business users explicitly accept a bounded automatic mutation policy.

