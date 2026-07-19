import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { loadReviewWorkspace } from "../api/review";
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

function loadedPayload(session: DemoSessionView): ReviewAdapterPayload {
  const result = loadReviewWorkspace(session);
  assert.equal(result.status, "loaded");
  return result.payload;
}

function readyState(session: DemoSessionView = northstarSession) {
  const state = toReviewFeatureState(loadReviewWorkspace(session));
  assert.equal(state.kind, "ready");
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
      actor: northstarSession.actor,
      allowedCapabilities: northstarSession.allowedCapabilities,
      cases: [],
      initialSelectedCaseId: null,
      role: northstarSession.role,
      summaries: [],
      tenant: northstarSession.activeTenant,
    },
    status: "empty",
  });

  assert.equal(state.kind, "empty");
  assert.match(state.message, /no duplicate-review cases/i);
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
    assert.equal(state.workspace.unresolvedCount, 2);
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

test("the hook is the only review module with auth/session access", async () => {
  const hookSource = await readFile(new URL("../hooks/useReviewWorkspace.ts", import.meta.url), "utf8");
  const adapterSource = await readFile(new URL("../api/review.ts", import.meta.url), "utf8");
  const workspaceSource = await readFile(new URL("../components/ReviewWorkspace.tsx", import.meta.url), "utf8");

  assert.match(hookSource, /function useCurrentSession/);
  assert.doesNotMatch(adapterSource, /React|useCurrentSession|features\/auth/);
  assert.doesNotMatch(workspaceSource, /useCurrentSession|features\/auth|features\/demo-data/);
});

test("ready UI components expose queue, evidence, approval, provenance, audit, and evaluation copy", async () => {
  const workspace = await readFile(new URL("../components/ReviewWorkspace.tsx", import.meta.url), "utf8");
  const recommendation = await readFile(new URL("../components/RecommendationPanel.tsx", import.meta.url), "utf8");
  const comparison = await readFile(new URL("../components/FieldComparison.tsx", import.meta.url), "utf8");
  const approval = await readFile(new URL("../components/ApprovalPanel.tsx", import.meta.url), "utf8");
  const dialog = await readFile(new URL("../components/ReviewDecisionDialog.tsx", import.meta.url), "utf8");
  const provenance = await readFile(new URL("../components/ProvenancePanel.tsx", import.meta.url), "utf8");
  const audit = await readFile(new URL("../components/AuditPreview.tsx", import.meta.url), "utf8");
  const evaluation = await readFile(new URL("../components/EvaluationContextPanel.tsx", import.meta.url), "utf8");

  assert.match(workspace, /<ReviewQueue/);
  assert.match(workspace, /<RecommendationPanel/);
  assert.match(workspace, /<ApprovalPanel/);
  assert.match(recommendation, /Recommended proposal/);
  assert.match(comparison, /Raw incoming/);
  assert.match(comparison, /Normalized incoming/);
  assert.match(comparison, /Existing canonical/);
  assert.match(approval, /Approve merge/);
  assert.match(approval, /Mark as variant/);
  assert.match(approval, /Keep separate/);
  assert.match(approval, /Defer/);
  assert.match(dialog, /records local UI state only and does not change catalog data/);
  assert.match(dialog, /no FastAPI call, browser storage write, audit event, or catalog mutation occurs/);
  assert.match(provenance, /Source row/);
  assert.match(audit, /Audit preview/);
  assert.match(evaluation, /Demo context/);
  assert.match(evaluation, /not a verified production measurement/);
});

test("review UI avoids non-MVP multimodal evidence language", async () => {
  for (const component of ["MatchingSignals.tsx", "RecommendationPanel.tsx", "FieldComparison.tsx"]) {
    const source = await readFile(new URL(`../components/${component}`, import.meta.url), "utf8");

    assert.doesNotMatch(source, /image|OCR|visual similarity|multimodal/i);
  }
});
