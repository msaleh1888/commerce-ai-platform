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

The suite starts and owns an isolated Next.js server on the Playwright port. It uses `.next-playwright` rather than the normal `.next` directory, so it does not reuse a developer server or contend with a local development build. Its runner restores Next's generator-owned `next-env.d.ts` after the server exits, keeping the normal `.next` type reference intact. Generated screenshots, traces, videos, reports, and test results are written under `tests/playwright/.artifacts/` and are intentionally ignored.
