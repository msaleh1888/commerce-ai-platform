import type { CurrentSessionView } from "@/lib/auth";

import type { DashboardAdapterResult } from "../api";
import type { DashboardFeatureState } from "../schemas/view-model";

export function createDashboardLoadingState(session: CurrentSessionView): DashboardFeatureState {
  return {
    kind: "loading",
    tenantName: session.activeTenant.name,
  };
}

export const dashboardDeniedAdapterFixture: DashboardAdapterResult = {
  kind: "permission_denied",
  tenantName: "Northstar Retail",
  message:
    "The dashboard adapter returned a permission-denied state. The browser role display did not make this authorization decision.",
};
