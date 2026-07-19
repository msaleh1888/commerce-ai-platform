import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { loadReviewWorkspace } from "../api/review";
import { AuditPreview } from "../components/AuditPreview";
import { EvaluationContextPanel } from "../components/EvaluationContextPanel";
import { FieldComparison } from "../components/FieldComparison";
import { MatchingSignals } from "../components/MatchingSignals";
import { ProvenancePanel } from "../components/ProvenancePanel";
import { RecommendationPanel } from "../components/RecommendationPanel";
import { ReviewCaseHeader } from "../components/ReviewCaseHeader";
import { ReviewQueue } from "../components/ReviewQueue";
import type { ReviewAdapterPayload, ReviewDecision } from "../schemas/view-model";
import {
  cancelReviewDecision,
  confirmReviewDecision,
  createInitialInteractionState,
  openReviewDecision,
  selectReviewCase,
  toReviewFeatureState,
} from "../state/review-state";
import type { DemoSessionView } from "../../demo-data/contracts";
import { getDemoDashboardSummary } from "../../demo-data/adapters/dashboard";
import { getDemoReviewCaseDetail } from "../../demo-data/adapters/review";

const northstarSession = getDemoDashboardSummary("northstar-retail").session;
const acmeSession = getDemoDashboardSummary("acme-outlet").session;

globalThis.React = React;

function loadedPayload(session: DemoSessionView): ReviewAdapterPayload {
  const result = loadReviewWorkspace(session);
  if (result.status === "error" || result.status === "empty") {
    assert.fail(`Expected a populated review workspace, received ${result.status}.`);
  }
  return result.payload;
}

function readyState(session: DemoSessionView = northstarSession) {
  const state = toReviewFeatureState(loadReviewWorkspace(session));
  assert.ok(state.kind === "ready" || state.kind === "partial_success");
  return state;
}

test("Northstar returns only Northstar cases and selects the Sony case first", () => {
  const payload = loadedPayload(northstarSession);

  assert.equal(payload.tenant.slug, "northstar-retail");
  assert.equal(payload.initialSelectedCaseId, "rev_ns_dup_sony_wh1000xm5_001");
  assert.ok(payload.cases.length > 0);
  assert.ok(payload.cases.every((reviewCase) => reviewCase.summary.tenantId === "tenant_northstar_retail"));
  assert.doesNotMatch(JSON.stringify(payload), /tenant_acme_outlet|rev_acme_|Acme Outlet/);
});

test("Northstar keeps incomplete cases visible but marks them unavailable for selection", () => {
  const result = loadReviewWorkspace(northstarSession);

  assert.equal(result.status, "partial");
  assert.equal(result.payload.summaries.length, 3);
  assert.equal(result.payload.cases.length, 1);
  assert.equal(result.payload.unavailableCaseCount, 2);

  const state = toReviewFeatureState(result);
  assert.equal(state.kind, "partial_success");
  assert.equal(state.workspace.queue.length, 3);
  assert.equal(state.workspace.queue.filter((row) => row.detailAvailability === "unavailable").length, 2);
  assert.equal(state.workspace.queue.filter((row) => row.detailAvailability === "ready").length, 1);
});

test("Acme returns only Acme cases and selects the Samsung case first", () => {
  const payload = loadedPayload(acmeSession);

  assert.equal(payload.tenant.slug, "acme-outlet");
  assert.equal(payload.initialSelectedCaseId, "rev_acme_dup_samsung_t7_shield_001");
  assert.ok(payload.cases.every((reviewCase) => reviewCase.summary.tenantId === "tenant_acme_outlet"));
  assert.doesNotMatch(JSON.stringify(payload), /tenant_northstar_retail|rev_ns_|Northstar Retail/);
});

test("an unmapped tenant fails closed without Northstar fallback data", () => {
  const result = loadReviewWorkspace({
    ...northstarSession,
    activeTenant: {
      id: "tenant_northstar_retail",
      name: "Unknown Tenant",
      slug: "unknown-tenant",
    },
  });

  assert.equal(result.status, "error");
  assert.equal(result.code, "unknown_tenant");
  assert.doesNotMatch(JSON.stringify(result), /rev_ns_dup_sony|North Audio Wholesale/);
});

test("a tenant with no cases maps to empty", () => {
  const state = toReviewFeatureState({
    payload: {
      actorName: northstarSession.actor.name,
      allowedCapabilities: northstarSession.allowedCapabilities,
      cases: [],
      initialSelectedCaseId: null,
      role: northstarSession.role,
      summaries: [],
      tenant: northstarSession.activeTenant,
      unavailableCaseCount: 0,
    },
    status: "empty",
  });

  assert.equal(state.kind, "empty");
  assert.match(state.message, /no duplicate-review cases/i);
});

