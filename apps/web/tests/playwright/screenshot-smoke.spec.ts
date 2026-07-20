import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

type SmokeScenario = {
  readonly name: string;
  readonly path: "/dashboard" | "/review";
  readonly screenshotName: string;
  readonly viewport: {
    readonly width: number;
    readonly height: number;
  };
};

const screenshotDir = path.join(process.cwd(), "tests", "playwright", ".artifacts", "screenshots");

const scenarios: readonly SmokeScenario[] = [
  {
    name: "dashboard desktop",
    path: "/dashboard",
    screenshotName: "dashboard-desktop-1440x1024.png",
    viewport: { width: 1440, height: 1024 },
  },
  {
    name: "dashboard mobile",
    path: "/dashboard",
    screenshotName: "dashboard-mobile-390x844.png",
    viewport: { width: 390, height: 844 },
  },
  {
    name: "review desktop",
    path: "/review",
    screenshotName: "review-desktop-1440x1024.png",
    viewport: { width: 1440, height: 1024 },
  },
  {
    name: "review mobile",
    path: "/review",
    screenshotName: "review-mobile-390x844.png",
    viewport: { width: 390, height: 844 },
  },
];

test.describe("M2 screenshot smoke coverage", () => {
  for (const scenario of scenarios) {
    test(scenario.name, async ({ page }) => {
      await page.setViewportSize(scenario.viewport);
      await page.goto(scenario.path);

      if (scenario.path === "/dashboard") {
        await waitForDashboard(page);
      } else {
        await waitForReview(page);
      }

      await assertNoHorizontalOverflow(page);
      await mkdir(screenshotDir, { recursive: true });
      await page.screenshot({
        fullPage: true,
        path: path.join(screenshotDir, scenario.screenshotName),
      });
    });
  }
});

async function waitForDashboard(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: "Catalog operations" })).toBeVisible();
  await expectVisibleText(page, "Northstar Retail");
  await expect(page.getByRole("heading", { name: "Catalog health summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pipeline overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent imports" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review queue" })).toBeVisible();
  await expect(page.getByText(/Loading|could not be loaded|Permission denied|No catalog operations yet/i)).toHaveCount(0);
}

async function waitForReview(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: "Review queue" })).toBeVisible();
  await expectVisibleText(page, "Northstar Retail");
  await expect(page.getByText(/Northstar Retail \/ (Catalog Manager|catalog_manager) \/ \d+ unresolved cases/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended proposal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Human approval" })).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "Approve merge" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Matching signals" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Raw/normalized/canonical comparison" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evaluation context" })).toBeVisible();
  await expect(page.getByText(/Loading review cases|No review cases|Tenant review data unavailable|lacks catalog\.review:read/i)).toHaveCount(0);
}

async function expectVisibleText(page: Page, text: string) {
  await expect
    .poll(async () => {
      return page.getByText(text, { exact: true }).evaluateAll((elements) =>
        elements.some((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);

          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        }),
      );
    }, { message: `"${text}" should be visible` })
    .toBe(true);
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(documentElement.scrollWidth, body.scrollWidth);
    const clientWidth = documentElement.clientWidth;

    return {
      clientWidth,
      scrollWidth,
    };
  });

  expect(overflow.scrollWidth, `document width ${overflow.scrollWidth} should not exceed viewport ${overflow.clientWidth}`).toBeLessThanOrEqual(
    overflow.clientWidth + 1,
  );
}
