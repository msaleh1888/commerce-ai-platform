import type { DemoSessionView } from "@/features/demo-data/contracts";

import type { DashboardFeatureState } from "../schemas/view-model";

export function createDashboardLoadingState(session: DemoSessionView): DashboardFeatureState {
  return {
    kind: "loading",
    tenantName: session.activeTenant.name,
  };
}

export const dashboardDeniedStateFixture: DashboardFeatureState = {
  kind: "permission_denied",
  tenantName: "Northstar Retail",
  message:
    "The dashboard adapter returned a permission-denied state. The browser role display did not make this authorization decision.",
};
