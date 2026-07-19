import type { DashboardAdapterResult } from "../api";
import {
  createDashboardReadyState,
  type DashboardFeatureState,
} from "../schemas/view-model";

export function createDashboardStateFromAdapterResult(
  result: DashboardAdapterResult,
): DashboardFeatureState {
  if (result.kind === "ready") {
    return createDashboardReadyState(result.summary);
  }

  if (result.kind === "permission_denied") {
    return {
      kind: "permission_denied",
      tenantName: result.tenantName,
      message: result.message,
    };
  }

  return {
    kind: "error",
    code: result.code,
    title: "Dashboard data unavailable",
    message: result.message,
  };
}

export function createDashboardLoadFailedState(): DashboardFeatureState {
  return {
    kind: "error",
    code: "load_failed",
    title: "Dashboard data unavailable",
    message:
      "The dashboard demo adapter could not load this tenant summary. Retry only reloads local dashboard state.",
  };
}
