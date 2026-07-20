import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3107);
const host = "127.0.0.1";
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: "tests/playwright/.artifacts/test-results",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "tests/playwright/.artifacts/html-report" }],
  ],
  retries: process.env.CI ? 1 : 0,
  testDir: "tests/playwright",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --hostname ${host} --port ${port}`,
    env: {
      NEXT_DIST_DIR: ".next-playwright",
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
