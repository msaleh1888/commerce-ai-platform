import { getDemoDashboardSummary } from "@/features/demo-data/adapters/dashboard";
import type {
  DashboardSummary,
  DemoScenarioId,
  DemoSessionView,
} from "@/features/demo-data/contracts";

export type DashboardTenantMapping =
  | { readonly kind: "mapped"; readonly scenarioId: DemoScenarioId }
  | {
      readonly kind: "unknown_tenant";
      readonly tenantId: string;
      readonly message: string;
    };

export function mapDashboardTenantToScenario(tenantId: string): DashboardTenantMapping {
  if (tenantId === "tenant_northstar_retail") {
    return { kind: "mapped", scenarioId: "northstar-retail" };
  }

  if (tenantId === "tenant_acme_outlet") {
    return { kind: "mapped", scenarioId: "acme-outlet" };
  }

  return {
    kind: "unknown_tenant",
    tenantId,
    message: `No dashboard demo scenario is configured for tenant ${tenantId}.`,
  };
}

export type DashboardAdapterResult =
  | { readonly kind: "ready"; readonly summary: DashboardSummary }
  | {
      readonly kind: "error";
      readonly code: "unknown_tenant";
      readonly tenantId: string;
      readonly message: string;
    };

export async function loadDashboardSummaryForSession(
  session: DemoSessionView,
): Promise<DashboardAdapterResult> {
  const mapping = mapDashboardTenantToScenario(session.activeTenant.id);

  if (mapping.kind === "unknown_tenant") {
    return {
      kind: "error",
      code: "unknown_tenant",
      tenantId: mapping.tenantId,
      message: mapping.message,
    };
  }

  return {
    kind: "ready",
    summary: getDemoDashboardSummary(mapping.scenarioId),
  };
}
