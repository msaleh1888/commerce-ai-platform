import type { DashboardStatusTone, DashboardViewModel } from "../schemas/view-model";

export type DashboardAttentionItem = {
  readonly detail: string;
  readonly label: string;
  readonly tone: DashboardStatusTone;
};

export type DashboardAttention = {
  readonly badgeLabel: string;
  readonly items: readonly DashboardAttentionItem[];
};

export function createDashboardAttention(viewModel: DashboardViewModel): DashboardAttention | null {
  const items: DashboardAttentionItem[] = [];
  const importException = viewModel.recentImports.find(
    (item) => item.partialSuccess || item.tone === "failed",
  );

  if (viewModel.reviewSummary.highRisk > 0) {
    items.push({
      detail: `${viewModel.reviewSummary.open} open cases; oldest case ${viewModel.reviewSummary.oldestOpenAge}.`,
      label: `${viewModel.reviewSummary.highRisk} high-risk duplicate reviews`,
      tone: "review",
    });
  }

  if (importException) {
    items.push({
      detail: importException.issueSummary ?? `${importException.source} needs follow-up.`,
      label: `${importException.rejectedRows} rejected rows from ${importException.supplierName}`,
      tone: importException.tone,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return {
    badgeLabel: viewModel.reviewSummary.highRisk > 0 ? "Human review required" : "Import correction required",
    items,
  };
}
