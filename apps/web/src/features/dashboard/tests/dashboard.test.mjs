import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const adapter = await readFile(new URL("../api/dashboard.ts", import.meta.url), "utf8");
const viewModel = await readFile(new URL("../schemas/view-model.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../components/DashboardWorkspace.tsx", import.meta.url), "utf8");
const hook = await readFile(new URL("../hooks/useDashboardSummary.ts", import.meta.url), "utf8");
const fixtures = await readFile(new URL("../state/fixtures.ts", import.meta.url), "utf8");
const page = await readFile(new URL("../../../app/(app)/dashboard/page.tsx", import.meta.url), "utf8");
const shellBoundary = await readFile(
  new URL("../../../features/auth/components/AuthenticatedShellBoundary.tsx", import.meta.url),
  "utf8",
);
const northstarScenario = await readFile(
  new URL("../../demo-data/scenarios/northstar-retail.ts", import.meta.url),
  "utf8",
);
const acmeScenario = await readFile(
  new URL("../../demo-data/scenarios/acme-outlet.ts", import.meta.url),
  "utf8",
);

test("dashboard route composes the feature only", () => {
  assert.match(page, /DashboardWorkspace/);
  assert.doesNotMatch(page, /getDemoDashboardSummary|loadDashboardSummary|mapDashboardSummaryToViewModel/);
  assert.doesNotMatch(page, /PrototypeEmptyState/);
});

test("current session is provided by the authenticated shell boundary", () => {
  assert.match(shellBoundary, /CurrentSessionProvider/);
  assert.match(shellBoundary, /session=\{sessionState\.session\}/);
  assert.match(shellBoundary, /sessionMode=\{sessionState\.kind\}/);
  assert.match(hook, /useCurrentSession/);
});

test("tenant-to-scenario mapping is explicit for Northstar and Acme", () => {
  assert.match(adapter, /tenant_northstar_retail/);
  assert.match(adapter, /scenarioId: "northstar-retail"/);
  assert.match(adapter, /tenant_acme_outlet/);
  assert.match(adapter, /scenarioId: "acme-outlet"/);
});

test("unknown active tenants produce a typed error without defaulting to Northstar", () => {
  assert.match(adapter, /kind: "unknown_tenant"/);
  assert.match(adapter, /code: "unknown_tenant"/);
  assert.doesNotMatch(adapter, /getDemoDashboardSummary\(\s*\)/);
});

test("Northstar and Acme dashboard fixtures are serialized without cross-tenant leakage", () => {
  assert.match(northstarScenario, /Northstar Retail/);
  assert.doesNotMatch(northstarScenario, /Acme Outlet|tenant_acme_outlet|rev_acme_|imp_acme_/);

  assert.match(acmeScenario, /Acme Outlet/);
  assert.doesNotMatch(acmeScenario, /Northstar Retail|tenant_northstar_retail|rev_ns_|imp_ns_/);
});

test("dashboard view-model mapping preserves required operational evidence", () => {
  assert.match(viewModel, /export function mapDashboardSummaryToViewModel/);
  assert.match(viewModel, /Search-quality summary/);
  assert.match(viewModel, /Demo evaluation -/);
  assert.match(viewModel, /baselineComparison/);
  assert.match(viewModel, /demoDataNotice/);
  assert.match(viewModel, /hasPartialSuccess/);
  assert.match(viewModel, /metadataSummary/);
});

test("dashboard implements loading, empty, error, permission denied, partial success, and ready states", () => {
  for (const stateName of ["loading", "ready", "empty", "error", "permission_denied"]) {
    assert.match(viewModel, new RegExp(`kind: "${stateName}"`));
  }

  assert.match(fixtures, /dashboardDeniedStateFixture/);
  assert.match(component, /DashboardLoading/);
  assert.match(component, /Permission denied/);
  assert.match(component, /No catalog operations yet/);
  assert.match(component, /Retry/);
  assert.match(component, /Partial success:/);
});

test("review queue navigation targets the review route and remains authorization-honest", () => {
  assert.match(component, /href="\/review"/);
  assert.match(component, /Open review queue/);
  assert.match(component, /FastAPI remains authoritative/);
  assert.doesNotMatch(component, /allowedCapabilities\.includes/);
});
