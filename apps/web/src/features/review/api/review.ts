import {
  getDemoReviewCaseDetail,
  listDemoReviewCases,
} from "@/features/demo-data/adapters/review";
import type { DemoScenarioId, DemoSessionView } from "@/features/demo-data/contracts";

import type { ReviewAdapterResult } from "../schemas/view-model";

const tenantScenarioBySlug: Readonly<Record<string, DemoScenarioId>> = {
  "acme-outlet": "acme-outlet",
  "northstar-retail": "northstar-retail",
};

export function loadReviewWorkspace(session: DemoSessionView): ReviewAdapterResult {
  try {
    const scenarioId = tenantScenarioBySlug[session.activeTenant.slug];

    if (!scenarioId) {
      return {
        code: "unknown_tenant",
        message: "The active tenant is not mapped to review demo data.",
        status: "error",
      };
    }

    const summaries = listDemoReviewCases(scenarioId);
    const cases = summaries.flatMap((summary) => {
      const detail = getDemoReviewCaseDetail(summary.caseId, scenarioId);
      return detail ? [detail] : [];
    });
    const firstUnresolved = summaries.find((reviewCase) => reviewCase.status === "unresolved") ?? summaries[0];
    const payload = {
      actor: session.actor,
      allowedCapabilities: [...session.allowedCapabilities],
      cases,
      initialSelectedCaseId: firstUnresolved?.caseId ?? null,
      role: session.role,
      summaries,
      tenant: session.activeTenant,
    };

    return {
      payload,
      status: summaries.length > 0 ? "loaded" : "empty",
    };
  } catch {
    return {
      code: "load_failed",
      message: "Review demo data could not be loaded.",
      status: "error",
    };
  }
}
