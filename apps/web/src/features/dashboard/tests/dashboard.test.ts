import assert from "node:assert/strict";
import test from "node:test";

import type { CurrentSessionView } from "@/lib/auth";

import {
  loadDashboardSummaryForSession,
  mapDashboardTenantToScenario,
} from "../api/dashboard";
import {
  createDashboardReadyState,
  mapDashboardSummaryToViewModel,
} from "../schemas/view-model";
import {
  createDashboardLoadFailedState,
  createDashboardStateFromAdapterResult,
} from "../state/dashboard-state";
import { createDashboardAttention } from "../state/attention";
import {
  createDashboardLoadingState,
  dashboardDeniedAdapterFixture,
} from "../state/fixtures";

const northstarSession: CurrentSessionView = {
  actor: { name: "Maya Chen" },
  activeTenant: {
    id: "tenant_northstar_retail",
    name: "Northstar Retail",
    slug: "northstar-retail",
  },
  allowedCapabilities: ["catalog.dashboard:read", "catalog.review:read", "catalog.approval:execute"],
  role: "catalog_manager",
};

const acmeSession: CurrentSessionView = {
  actor: { name: "Jordan Lee" },
  activeTenant: {
    id: "tenant_acme_outlet",
    name: "Acme Outlet",
    slug: "acme-outlet",
  },
  allowedCapabilities: ["catalog.dashboard:read", "catalog.review:read"],
  role: "merchandiser",
};

test("tenant-to-scenario mapping is explicit and unknown tenants do not default", () => {
  assert.deepEqual(mapDashboardTenantToScenario("tenant_northstar_retail"), {
    kind: "mapped",
    scenarioId: "northstar-retail",
  });
  assert.deepEqual(mapDashboardTenantToScenario("tenant_acme_outlet"), {
    kind: "mapped",
    scenarioId: "acme-outlet",
  });

  const unknown = mapDashboardTenantToScenario("tenant_unknown");
  assert.equal(unknown.kind, "unknown_tenant");
  assert.equal(unknown.tenantId, "tenant_unknown");
});

test("dashboard adapter returns only the active tenant's deterministic summary", async () => {
  const northstar = await loadDashboardSummaryForSession(northstarSession);
  const acme = await loadDashboardSummaryForSession(acmeSession);

  assert.equal(northstar.kind, "ready");
  assert.equal(acme.kind, "ready");
  if (northstar.kind !== "ready" || acme.kind !== "ready") {
    throw new Error("Expected ready dashboard summaries for both configured demo tenants.");
  }

  const northstarSerialized = JSON.stringify(northstar.summary);
  const acmeSerialized = JSON.stringify(acme.summary);

  assert.equal(northstar.summary.session.activeTenant.id, "tenant_northstar_retail");
  assert.doesNotMatch(northstarSerialized, /Acme Outlet|tenant_acme_outlet|rev_acme_|imp_acme_/);

  assert.equal(acme.summary.session.activeTenant.id, "tenant_acme_outlet");
  assert.doesNotMatch(acmeSerialized, /Northstar Retail|tenant_northstar_retail|rev_ns_|imp_ns_/);
});

test("unknown active tenant becomes a typed dashboard error", async () => {
  const result = await loadDashboardSummaryForSession({
    actor: { name: "Unknown" },
    activeTenant: { id: "tenant_unknown", name: "Unknown", slug: "unknown" },
    allowedCapabilities: [],
    role: "viewer",
  });

  assert.deepEqual(createDashboardStateFromAdapterResult(result), {
    kind: "error",
    code: "unknown_tenant",
    title: "Dashboard data unavailable",
    message: "No dashboard demo scenario is configured for tenant tenant_unknown.",
  });
});

test("typed permission denial is represented without browser role inference", () => {
  assert.deepEqual(createDashboardStateFromAdapterResult(dashboardDeniedAdapterFixture), {
    kind: "permission_denied",
    tenantName: "Northstar Retail",
    message:
      "The dashboard adapter returned a permission-denied state. The browser role display did not make this authorization decision.",
  });
});

