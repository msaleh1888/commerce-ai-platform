# Fixture Data

This directory contains deterministic fixture data for local development, CI smoke tests, and future demo seed commands.

## Current Fixture

`demo_catalog_seed.json` defines the first non-mutating demo seed fixture:

- Tenants: `Northstar Retail` and `Acme Outlet`.
- Users: one catalog manager for each tenant.
- Suppliers: two commerce suppliers for Northstar Retail.
- Products: four supplier product records.
- Review cases: one duplicate-review case with evidence and a recommended proposal.

The M1 seed command only loads this fixture and prints a summary. It does not connect to PostgreSQL, mutate data, enqueue worker tasks, or write to Qdrant.

Run it from the repository root:

```bash
python -m commerce_ai_api.scripts.seed_demo
```

After installing the project in editable mode, the console script is also available:

```bash
commerce-ai-seed-demo
```
