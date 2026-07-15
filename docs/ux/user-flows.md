# UX User Flows

## Purpose

This document defines the workflows that AI UI tools should design around. The product should feel like a coherent operational system, not disconnected pages.

## Primary Demo Flow

Persona:

- Catalog Manager.

Goal:

- Import a messy supplier catalog, search normalized products, review duplicates, approve a safe decision, and verify audit/evaluation evidence.

Flow:

```text
Sign In
-> Dashboard
-> Catalog Import
-> Import Processing Status
-> Product Catalog Browser
-> Product Search
-> Duplicate Review Queue
-> Duplicate Review Detail
-> Approval Confirmation
-> Audit History
-> Evaluation Summary
```

What the reviewer should understand:

- The app handles real catalog operations.
- AI assists with retrieval and matching.
- Business state remains controlled and auditable.
- Human approval protects risky mutations.
- Quality claims are measured.

## Flow 1: First Import

Persona:

- Catalog Manager.

Trigger:

- The tenant has a new supplier catalog file.

Steps:

1. Open dashboard.
2. Click `New import`.
3. Select or create supplier source.
4. Upload CSV or JSON file.
5. Confirm import settings.
6. Submit import.
7. Watch processing status.
8. Inspect rejected rows.
9. Open created products or generated review cases.

UX requirements:

- The user must know whether the file was accepted.
- The user must understand where failures occurred.
- The user must see that retries are safe.
- The user must know when products become searchable.

## Flow 2: Product Search Quality Check

Persona:

- Merchandiser or AI/Data Engineer.

Trigger:

- The user wants to test whether the catalog search can satisfy complex customer intent.

Steps:

1. Open Search.
2. Enter a realistic query.
3. Apply structured filters.
4. Compare retrieval mode.
5. Inspect ranked results and evidence.
6. Open evaluation summary for broader metrics.

Example query:

```text
noise cancelling headphones under 300 comfortable for long flights
```

UX requirements:

- Query and filters must be visually distinct.
- Retrieval mode must be visible.
- Evidence must explain why the result appears.
- Latency and config should be visible without overwhelming the user.

## Flow 3: Duplicate Review

Persona:

- Catalog Manager.

Trigger:

- The system generated duplicate or variant candidates during import.

Steps:

1. Open Review Queue.
2. Filter by unresolved/high confidence/high risk.
3. Open a case.
4. Compare supplier records side by side.
5. Inspect identifiers, attributes, conflicts, and evidence.
6. Choose merge, variant, keep separate, or defer.
7. Confirm consequences.
8. See decision recorded and audit event created.

UX requirements:

- The suggested decision must not look like final truth.
- Uncertainty and conflicts must be visible.
- The approval action must show consequences.
- The resolved state must be obvious.

## Flow 4: Evaluation Review

Persona:

- AI/Data Engineer or Hiring Manager Reviewer.

Trigger:

- The reviewer wants to know whether the AI/retrieval work is real and measured.

Steps:

1. Open Evaluation.
2. Select latest run.
3. Compare lexical, dense, and hybrid retrieval.
4. Inspect metric table.
5. Inspect example wins and failures.
6. Confirm dataset manifest and config version.

UX requirements:

- Baselines must be visually clear.
- Metrics must have labels and definitions.
- Planned targets must not look like achieved results.
- Failures should be shown honestly.

## Flow 5: Tenant Isolation Proof

Persona:

- Hiring Manager Reviewer or Retailer Administrator.

Trigger:

- The reviewer wants confidence that this is a real multi-tenant SaaS design.

Steps:

1. Observe current tenant in top bar.
2. Search products inside Tenant A.
3. Switch to Tenant B or open a forbidden link.
4. See empty/forbidden authorized result.
5. Open audit/security summary later if implemented.

UX requirements:

- Tenant identity must be persistent.
- Forbidden states should be professional and clear.
- The UI should not expose unauthorized metadata.

## Secondary Flow: Admin Role Review

Persona:

- Retailer Administrator.

Steps:

1. Open Settings.
2. View tenant members.
3. Inspect roles and permissions.
4. Confirm which users can import, review, approve, and administer.

UX requirements:

- Permissions must be understandable.
- Dangerous permissions should be distinguishable.
- Role limits should appear in the UI and be enforced server-side.

