# v0 Design Capture

## Purpose

This document preserves the useful design direction generated in v0 before credits/session context are lost. It records the variants, what worked, what did not, and the selected direction for implementation.

Screenshots or exports should be saved under:

```text
docs/ux/artifacts/v0/
```

Recommended filenames:

```text
variant-1-dense-console.png
variant-2-premium-saas.png
variant-3-evidence-first.png
variant-3-evidence-first-color-pass.png
```

Exported code files:

```text
docs/ux/artifacts/v0/export/variant-1-dense-console.tsx
docs/ux/artifacts/v0/export/variant-2-premium-saas.tsx
docs/ux/artifacts/v0/export/variant-3-evidence-first.tsx
docs/ux/artifacts/v0/export/globals.css
```

## Generated Variants

### Variant 1: Dense Console

Route shown:

```text
/dense
```

Strengths:

- Strong operational density.
- Best dashboard information structure.
- Good ingestion pipeline row.
- Useful recent imports table.
- Supplier feed health table adds realism.
- Evaluation summary visible in the dashboard.

Weaknesses:

- Feels more utilitarian than premium.
- Left rail is compact but less clear for first-time reviewers.
- Color and brand identity are restrained to the point of being slightly sterile.

Use later for:

- Dashboard layout.
- Import pipeline status.
- Supplier feed health.
- Evaluation summary placement.

Code reference:

```text
docs/ux/artifacts/v0/export/variant-1-dense-console.tsx
```

### Variant 2: Premium SaaS

Route shown:

```text
/premium
```

Strengths:

- Best general app polish.
- Clean sidebar and product branding with `Catalog IQ`.
- Metrics cards feel more refined.
- Layout breathes better than Variant 1.
- Stronger first impression for non-technical reviewers.

Weaknesses:

- Slightly too roomy for repeated operations work.
- Less distinctive than the evidence-first workflow.
- Dashboard risks feeling like a standard SaaS template if not enriched.

Use later for:

- App shell.
- Sidebar.
- Top bar treatment.
- Metric card visual style.
- Overall spacing and polish.

Code reference:

```text
docs/ux/artifacts/v0/export/variant-2-premium-saas.tsx
```

### Variant 3: Evidence-First

Route shown:

```text
/evidence
```

Strengths:

- Best direction for the project.
- Shows review queue plus case detail in one workflow.
- Makes this feel unlike a generic chatbot or dashboard.
- Strongest hiring-manager signal because it shows AI-assisted operations with human decisioning.
- Detection signals and field comparison are credible product surfaces.

Weaknesses:

- Too white/sterile in the first version.
- `Merge records` sounds too immediate and unsafe.
- Recommendation reads too much like final truth instead of a proposal.
- Needs stronger human approval context.
- Needs provenance metadata.
- Field comparison needs raw, normalized, and canonical values.
- Included an image-related signal in an earlier version; MVP excludes multimodal/image processing.

Selected as:

```text
Primary UX direction for the flagship duplicate review workflow.
```

Code reference:

```text
docs/ux/artifacts/v0/export/variant-3-evidence-first.tsx
```

## Current Design Decision

Use this composite direction:

```text
Variant 2 app shell
+ Variant 1 dashboard density
+ Variant 3 evidence-first review workflow
```

The design should remain:

- Premium.
- Calm.
- Dense.
- Evidence-driven.
- Operational.
- Trustworthy.
- More colorful than the first white-heavy pass, but not decorative.

## Required Changes To Variant 3

### Safety and Wording

Change:

```text
Merge records
```

To:

```text
Approve merge
```

Rationale:

- The product is about human approval, not direct AI/autonomous mutation.

### Recommendation Framing

Change the recommendation block to say:

```text
Recommended proposal
Strong evidence, 2 conflicts require review
97% confidence
```

Rationale:

- The system proposes; the human approves.
- Uncertainty and conflict should remain visible.

### Human Approval Context

Add near the decision actions:

