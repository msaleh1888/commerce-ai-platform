# AI UI Prompt Pack

## Purpose

Use these prompts in v0, Figma Make, or another AI UI generator. The goal is to generate strong first-pass UI screens without doing manual design from scratch.

Recommended first tool:

- v0 by Vercel, because the final implementation target is Next.js, Tailwind, shadcn/ui, lucide-react, TanStack Table, and Recharts.

Optional second tool:

- Figma Make, if you want a clickable design artifact or portfolio-friendly design file.

## How To Use This Prompt Pack

1. Start with the master style prompt.
2. Generate the app shell.
3. Generate one screen at a time.
4. Ask for 3 layout variants for the most important screens.
5. Export screenshots or links.
6. Ask Codex to review them using the `commerce-saas-product-ux` skill.
7. Iterate with the revision prompts.

## Master Style Prompt

```text
Design a premium B2B SaaS operations interface for an AI commerce catalog intelligence platform.

The product helps retailers import messy supplier catalogs, normalize product data, evaluate hybrid product search, detect duplicate products, and approve risky catalog changes through human review.

The app should feel like serious professional software used by catalog managers, merchandisers, retailer admins, and AI/data engineers.

Style:
- premium enterprise SaaS
- calm, precise, dense, trustworthy, technical but readable
- inspired by Linear, Stripe Dashboard, Shopify Admin, Retool, Vercel, and Langfuse
- not a marketing page
- not a generic AI dashboard
- no purple gradient hero sections
- no decorative blobs
- mostly neutral surfaces with restrained blue/green/amber/red status colors
- realistic commerce data, no lorem ipsum

Implementation style:
- Next.js
- Tailwind CSS
- shadcn/ui style components
- lucide icons
- dense data tables
- tabs, filters, status badges, side panels, charts, confirmation dialogs, and audit/event lists

Information architecture:
- left sidebar navigation
- top bar with tenant context, global search, processing status, notifications, and user menu
- main workspace
- optional right-side evidence or activity panel

Navigation:
Dashboard, Imports, Products, Search, Review Queue, Evaluation, Audit, Settings.

Demo tenant:
Northstar Retail.

Use realistic products:
- Sony WH-1000XM5 Wireless Noise Canceling Headphones
- Bose QuietComfort Ultra Headphones
- Anker 737 Power Bank 24,000mAh
- Logitech MX Master 3S Wireless Mouse
- Samsung T7 Shield Portable SSD 2TB

Make the UI look polished enough for a public portfolio case study and impressive to hiring managers and Upwork clients.
```

## Prompt 1: App Shell And Dashboard

```text
Using the master style, design the main app shell and dashboard for the AI commerce catalog intelligence platform.

Frame: desktop 1440x1024.

Shell:
- left sidebar navigation
- top bar with tenant "Northstar Retail"
- global search
- processing/sync indicator
- review notification count
- user menu for catalog.manager@example.com

Dashboard content:
- page title: Commerce Operations
- primary action: New import
- operational metric row:
  - Products indexed
  - Supplier records processed
  - Open review cases
  - Latest search quality
- recent imports table
- review cases needing attention
- latest evaluation summary
- recent audit events

Important:
- Use realistic data.
- Avoid vague KPIs.
- Make it feel like a working operations console.
- Use restrained color and high-quality spacing.
```

## Prompt 2: Catalog Import

```text
Using the master style, design a catalog import screen.

User: catalog manager.
Goal: upload a CSV or JSON supplier catalog and understand what will happen next.

Include:
- source selector
- upload dropzone
- accepted file types
- schema expectations
- import options
- content hash/idempotency hint
- validation preview area
- primary action: Start import

States to show in the design:
- empty upload state
- selected file state
- validation warning example

Use realistic supplier names:
- North Audio Wholesale
- Metro Electronics
- Urban Home Supply

Make the screen feel robust and professional, not like a toy uploader.
```

## Prompt 3: Import Processing Status

```text
Using the master style, design an import processing status screen.

Goal: help the catalog manager understand exactly what happened to an import.

Include:
- import header with source, import ID, file hash, created by, created time
- state machine progress:
  received -> validating -> normalizing -> matching -> embedding -> indexing -> review_required or ready
- row counts:
  received, valid, rejected
- products created and updated
- duplicate candidates generated
- indexing status
- rejected rows table with reasons
- safe retry action for failed stages
- links to products and review cases

Show a realistic partial-success example with a few rejected rows.

The screen should build trust through clear status, evidence, and recovery options.
```

## Prompt 4: Product Search With Evidence

```text
Using the master style, design a product search screen with evidence.

Goal: test complex customer intent and understand why products rank.

Query:
"noise cancelling headphones under 300 comfortable for long flights"

Include:
- search input
- structured filters: category, brand, price, status
- retrieval mode segmented control: lexical, dense, hybrid
- latency and config summary
- ranked product results
- score breakdown
- evidence snippets from product fields or retrieval records
- right-side evidence/detail panel for selected result
- empty state for no results

Important:
- Make structured filters visually separate from semantic search.
- Do not make the UI look like a chatbot.
- Show that search quality is measurable and inspectable.
```

## Prompt 5: Duplicate Review Queue

