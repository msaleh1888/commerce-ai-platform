import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appShell = await readFile(new URL("./AppShell.tsx", import.meta.url), "utf8");
const navigation = await readFile(new URL("./navigation.ts", import.meta.url), "utf8");
const adapter = await readFile(new URL("./demo-session-adapter.ts", import.meta.url), "utf8");

test("app shell navigation includes all M2 authenticated destinations", () => {
  for (const destination of [
    "/dashboard",
    "/imports",
    "/products",
    "/search",
    "/review",
    "/evaluation",
    "/audit",
    "/settings",
  ]) {
    assert.match(navigation, new RegExp(`href: "${destination}"`));
  }

  assert.match(navigation, /Review Queue/);
});

test("app shell renders tenant and role context from the session prop", () => {
  assert.match(appShell, /session\.activeTenant\.name/);
  assert.match(appShell, /roleLabel\[session\.role\]/);
  assert.match(appShell, /session\.actor\.name/);
  assert.doesNotMatch(appShell, /allowedCapabilities\.includes/);
});

test("mobile navigation exposes an accessible drawer control", () => {
  assert.match(appShell, /aria-label="Open navigation"/);
  assert.match(appShell, /<Drawer/);
  assert.match(appShell, /aria-label="Primary"/);
  assert.match(appShell, /onNavigate/);
});

test("shell demo adapter is the only layout boundary importing demo data", () => {
  assert.match(adapter, /getDemoDashboardSummary/);
  assert.match(adapter, /DemoSessionView/);
  assert.doesNotMatch(appShell, /@\/features\/demo-data/);
});