```text
Requires Catalog Manager approval
Operation ID: APR-10492
Mutation will be recorded in audit trail
```

### MVP-Safe Detection Signals

Use:

- MPN similarity.
- Attribute overlap.
- Category match.
- GTIN match.

Avoid:

- Image hash.
- Visual similarity.
- OCR.
- Any multimodal signal.

### Provenance Metadata

Add for both incoming and existing records:

- Supplier.
- Import ID.
- Source row.
- Catalog version.
- Last seen.

### Field Comparison Columns

Use:

```text
Field
Raw incoming
Normalized incoming
Existing canonical
Status
```

Example rows:

- GTIN.
- Title.
- Brand.
- Color.
- Price.
- Warranty.
- Category.
- MPN.

### Matching Evaluation Panel

Add compact panel:

```text
Matching evaluation
Precision: 94.1%
False merge rate: 0.7%
Review threshold: 0.82
Evaluation run: WDC-subset-014
```

Rationale:

- Shows evaluation discipline inside the product.
- Reinforces senior AI engineering credibility.

## Color Direction

The first v0 pass is too white. Add controlled brand atmosphere:

- Subtle tinted sidebar or active navigation.
- Deep blue or blue-teal primary accent.
- Soft blue evidence panels.
- Amber/red severity accents.
- Green/teal success and quality-improvement indicators.
- Selected-row background in review queue.
- Light tinted section headers where useful.

Avoid:

- Purple AI gradients.
- Decorative blobs.
- Rainbow dashboard colors.
- Dark mode as the only wow factor.
- Oversized colorful cards.

## Final v0 Revision Prompt

Use this prompt if v0 credits become available again:

```text
Use the Evidence-first variant as the base layout.

Revise the Evidence-first duplicate review screen into the final flagship screen for a premium B2B AI commerce operations platform.

Keep:
- the left sidebar navigation
- the review queue column on the left
- the case detail workspace on the right
- the evidence-first structure
- the detection signals
- the field comparison table
- the reject/merge decision area

Improve the design with a stronger premium brand identity while preserving the serious B2B SaaS operations feel.

The current design is too white and sterile. Add controlled color and visual atmosphere without making it look like a marketing page.

Use:
- a subtle tinted sidebar or workspace background
- a stronger primary brand color, deep blue or blue-teal
- soft blue evidence panels
- amber/red severity accents in review workflows
- green/teal success and quality-improvement indicators
- richer chart or signal colors
- subtle selected-row and active-nav backgrounds
- light tinted section headers where useful

Content and UX changes:
- Rename "Merge records" to "Approve merge"
- Make the AI recommendation clearly a proposal, not final truth
- Add human approval context near the action buttons:
  Requires Catalog Manager approval
  Operation ID APR-10492
  Mutation will be recorded in audit trail
- Replace "Image hash" with MVP-safe signals:
  MPN similarity
  Attribute overlap
  Category match
- Add provenance metadata:
  Supplier
  Import ID
  Source row
  Catalog version
  Last seen
- Improve the field comparison table with:
  Raw incoming
  Normalized incoming
  Existing canonical
- Show uncertainty:
  Strong evidence, 2 conflicts require review
- Add a compact matching evaluation panel:
  Precision 94.1%
  False merge rate 0.7%
  Review threshold 0.82
  Evaluation run WDC-subset-014

Avoid:
- switching to the Dense console or Premium SaaS variant
- purple AI gradients
- decorative blobs
- rainbow colors
- dark mode
- oversized colorful cards
- reducing data density
- making it look like a generic AI dashboard

The final result should feel premium, trustworthy, modern, memorable, and usable for catalog operations.
```

## Local Implementation Direction

Because v0 credits are limited, the next cost-effective path is:

```text
v0 screenshots as reference
-> local Next.js implementation
-> Playwright screenshots
-> Codex critique
-> local polish iterations
```

This avoids spending more v0 credits while preserving the useful direction already generated.
