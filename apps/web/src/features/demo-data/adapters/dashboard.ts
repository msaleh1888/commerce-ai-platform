import type { DashboardSummary, DemoScenarioId } from "../contracts";
import { acmeOutletScenario } from "../scenarios/acme-outlet";
import { northstarRetailScenario } from "../scenarios/northstar-retail";

const dashboardScenarios = {
  "northstar-retail": northstarRetailScenario,
  "acme-outlet": acmeOutletScenario,
} as const;

export function getDemoDashboardSummary(
  scenarioId: DemoScenarioId = "northstar-retail",
): DashboardSummary {
  const scenario = dashboardScenarios[scenarioId];

  return structuredClone({
    session: scenario.session,
    ...scenario.dashboard,
  });
}
