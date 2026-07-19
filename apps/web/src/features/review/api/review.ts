import {
  getDemoReviewCaseDetail,
  listDemoReviewCases,
} from "@/features/demo-data/adapters/review";
import type { DemoScenarioId } from "@/features/demo-data/contracts";
import type { CurrentSessionView } from "@/lib/auth";

import type { ReviewAdapterResult } from "../schemas/view-model";

const tenantScenarioBySlug: Readonly<Record<string, DemoScenarioId>> = {
  "acme-outlet": "acme-outlet",
  "northstar-retail": "northstar-retail",
};

export function loadReviewWorkspace(session: CurrentSessionView): ReviewAdapterResult {
  try {
    const scenarioId = tenantScenarioBySlug[session.activeTenant.slug];

    if (!scenarioId) {
      return {
        code: "unknown_tenant",
        message: "The active tenant is not mapped to review demo data.",
        status: "error",
      };
    }

    const allSummaries = listDemoReviewCases(scenarioId);
    const detailPairs = allSummaries.map((summary) => {
      const detail = getDemoReviewCaseDetail(summary.caseId, scenarioId);
      return { detail, summary };
    });
    const summaries = allSummaries;
    const cases = detailPairs.flatMap(({ detail }) => (detail ? [detail] : []));
    const unavailableCaseCount = allSummaries.length - cases.length;

    const firstUnresolved = detailPairs.find(
      ({ detail, summary }) => detail && summary.status === "unresolved",
    )?.summary ?? detailPairs.find(({ detail }) => detail)?.summary;
    const payload = {
      actorName: session.actor.name,
      allowedCapabilities: [...session.allowedCapabilities],
      cases,
      initialSelectedCaseId: firstUnresolved?.caseId ?? null,
      role: session.role,
      summaries,
      tenant: session.activeTenant,
      unavailableCaseCount,
    };

    return {
      payload,
      status: summaries.length === 0 ? "empty" : unavailableCaseCount > 0 ? "partial" : "loaded",
    };
  } catch {
    return {
      code: "load_failed",
      message: "Review demo data could not be loaded.",
      status: "error",
    };
  }
}
