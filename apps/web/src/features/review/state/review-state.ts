import type { DemoActionResult, DemoCapability, ReviewCaseDetail } from "@/features/demo-data/contracts";

import type {
  ComparisonStatus,
  ReviewAdapterResult,
  ReviewCaseViewModel,
  ReviewComparisonRowViewModel,
  ReviewDecision,
  ReviewFeatureState,
  ReviewInteractionState,
  ReviewQueueRowViewModel,
  ReviewWorkspaceViewModel,
} from "../schemas/view-model";

const reviewReadCapability: DemoCapability = "catalog.review:read";
const approvalExecuteCapability: DemoCapability = "catalog.approval:execute";

const proposalLabels: Record<ReviewDecision, string> = {
  defer: "Defer",
  keep_separate: "Keep separate",
  mark_variant: "Mark as variant",
  merge_duplicate: "Approve merge",
};

export function formatProposalLabel(proposal: ReviewDecision): string {
  return proposalLabels[proposal];
}

export function createInitialInteractionState(selectedCaseId: string): ReviewInteractionState {
  return {
    pendingDecision: null,
    recordedDecision: null,
    selectedCaseId,
  };
}

export function selectReviewCase(
  state: ReviewInteractionState,
  selectedCaseId: string,
): ReviewInteractionState {
  return {
    ...state,
    pendingDecision: null,
    recordedDecision: null,
    selectedCaseId,
  };
}

export function openReviewDecision(
  state: ReviewInteractionState,
  workspace: ReviewWorkspaceViewModel,
  decision: ReviewDecision,
): ReviewInteractionState {
  const selectedCase = workspace.casesById[state.selectedCaseId];

  if (decision === "merge_duplicate" && !selectedCase?.isApprovalAvailable) {
    return state;
  }

  return {
    ...state,
    pendingDecision: decision,
  };
}

export function cancelReviewDecision(state: ReviewInteractionState): ReviewInteractionState {
  return {
    ...state,
    pendingDecision: null,
  };
}

export function confirmReviewDecision(state: ReviewInteractionState): ReviewInteractionState {
  if (!state.pendingDecision) {
    return state;
  }

  return {
    ...state,
    pendingDecision: null,
    recordedDecision: createLocalReviewActionResult(state.selectedCaseId, state.pendingDecision),
  };
}

function createLocalReviewActionResult(caseId: string, decision: ReviewDecision): DemoActionResult {
  return {
    caseId,
    message: `${proposalLabels[decision]} recorded in prototype state only; no server-side catalog mutation occurred.`,
    mode: "demo",
    status: "recorded_locally",
  };
}

export function toReviewFeatureState(result: ReviewAdapterResult): ReviewFeatureState {
  if (result.status === "error") {
    return {
      code: result.code,
      kind: "error",
      message: result.message,
      title: result.code === "unknown_tenant" ? "Tenant review data unavailable" : "Review data failed to load",
    };
  }

  if (!result.payload.allowedCapabilities.includes(reviewReadCapability)) {
    return {
      kind: "permission_denied",
      message: "The current session can see the application shell, but lacks catalog.review:read for duplicate review.",
      title: "Review permission required",
    };
  }

  if (result.status === "empty" || result.payload.summaries.length === 0 || !result.payload.initialSelectedCaseId) {
    return {
      kind: "empty",
      message: "This tenant has no duplicate-review cases in the M2 demo data.",
      title: "No review cases",
    };
  }

  return {
    kind: "ready",
    workspace: mapReviewWorkspace(result.payload),
  };
}

function mapReviewWorkspace(payload: Exclude<ReviewAdapterResult, { status: "error" }>["payload"]): ReviewWorkspaceViewModel {
  const cases = payload.cases.map((reviewCase) =>
    mapReviewCase(reviewCase, payload.allowedCapabilities),
  );

  return {
    actorName: payload.actor.name,
    casesById: Object.fromEntries(cases.map((reviewCase) => [reviewCase.summary.caseId, reviewCase])),
    initialSelectedCaseId: payload.initialSelectedCaseId ?? payload.summaries[0].caseId,
    queue: payload.summaries.map((summary): ReviewQueueRowViewModel => ({
      ...summary,
      confidenceLabel: formatConfidence(summary.confidence),
      proposalLabel: formatProposalLabel(summary.proposal),
    })),
    role: payload.role,
    tenantName: payload.tenant.name,
    tenantSlug: payload.tenant.slug,
    unresolvedCount: payload.summaries.filter((reviewCase) => reviewCase.status === "unresolved").length,
  };
}

function mapReviewCase(
  reviewCase: ReviewCaseDetail,
  allowedCapabilities: readonly DemoCapability[],
): ReviewCaseViewModel {
  const supportingSignalCount = reviewCase.signals.filter((signal) => signal.weight === "supporting").length;

  return {
    approvalContext: reviewCase.approvalContext,
    auditPreview: reviewCase.auditPreview,
    comparison: reviewCase.rawNormalizedCanonical.map((row) => ({
      ...row,
      status: deriveComparisonStatus(row.field, reviewCase),
      statusLabel: statusLabel[deriveComparisonStatus(row.field, reviewCase)],
    })),
    confidenceLabel: formatConfidence(reviewCase.summary.confidence),
    conflictCount: reviewCase.conflicts.length,
    conflicts: reviewCase.conflicts,
    evaluationContext: reviewCase.evaluationContext,
    isApprovalAvailable:
      reviewCase.approvalContext.allowedForCurrentRole &&
      allowedCapabilities.includes(approvalExecuteCapability),
    proposalLabel: formatProposalLabel(reviewCase.summary.proposal),
    provenance: reviewCase.provenance,
    recordA: reviewCase.recordA,
    recordB: reviewCase.recordB,
    signals: reviewCase.signals,
    summary: reviewCase.summary,
    supportingSignalCount,
  };
}

const statusLabel: Record<ComparisonStatus, string> = {
  blocking: "Blocking conflict",
  caution: "Needs review",
  match: "Supporting match",
};

function deriveComparisonStatus(field: string, reviewCase: ReviewCaseDetail): ComparisonStatus {
  const conflict = reviewCase.conflicts.find((item) => normalizeField(item.field) === normalizeField(field));

  if (conflict?.severity === "high") {
    return "blocking";
  }

  if (conflict) {
    return "caution";
  }

  const signal = reviewCase.signals.find((item) => normalizeField(item.label).includes(normalizeField(field)));

  if (signal?.weight === "blocking") {
    return "blocking";
  }

  if (signal?.weight === "caution") {
    return "caution";
  }

  return "match";
}

function normalizeField(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}
