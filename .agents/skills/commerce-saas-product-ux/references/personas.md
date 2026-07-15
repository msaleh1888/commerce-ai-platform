# Personas

## Catalog Manager

Primary user for the MVP.

Goals:

- Import supplier catalogs quickly.
- Understand which rows failed and why.
- Resolve duplicates and variants safely.
- Approve catalog changes with confidence.
- Avoid corrupting canonical product data.

Pain points:

- Messy supplier data.
- Conflicting identifiers and attributes.
- Manual duplicate review.
- Unclear impact of catalog changes.

UX needs:

- Clear import status.
- Row-level errors.
- Side-by-side product evidence.
- Confidence and reason codes.
- Safe approval flow.
- Undo or audit visibility where appropriate.

## Merchandiser

Secondary product-quality user.

Goals:

- Test search quality for real customer intents.
- Understand why products rank.
- Identify gaps in categories, attributes, synonyms, and product data.
- Compare search configurations.

Pain points:

- Poor search relevance.
- Zero-result queries.
- Search systems that cannot explain ranking.

UX needs:

- Search with evidence.
- Filters and ranking diagnostics.
- Evaluation summaries.
- Examples of improved and failed queries.

## Retailer Administrator

Controls tenant setup, members, roles, and safe system configuration.

Goals:

- Manage user access.
- Verify tenant isolation.
- Configure catalog sources.
- See operational health at a glance.

Pain points:

- Permission mistakes.
- Unknown system state.
- Lack of auditability.

UX needs:

- Role clarity.
- Tenant context always visible.
- Settings and member management.
- Audit history.

## AI/Data Engineer

Technical evaluator and likely hiring-manager proxy.

Goals:

- Understand retrieval architecture.
- Compare lexical, dense, and hybrid search.
- Inspect evaluation methodology.
- Trust that AI outputs are bounded and measured.

Pain points:

- Demo apps with unsupported AI claims.
- No baselines.
- No versioned datasets or reproducibility.

UX needs:

- Metrics with configuration context.
- Baseline comparisons.
- Dataset and manifest references.
- Latency and quality tradeoffs.

## Hiring Manager Reviewer

External portfolio viewer.

Goals:

- Quickly understand what was built.
- See evidence of senior engineering judgment.
- Distinguish this from a generic chatbot.
- Evaluate product sense and implementation maturity.

What impresses them:

- End-to-end workflow.
- Clear architecture.
- Measured retrieval and matching quality.
- Human approval boundary.
- Tenant isolation.
- Professional UI and realistic data.

## Upwork Client Buyer

Potential client assessing whether the builder can solve a real business problem.

Goals:

- See a practical solution to catalog/search/data-quality problems.
- Trust that the builder can communicate and deliver.
- Understand business value without reading all code.

What impresses them:

- Clear before/after workflow.
- Practical import, search, and review screens.
- Evidence-based AI rather than buzzwords.
- Demo that looks close to a real SaaS product.