test("a review payload with no decision-ready detail maps to a safe error", () => {
  const payload = loadedPayload(northstarSession);
  const state = toReviewFeatureState({
    payload: {
      ...payload,
      cases: [],
    },
    status: "loaded",
  });

  assert.equal(state.kind, "error");
  assert.equal(state.code, "incomplete_case_detail");
  assert.match(state.message, /detail/i);
});

test("missing catalog.review:read maps to permission denied", () => {
  const state = toReviewFeatureState({
    payload: {
      ...loadedPayload(northstarSession),
      allowedCapabilities: ["catalog.product:read"],
    },
    status: "loaded",
  });

  assert.equal(state.kind, "permission_denied");
  assert.match(state.message, /catalog\.review:read/);
});

test("adapter errors map to safe error states", () => {
  const unknownTenant = toReviewFeatureState({
    code: "unknown_tenant",
    message: "No scenario.",
    status: "error",
  });
  const loadFailed = toReviewFeatureState({
    code: "load_failed",
    message: "Adapter failure.",
    status: "error",
  });

  assert.equal(unknownTenant.kind, "error");
  assert.equal(unknownTenant.code, "unknown_tenant");
  assert.match(unknownTenant.title, /Tenant/);
  assert.equal(loadFailed.kind, "error");
  assert.equal(loadFailed.code, "load_failed");
});

test("ready state preserves evidence, provenance, audit preview, and demo evaluation identifiers", () => {
  const state = readyState();
  const selected = state.workspace.casesById[state.workspace.initialSelectedCaseId];

  assert.equal(selected.summary.caseId, "rev_ns_dup_sony_wh1000xm5_001");
  assert.equal(selected.conflictCount, 2);
  assert.ok(selected.signals.some((signal) => signal.id === "signal_ns_gtin_exact"));
  assert.ok(selected.provenance.some((item) => item.sourceImportId === "imp_ns_2026_07_10_001"));
  assert.equal(selected.auditPreview.target, "prd_ns_canonical_sony_wh1000xm5_black");
  assert.equal(selected.evaluationContext.status, "demo_data");
  assert.equal(selected.evaluationContext.runId, "eval_ns_2026_07_10_r01");
});

test("field comparison status is deterministic from fixture signals and conflicts", () => {
  const state = readyState();
  const selected = state.workspace.casesById[state.workspace.initialSelectedCaseId];
  const gtin = selected.comparison.find((row) => row.field === "gtin");
  const price = selected.comparison.find((row) => row.field === "price");
  const title = selected.comparison.find((row) => row.field === "title");

  assert.equal(gtin?.status, "match");
  assert.equal(price?.status, "caution");
  assert.equal(title?.status, "caution");
});

test("selecting another queued case replaces selection and clears local result", () => {
  const state = {
    ...createInitialInteractionState("rev_ns_dup_sony_wh1000xm5_001"),
    recordedDecision: {
      caseId: "rev_ns_dup_sony_wh1000xm5_001",
      message: "Recorded",
      mode: "demo",
      status: "recorded_locally",
    },
  } as const;
  const next = selectReviewCase(state, "rev_ns_dup_anker_737_001");

  assert.equal(next.selectedCaseId, "rev_ns_dup_anker_737_001");
  assert.equal(next.recordedDecision, null);
  assert.equal(next.pendingDecision, null);
});

test("opening and cancelling a decision only changes pending decision state", () => {
  const state = readyState();
  const interaction = createInitialInteractionState(state.workspace.initialSelectedCaseId);
  const opened = openReviewDecision(interaction, state.workspace, "mark_variant");
  const cancelled = cancelReviewDecision(opened);

  assert.equal(opened.pendingDecision, "mark_variant");
  assert.equal(cancelled.pendingDecision, null);
  assert.equal(cancelled.selectedCaseId, interaction.selectedCaseId);
});

test("confirming each prototype decision records local demo state only", () => {
  const state = readyState();
  const originalDetail = getDemoReviewCaseDetail("rev_ns_dup_sony_wh1000xm5_001", "northstar-retail");
  const serializedBefore = JSON.stringify(originalDetail);
  const unresolvedCountBefore = state.workspace.unresolvedCount;

  for (const decision of ["merge_duplicate", "mark_variant", "keep_separate", "defer"] satisfies ReviewDecision[]) {
    const opened = openReviewDecision(
      createInitialInteractionState(state.workspace.initialSelectedCaseId),
      state.workspace,
      decision,
    );
    const confirmed = confirmReviewDecision(opened);

    assert.equal(confirmed.pendingDecision, null);
    assert.equal(confirmed.recordedDecision?.mode, "demo");
    assert.equal(confirmed.recordedDecision?.status, "recorded_locally");
    assert.match(confirmed.recordedDecision?.message ?? "", /no server-side catalog mutation occurred/);
    assert.equal(state.workspace.unresolvedCount, unresolvedCountBefore);
    assert.equal(state.workspace.casesById[state.workspace.initialSelectedCaseId].summary.status, "unresolved");
  }

  assert.equal(JSON.stringify(getDemoReviewCaseDetail("rev_ns_dup_sony_wh1000xm5_001", "northstar-retail")), serializedBefore);
});

