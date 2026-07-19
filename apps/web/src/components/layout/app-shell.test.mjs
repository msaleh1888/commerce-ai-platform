import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appShell = await readFile(new URL("./AppShell.tsx", import.meta.url), "utf8");
const navigation = await readFile(new URL("./navigation.ts", import.meta.url), "utf8");
const adapter = await readFile(new URL("./demo-session-adapter.ts", import.meta.url), "utf8");
const rootLayout = await readFile(new URL("../../app/layout.tsx", import.meta.url), "utf8");
const authenticatedShell = await readFile(
  new URL("../../features/auth/components/AuthenticatedShellBoundary.tsx", import.meta.url),
  "utf8",
);

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

test("shell loads the safe auth session before using a labeled development demo fallback", () => {
  assert.match(authenticatedShell, /getSession\(\)/);
  assert.match(authenticatedShell, /kind: "authenticated"/);
  assert.match(authenticatedShell, /kind: "signed_out"/);
  assert.match(authenticatedShell, /process\.env\.NODE_ENV === "development"/);
  assert.match(appShell, /Demo session preview/);
});

test("shell demo adapter is the only layout boundary importing demo data", () => {
  assert.match(adapter, /getDemoDashboardSummary/);
  assert.match(adapter, /DemoSessionView/);
  assert.doesNotMatch(appShell, /@\/features\/demo-data/);
});

test("prototype search and user-menu placeholders are not no-op controls", () => {
  assert.doesNotMatch(appShell, /<button\s+className="flex min-w-0 flex-1/);
  assert.doesNotMatch(appShell, /aria-label="Open user menu placeholder"/);
});

test("root layout tolerates extension-added body attributes without suppressing app content", () => {
  assert.match(rootLayout, /<body suppressHydrationWarning>/);
  assert.doesNotMatch(rootLayout, /<html[^>]*suppressHydrationWarning/);
});
