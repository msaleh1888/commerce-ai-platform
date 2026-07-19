import type {
  DemoActionResult,
  DemoScenarioId,
  ReviewCaseDetail,
  ReviewCaseSummary,
} from "../contracts";
import { acmeOutletScenario } from "../scenarios/acme-outlet";
import { northstarRetailScenario } from "../scenarios/northstar-retail";

const reviewScenarios = {
  "northstar-retail": northstarRetailScenario,
  "acme-outlet": acmeOutletScenario,
} as const;

export function listDemoReviewCases(
  scenarioId: DemoScenarioId = "northstar-retail",
): readonly ReviewCaseSummary[] {
  return structuredClone(reviewScenarios[scenarioId].dashboard.reviewCases);
}

export function getDemoReviewCaseDetail(
  caseId: string,
  scenarioId: DemoScenarioId = "northstar-retail",
): ReviewCaseDetail | undefined {
  const detail = reviewScenarios[scenarioId].reviewCases.find(
    (reviewCase) => reviewCase.summary.caseId === caseId,
  );

  return detail ? structuredClone(detail) : undefined;
}

export function createDemoReviewActionResult(
  caseId: string,
  action: "approve_merge" | "mark_variant" | "keep_separate" | "defer",
): DemoActionResult {
  const actionLabels = {
    approve_merge: "Approve merge",
    mark_variant: "Mark as variant",
    keep_separate: "Keep separate",
    defer: "Defer",
  } as const;

  return {
    mode: "demo",
    status: "recorded_locally",
    caseId,
    message: `${actionLabels[action]} recorded in prototype state only; no server-side catalog mutation occurred.`,
  };
}
