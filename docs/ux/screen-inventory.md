# UX Screen Inventory

## Purpose

This document defines the screens needed for the first AI-generated UX pass. It is written so v0, Figma Make, or another AI UI tool can generate useful screens without inventing a generic dashboard.

## Product Shell

### Screen: Sign In

User goal:

- Enter the demo application quickly and understand that this is a serious commerce operations product.

Primary actions:

- Sign in.
- Use demo credentials.

Data shown:

- Product name or working name.
- Short product statement.
- Demo tenant hint.

States:

- Empty: blank email/password fields.
- Error: invalid credentials.
- Loading: signing in.
- Success: route to dashboard.

Design notes:

- Keep it restrained and premium.
- Avoid marketing hero energy.
- Show enough brand/product context to feel real.

### Screen: App Shell

User goal:

- Navigate the product and always know the current tenant context.

Primary actions:

- Switch navigation section.
- Use global search.
- View user menu.
- See tenant and system status.

Data shown:

- Tenant: Northstar Retail.
- User: catalog.manager@example.com.
- Global processing indicator.
- Navigation: Dashboard, Imports, Products, Search, Review Queue, Evaluation, Audit, Settings.

States:

- Permission-limited navigation for viewer roles.
- Active section highlighted.

Design notes:

- Left sidebar plus top bar.
- Dense, stable, professional.
- Tenant context must be visible.

## Core Demo Screens

### Screen: Dashboard

User goal:

- Understand current catalog operations at a glance and continue the next important workflow.

Primary actions:

- Start new import.
- Open review queue.
- Open latest evaluation.

Data shown:

- Products indexed.
- Supplier records processed.
- Open review cases.
- Last import status.
- Search quality summary.
- Recent audit events.
- Recent imports.

States:

- Empty: no imports yet, prompt to import catalog.
- Loading: dashboard metrics loading.
- Error: metrics unavailable.

Design notes:

- Avoid vague KPIs.
- Use operational metrics that map to real workflows.
- Show a "needs attention" area for review cases and failed rows.

### Screen: Catalog Import

User goal:

- Upload a CSV or JSON supplier catalog safely.

Primary actions:

- Select source.
- Upload file.
- Start import.

Data shown:

- Source name.
- Accepted file types.
- File size limit.
- Schema expectations.
- Idempotency/content hash explanation in concise operational language.

States:

- Empty: no file selected.
- Drag-over: file drop target active.
- Validation error: unsupported type or missing fields.
- Loading: upload in progress.
- Success: import created.

Design notes:

- Make the upload flow feel robust, not toy-like.
- Show what will happen after upload.

### Screen: Import Processing Status

User goal:

- See exactly what happened to an import and whether it is safe to continue.

Primary actions:

- View rejected rows.
- Open created products.
- Open generated review cases.
- Retry failed stage where safe.

Data shown:

- Import ID.
- Source.
- File hash.
- State machine progress.
- Rows received, valid, rejected.
- Products created/updated.
- Embeddings/indexing status.
- Duplicate candidates generated.
- Rejected row table with reasons.

States:

- Processing.
- Ready.
- Review required.
- Failed with retry option.
- Partial success.

Design notes:

- This is a trust-building screen.
- State and failure details must be easy to scan.

### Screen: Product Catalog Browser

User goal:

- Browse normalized products and inspect source provenance.

Primary actions:

- Search/filter products.
- Open product detail.
- View supplier records.

Data shown:

- Canonical product title.
- Brand.
- Category.
- Price range.
- Supplier count.
- Index status.
- Review status.
- Last updated.

States:

- Empty catalog.
- No filtered results.
- Loading table.
- Permission denied.

Design notes:

- Use a high-quality data table.
- Make product status and source count visible.

### Screen: Product Search

User goal:

- Test complex search intent and inspect why products ranked.

Primary actions:

- Enter search query.
- Apply filters.
- Compare retrieval mode.
- Open product evidence.

Data shown:

- Query.
- Retrieval mode: lexical, dense, hybrid.
- Filters: category, brand, price, status.
- Ranked results.
- Score details.
- Evidence fields.
- Latency.
- Empty-result recovery hint.

States:

- No query.
- Loading.
- Results.
- No results.
- Retrieval service error.

Design notes:

- Show that structured filters are not delegated to embeddings.
- Evidence should be adjacent to ranking.

### Screen: Duplicate Review Queue

User goal:

- Prioritize and open unresolved duplicate or variant cases.

Primary actions:

- Filter cases.
- Sort by confidence/risk.
- Open case.
- Assign or defer.

Data shown:

- Case ID.
- Candidate products.
- Proposed decision.
- Confidence.
- Reason codes.
- Risk level.
- Source/import.
- Age.
- Assignee.

States:

- Empty queue.
- Loading.
- Filtered empty.
- Permission denied.

Design notes:

- This should feel like a serious operations queue.
- Confidence is useful, but risk and evidence should drive trust.

### Screen: Duplicate Review Detail

User goal:

- Decide whether supplier records represent the same product, variants, or separate products.

Primary actions:

- Approve merge.
- Mark as variant.
- Keep separate.
- Defer.

Data shown:

- Supplier record A.
- Supplier record B.
- Normalized canonical fields.
- Matching identifiers.
- Conflicting attributes.
- Similarity signals.
- Evidence snippets.
- Confidence and reason codes.
- Source provenance.
- Decision history.
- Approval permission.
- Audit preview.

States:

- Open.
- Decision submitted.
- Already resolved.
- Concurrent decision conflict.
- Permission denied.

Design notes:

- This is the flagship MVP screen.
- Use side-by-side comparison plus central evidence/decision area.
- Make the human approval boundary obvious.
- Do not hide uncertainty.

### Screen: Evaluation Summary

User goal:

- Understand whether retrieval and matching quality improved against baselines.

Primary actions:

- Select evaluation run.
- Compare configurations.
- Open query examples.
- Export or copy report link later.

Data shown:

- Dataset manifest.
- App/index/model/config versions.
- Lexical baseline.
- Dense retrieval.
- Hybrid retrieval.
- nDCG@10, MRR, Recall@10, Recall@50.
- Latency p50/p95.
- Matching precision/recall/F1.
- False-merge rate.
- Example wins and failures.

States:

- No evaluation runs.
- Running.
- Complete.
- Failed.

Design notes:

- This screen proves credibility.
- Make planned vs achieved results visually distinct.

### Screen: Audit History

User goal:

- Verify who did what, when, and why.

Primary actions:

- Filter by actor, action, target, time.
- Open event detail.

Data shown:

- Timestamp.
- Actor.
- Tenant.
- Action.
- Target.
- Safe metadata.
- Related import/review/evaluation.

States:

- Empty.
- Loading.
- Filtered empty.
- Permission denied.

Design notes:

- Keep it boring in the best way: precise, searchable, trustworthy.

### Screen: Settings / Tenant Administration

User goal:

- Manage tenant basics, members, roles, and catalog settings.

Primary actions:

- View members.
- Change role.
- View permissions.
- Configure source defaults.

Data shown:

- Tenant details.
- Members.
- Roles.
- Permission descriptions.
- Catalog source settings.

States:

- Admin view.
- Non-admin permission limited view.
- Save success.
- Validation error.

Design notes:

- MVP can be simple, but role clarity matters.