```text
Using the master style, design a duplicate review queue for catalog managers.

Goal: prioritize unresolved duplicate and variant cases.

Include:
- filters: status, risk, confidence, source, assignee
- table of review cases
- columns:
  case ID, candidate products, proposed decision, confidence, risk, reason codes, source import, age, assignee
- status badges
- bulk or assignment controls if they fit without clutter
- empty state for no open cases

Make it feel like a serious operations queue.
Confidence should be visible, but risk and evidence should feel more important than AI magic.
```

## Prompt 6: Duplicate Review Detail - Flagship Screen

```text
Using the master style, design the flagship duplicate review detail screen.

This is the most important screen in the portfolio MVP. It must look premium, specific, and professional.

User goal:
Decide whether two supplier records represent the same product, variants, or separate products.

Recommended layout:
- header with case ID, status, confidence, risk, source import, and assignee
- left panel: Supplier Record A
- center panel: matching evidence, conflicts, similarity signals, recommendation
- right panel: Supplier Record B
- decision area with actions:
  Approve merge
  Mark as variant
  Keep separate
  Defer
- confirmation/consequence preview
- audit preview
- permission context

Use realistic records:
Record A:
Sony WH-1000XM5 Wireless Noise Canceling Headphones, Black
Supplier: North Audio Wholesale
GTIN: 027242923829
MPN: WH1000XM5/B
Price: 299.99 USD

Record B:
Sony WH1000XM5 Noise Cancelling Bluetooth Headphones - Black
Supplier: Metro Electronics
GTIN: 027242923829
MPN: WH-1000XM5B
Price: 289.95 USD

Evidence:
- exact GTIN match
- normalized brand match
- high title similarity
- MPN formatting difference
- price differs by 3.3%
- category normalized to Audio > Headphones

Important:
- The AI recommendation must look like a proposal, not an automatic truth.
- The human approval boundary must be obvious.
- Show uncertainty and conflicts.
- Make this screen screenshot-worthy for a case study.
```

## Prompt 7: Evaluation Summary

```text
Using the master style, design an evaluation summary screen.

Goal: prove that retrieval and matching quality are measured against baselines.

Include:
- latest evaluation run selector
- dataset manifest card
- config/version metadata
- comparison table:
  lexical baseline
  dense retrieval
  hybrid retrieval
- metrics:
  nDCG@10
  MRR
  Recall@10
  Recall@50
  p95 latency
- matching metrics:
  precision
  recall
  F1
  false-merge rate
  review workload
- chart comparing configurations
- examples:
  queries where hybrid improved results
  queries where hybrid failed

Important:
- Distinguish achieved results from planned targets.
- Make credibility and reproducibility visible.
- Avoid vague AI quality claims.
```

## Prompt 8: Audit History

```text
Using the master style, design an audit history screen.

Goal: verify who did what, when, and why.

Include:
- filters by actor, action, target, and time
- audit event table
- event detail side panel
- events for:
  import created
  import completed
  evaluation run completed
  duplicate case reviewed
  product merge approved
- fields:
  timestamp
  actor
  tenant
  action
  target
  safe metadata
  related objects

Make it precise, searchable, and trustworthy.
Do not overdecorate this screen.
```

## Prompt 9: Settings And Roles

```text
Using the master style, design a tenant settings and roles screen.

Goal: help an administrator understand members, roles, and permissions.

Include:
- tenant details
- members table
- role badges
- permissions matrix for:
  read
  import
  review
  approve
  admin
- catalog source defaults
- permission-limited state for non-admin users

Make role clarity and tenant safety visible.
```

## Variant Prompt

Use this after generating any important screen:

```text
Create 3 distinct layout variants for this screen:

1. Dense operations console.
2. Premium technical SaaS.
3. Evidence-first workflow with a right-side detail panel.

Keep the same product, data, and user goal.
Do not make it a marketing page.
Use realistic commerce data and professional B2B SaaS polish.
```

## Revision Prompt: Make It Less Generic

```text
Revise this screen to feel less like a generic analytics dashboard and more like a serious commerce catalog operations product.

Changes:
- increase useful data density
- improve table quality
- use realistic product/supplier data
- make status and provenance more visible
- make evidence closer to the relevant decision
- reduce decorative cards
- remove vague AI labels
- use restrained neutral styling with clear status badges
- preserve a premium SaaS feel
```

## Revision Prompt: Increase Wow Factor

```text
Revise this screen so it would impress a senior engineering hiring manager and a practical Upwork client.

Emphasize:
- real operational workflow
- AI evidence, not AI hype
- human approval boundary
- evaluation metrics and reproducibility
- tenant context and safety
- polished spacing, typography, and hierarchy

Keep it dense, professional, and usable.
```

## Revision Prompt: Improve Usability

```text
Review and revise this screen for usability.

Ensure:
- the primary user goal is obvious within 5 seconds
- the primary action is clear
- loading, empty, error, and permission-denied states are represented or easy to add
- risky actions show consequences
- evidence is adjacent to decisions
- tables are easy to scan
- labels use domain-specific language
```

## Codex Review Prompt

After generating screenshots or a v0/Figma link, ask Codex:

```text
Use the commerce-saas-product-ux skill to review these UI screens.
Assess whether they fit the target personas, MVP demo story, premium B2B SaaS direction, and portfolio wow factor.
Give concrete revision prompts I can paste back into the AI UI tool.
```