test("Acme merchandiser cannot open an executable merge decision", () => {
  const state = readyState(acmeSession);
  const interaction = createInitialInteractionState(state.workspace.initialSelectedCaseId);
  const opened = openReviewDecision(interaction, state.workspace, "merge_duplicate");

  assert.equal(state.workspace.casesById[state.workspace.initialSelectedCaseId].isApprovalAvailable, false);
  assert.equal(opened.pendingDecision, null);
});

test("Acme renders approval context with a disabled merge control", async () => {
  const { ApprovalPanel } = await import("../components/ApprovalPanel");
  const state = readyState(acmeSession);
  const reviewCase = state.workspace.casesById[state.workspace.initialSelectedCaseId];
  const markup = renderToStaticMarkup(
    createElement(ApprovalPanel, {
      onOpenDecision: () => undefined,
      reviewCase,
    }),
  );

  assert.match(markup, /Approval not executable/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*>.*Approve merge/);
  assert.match(markup, /catalog\.approval:execute/);
});

test("the review queue keeps unavailable evidence visible without making it selectable", () => {
  const state = readyState();
  const markup = renderToStaticMarkup(
    createElement(ReviewQueue, {
      onSelectCase: () => undefined,
      rows: state.workspace.queue,
      selectedCaseId: state.workspace.initialSelectedCaseId,
    }),
  );

  assert.match(markup, /<ul/);
  assert.doesNotMatch(markup, /role="listbox"|role="option"/);
  assert.match(markup, /aria-current="true"/);
  assert.match(markup, /Evidence unavailable/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*>[\s\S]*Evidence unavailable/);
});

test("the selected review case is a second-level heading", () => {
  const state = readyState();
  const reviewCase = state.workspace.casesById[state.workspace.initialSelectedCaseId];
  const markup = renderToStaticMarkup(createElement(ReviewCaseHeader, { reviewCase }));

  assert.match(markup, /<h2/);
  assert.doesNotMatch(markup, /<h1/);
});

test("the review hook consumes the shared current-session boundary", async () => {
  const hookSource = await readFile(new URL("../hooks/useReviewWorkspace.ts", import.meta.url), "utf8");
  const adapterSource = await readFile(new URL("../api/review.ts", import.meta.url), "utf8");
  const workspaceSource = await readFile(new URL("../components/ReviewWorkspace.tsx", import.meta.url), "utf8");

  assert.match(hookSource, /import\s+\{\s*useCurrentSession\s*\}\s+from\s+["']@\/lib\/auth["']/);
  assert.doesNotMatch(hookSource, /features\/auth|features\/demo-data|getSession|function useCurrentSession/);
  assert.doesNotMatch(adapterSource, /React|useCurrentSession|features\/auth/);
  assert.doesNotMatch(workspaceSource, /useCurrentSession|features\/auth|features\/demo-data/);
});

test("the selected case renders evidence, provenance, and demo evaluation context", () => {
  const state = readyState();
  const reviewCase = state.workspace.casesById[state.workspace.initialSelectedCaseId];
  const markup = renderToStaticMarkup(
    createElement(
      React.Fragment,
      null,
      createElement(RecommendationPanel, { reviewCase }),
      createElement(MatchingSignals, { reviewCase }),
      createElement(FieldComparison, { reviewCase }),
      createElement(ProvenancePanel, { reviewCase }),
      createElement(AuditPreview, { reviewCase }),
      createElement(EvaluationContextPanel, { reviewCase }),
    ),
  );

  assert.match(markup, /Recommended proposal/);
  assert.match(markup, /GTIN exact match/);
  assert.match(markup, /Raw incoming/);
  assert.match(markup, /Normalized incoming/);
  assert.match(markup, /Existing canonical/);
  assert.match(markup, /Source row/);
  assert.match(markup, /Audit preview/);
  assert.match(markup, /Demo context/);
  assert.match(markup, /not a verified production measurement/);
  assert.doesNotMatch(markup, /image|OCR|visual similarity|multimodal/i);
});
