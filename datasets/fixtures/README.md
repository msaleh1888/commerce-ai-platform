# Fixture Data

This directory contains deterministic fixture data for local development, CI smoke tests, and future demo seed commands.

## Current Fixture

`demo_catalog_seed.json` defines the first non-mutating demo seed fixture:

- Tenants: `Northstar Retail` and `Acme Outlet`.
- Users: one catalog manager for each tenant.
- Suppliers: two commerce suppliers for Northstar Retail.
- Products: four supplier product records.
- Review cases: one duplicate-review case with evidence and a recommended proposal.

Without `--apply`, the seed command only loads this fixture and prints a summary. With `--apply`, it creates or updates the fixture's identity and tenancy records in PostgreSQL. It does not yet persist suppliers, products, or review cases, enqueue worker tasks, write to Qdrant, execute approval, or create audit records.

Applying identity records requires `COMMERCE_AI_DEMO_SEED_PASSWORD`. Choose that password locally; it is deliberately absent from this fixture and from Git. The command preserves an existing user's password hash on repeat application.

Run it from the repository root:

```bash
python -m commerce_ai_api.scripts.seed_demo
```

After installing the project in editable mode, the console script is also available:

```bash
commerce-ai-seed-demo
```
