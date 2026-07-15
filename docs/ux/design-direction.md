# UX Design Direction

## Design Goal

Create a premium B2B SaaS operations interface for an AI commerce platform. The product should impress hiring managers and Upwork clients by feeling like real software used by catalog, search, and data-quality teams.

The UI should communicate:

- Serious commerce operations.
- Measured AI quality.
- Human-controlled catalog changes.
- Multi-tenant safety.
- Reproducible engineering evidence.

## Target Feel

Use these adjectives as the visual compass:

- Calm.
- Precise.
- Dense.
- Trustworthy.
- Expensive.
- Operational.
- Technical but readable.

## Avoid

- Generic AI dashboard patterns.
- Huge purple gradients.
- Decorative blobs or abstract AI art.
- Marketing page layout inside the app.
- Empty metric cards with vague labels.
- Placeholder content like `Product 1` or `Lorem ipsum`.
- Oversized cards that waste space.
- Hiding errors, uncertainty, or audit context.

## Visual References

Borrow qualities, not exact visuals:

- Linear: polish, rhythm, restrained interaction.
- Stripe Dashboard: clarity and trust.
- Vercel: technical elegance.
- Shopify Admin: commerce workflow practicality.
- Retool: dense operational utility.
- Langfuse: AI observability credibility.

## Layout System

Primary desktop frame:

```text
1440 x 1024
```

Shell:

- Left sidebar.
- Top bar.
- Main workspace.
- Optional right-side context/evidence panel.

Navigation:

- Dashboard.
- Imports.
- Products.
- Search.
- Review Queue.
- Evaluation.
- Audit.
- Settings.

Top bar:

- Tenant selector or tenant label.
- Global search.
- Processing/sync indicator.
- Notifications or review count.
- User menu.

## Color Direction

Use mostly neutral surfaces:

- Background: near-white or very light neutral.
- Sidebar: white or subtle neutral.
- Text: strong neutral.
- Borders: light neutral.
- Accent: restrained blue, teal, or green.

Status colors:

- Processing: blue.
- Ready: green.
- Review required: amber.
- Failed: red.
- Draft/inactive: gray.

Rules:

- Do not let one color dominate the entire app.
- Use color to communicate state, not decoration.
- Avoid trendy purple AI gradients.

## Typography Direction

Recommended font:

- Inter or a similar modern sans-serif.

Suggested sizes:

- Page title: 24px to 30px.
- Section title: 16px to 18px.
- Body: 14px.
- Table text: 13px to 14px.
- Metadata: 12px.

Rules:

- Use clear hierarchy.
- Keep table rows readable.
- Avoid giant hero type inside the application.

## Component Direction

Preferred implementation stack:

- Next.js.
- Tailwind CSS.
- shadcn/ui.
- lucide-react.
- TanStack Table.
- Recharts.

Design components should map naturally to:

- Sidebar navigation.
- Top bar.
- Buttons with icons.
- Data tables.
- Filters.
- Tabs.
- Status badges.
- Progress steps.
- Drawers or side panels.
- Dialogs for confirmation.
- Toasts.
- Metric summaries.
- Charts.
- Evidence panels.
- Audit event lists.

## Flagship Screen Direction

The duplicate review detail screen should be the strongest visual and UX moment.

Recommended structure:

```text
Header:
Case title, confidence, risk, status, source import

Main:
Left panel: Supplier Record A
Center panel: Matching evidence, conflicts, decision recommendation
Right panel: Supplier Record B

Lower or right area:
Decision controls, permission context, audit preview
```

Must show:

- Raw supplier values.
- Normalized values.
- Matching identifiers.
- Conflicting attributes.
- Similarity signals.
- Provenance.
- Human decision options.
- Consequence warning.

## Data Realism

Use realistic demo content:

- Northstar Retail as tenant.
- Acme Outlet as second tenant.
- Supplier examples: North Audio Wholesale, Metro Electronics, Urban Home Supply.
- Product examples:
  - Sony WH-1000XM5 Wireless Noise Canceling Headphones.
  - Bose QuietComfort Ultra Headphones.
  - Anker 737 Power Bank 24,000mAh.
  - Logitech MX Master 3S Wireless Mouse.
  - Samsung T7 Shield Portable SSD 2TB.

Use realistic fields:

- Brand.
- Category.
- GTIN/UPC.
- Manufacturer part number.
- Price.
- Currency.
- Color.
- Capacity.
- Connectivity.
- Source.
- Import ID.
- Confidence.
- Evidence.

## Quality Bar

The design is good enough to implement when:

- The main demo path is understandable from screenshots.
- The duplicate review detail screen feels specific and professional.
- Search results show evidence and ranking context.
- Evaluation reports show baselines and achieved metrics.
- Import status shows failures and recovery.
- Audit trail makes the product feel safe.
- A reviewer can tell this is not a chatbot.

