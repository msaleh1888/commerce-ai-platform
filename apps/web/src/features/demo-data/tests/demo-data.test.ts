import assert from "node:assert/strict";
import test from "node:test";

import { getDemoDashboardSummary } from "../adapters/dashboard";
import {
  createDemoReviewActionResult,
  getDemoReviewCaseDetail,
  listDemoReviewCases,
} from "../adapters/review";
import type {
  DashboardSummary,
  DemoActionResult,
  ReviewCaseDetail,
  ReviewCaseSummary,
} from "../contracts";

function requireValue<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected demo fixture value to be present.");
  }

  return value;
}

test("dashboard adapter returns API-shaped Northstar summary", () => {
  const dashboard: DashboardSummary = getDemoDashboardSummary("northstar-retail");

  assert.equal(dashboard.session.activeTenant.id, "tenant_northstar_retail");
  assert.equal(dashboard.session.role, "catalog_manager");
  assert.ok(dashboard.metricCards.length >= 4);
  assert.ok(dashboard.recentImports.some((item) => item.status === "partial_success"));
  assert.ok(dashboard.feedHealth.length > 0);
  assert.ok(dashboard.pipelineStages.length > 0);
  assert.equal(dashboard.evaluationSummary.status, "demo_data");
  assert.ok(dashboard.auditEvents.length > 0);
});

test("review adapter exposes stable duplicate-review evidence shape", () => {
  const cases: readonly ReviewCaseSummary[] = listDemoReviewCases("northstar-retail");
  const selected = cases.find(
    (reviewCase) => reviewCase.caseId === "rev_ns_dup_sony_wh1000xm5_001",
  );
  const selectedCase = requireValue(selected);

  assert.equal(selectedCase.status, "unresolved");
  assert.equal(selectedCase.tenantId, "tenant_northstar_retail");
  assert.equal(selectedCase.proposal, "merge_duplicate");

  const detail: ReviewCaseDetail | undefined = getDemoReviewCaseDetail(
    selectedCase.caseId,
    "northstar-retail",
  );
  const selectedDetail = requireValue(detail);

  assert.equal(selectedDetail.recordA.gtin, selectedDetail.recordB.gtin);
  assert.ok(selectedDetail.rawNormalizedCanonical.length >= 4);
  assert.ok(selectedDetail.provenance.length >= 3);
  assert.ok(selectedDetail.conflicts.some((conflict) => conflict.field === "price"));
  assert.ok(selectedDetail.signals.some((signal) => signal.weight === "caution"));
  assert.equal(
    selectedDetail.approvalContext.requiredCapability,
    "catalog.approval:execute",
  );
  assert.equal(selectedDetail.evaluationContext.status, "demo_data");
});

test("scenario adapters do not leak Northstar and Acme tenant data", () => {
  const northstar = getDemoDashboardSummary("northstar-retail");
  const acme = getDemoDashboardSummary("acme-outlet");

  assert.equal(northstar.session.activeTenant.id, "tenant_northstar_retail");
  assert.equal(acme.session.activeTenant.id, "tenant_acme_outlet");
  assert.notEqual(northstar.session.actor.email, acme.session.actor.email);

  const serializedNorthstar = JSON.stringify(northstar);
  const serializedAcme = JSON.stringify(acme);

  assert.match(serializedNorthstar, /Northstar Retail/);
  assert.doesNotMatch(serializedNorthstar, /Acme Outlet|tenant_acme_outlet|rev_acme_/);
  assert.match(serializedAcme, /Acme Outlet/);
  assert.doesNotMatch(serializedAcme, /Northstar Retail|tenant_northstar_retail|rev_ns_/);
});

test("adapters return copies and prototype actions disclose demo mode", () => {
  const first = getDemoDashboardSummary("northstar-retail");
  const second = getDemoDashboardSummary("northstar-retail");

  assert.notEqual(first, second);
  assert.notEqual(first.recentImports, second.recentImports);

  const result: DemoActionResult = createDemoReviewActionResult(
    "rev_ns_dup_sony_wh1000xm5_001",
    "approve_merge",
  );

  assert.equal(result.mode, "demo");
  assert.equal(result.status, "recorded_locally");
  assert.match(result.message, /no server-side catalog mutation occurred/);
});
