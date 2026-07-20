# Playwright Screenshot Smoke Tests

Install browser dependencies:

```bash
npm ci
npx playwright install chromium
```

Run the smoke suite:

```bash
npm run test:smoke:screenshots
```

The suite starts the existing Next.js app with `next dev` on an isolated Playwright port. Generated screenshots, traces, videos, reports, and test results are written under `tests/playwright/.artifacts/` and are intentionally ignored.