test("dashboard state helpers cover loading, empty, ready, partial success, and load failure", async () => {
  const loading = createDashboardLoadingState(northstarSession);
  assert.deepEqual(loading, { kind: "loading", tenantName: "Northstar Retail" });

  const result = await loadDashboardSummaryForSession(northstarSession);
  assert.equal(result.kind, "ready");
  if (result.kind !== "ready") {
    throw new Error("Expected a ready Northstar dashboard summary.");
  }

  const ready = createDashboardReadyState(result.summary);
  assert.equal(ready.kind, "ready");
  if (ready.kind === "ready") {
    assert.equal(ready.viewModel.hasPartialSuccess, true);
  }

  const empty = createDashboardReadyState({
    ...result.summary,
    recentImports: [],
    reviewSummary: { ...result.summary.reviewSummary, open: 0 },
    auditEvents: [],
  });
  assert.equal(empty.kind, "empty");
  assert.deepEqual(createDashboardLoadFailedState(), {
    kind: "error",
    code: "load_failed",
    title: "Dashboard data unavailable",
    message:
      "The dashboard demo adapter could not load this tenant summary. Retry only reloads local dashboard state.",
  });
});

test("view-model mapping preserves evidence and marks negative evaluation deltas as failed", async () => {
  const result = await loadDashboardSummaryForSession(northstarSession);
  assert.equal(result.kind, "ready");
  if (result.kind !== "ready") {
    throw new Error("Expected a ready Northstar dashboard summary.");
  }

  const summaryWithNegativeDelta = {
    ...result.summary,
    evaluationSummary: {
      ...result.summary.evaluationSummary,
      metrics: [
        { ...result.summary.evaluationSummary.metrics[0], delta: "-0.04" },
        ...result.summary.evaluationSummary.metrics.slice(1),
      ],
    },
  };
  const viewModel = mapDashboardSummaryToViewModel(summaryWithNegativeDelta);

  assert.equal(viewModel.metrics.some((metric) => metric.label === "Search-quality summary"), true);
  assert.equal(viewModel.evaluation.metrics[0].deltaTone, "failed");
  assert.equal(viewModel.evaluation.manifestId, result.summary.evaluationSummary.manifestId);
  assert.equal(viewModel.auditEvents.length, result.summary.auditEvents.length);
});

test("attention is limited to urgent reviews and import exceptions for the active tenant", async () => {
  const northstar = await loadDashboardSummaryForSession(northstarSession);
  const acme = await loadDashboardSummaryForSession(acmeSession);

  assert.equal(northstar.kind, "ready");
  assert.equal(acme.kind, "ready");
  if (northstar.kind !== "ready" || acme.kind !== "ready") {
    throw new Error("Expected ready dashboard summaries for both configured demo tenants.");
  }

  const northstarState = createDashboardReadyState(northstar.summary);
  const acmeState = createDashboardReadyState(acme.summary);
  assert.equal(northstarState.kind, "ready");
  assert.equal(acmeState.kind, "ready");
  if (northstarState.kind !== "ready" || acmeState.kind !== "ready") {
    throw new Error("Expected ready dashboard view models for both configured demo tenants.");
  }

  const northstarAttention = createDashboardAttention(northstarState.viewModel);
  assert.deepEqual(northstarAttention?.items.map((item) => item.label), [
    "4 high-risk duplicate reviews",
    "37 rejected rows from North Audio Wholesale",
  ]);
  assert.equal(createDashboardAttention(acmeState.viewModel), null);
});

test("each tenant's completed evaluation is displayed as ready", async () => {
  for (const session of [northstarSession, acmeSession]) {
    const result = await loadDashboardSummaryForSession(session);
    assert.equal(result.kind, "ready");
    if (result.kind !== "ready") {
      throw new Error("Expected a ready dashboard summary.");
    }

    const state = createDashboardReadyState(result.summary);
    assert.equal(state.kind, "ready");
    if (state.kind !== "ready") {
      throw new Error("Expected a ready dashboard view model.");
    }

    const searchQuality = state.viewModel.metrics.find((metric) => metric.label === "Search-quality summary");
    assert.equal(searchQuality?.statusLabel, "Demo evaluation - Ready");
  }
});
