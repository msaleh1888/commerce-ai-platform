import { getDemoDashboardSummary } from "@/features/demo-data/adapters/dashboard";
import type { DemoRole, DemoSessionView, DemoStatus } from "@/features/demo-data/contracts";

export type ShellSessionView = DemoSessionView;
export type ShellRole = DemoRole;

export type ShellProcessingIndicator = {
  readonly label: string;
  readonly detail: string;
  readonly status: DemoStatus;
};

export type ShellDemoContext = {
  readonly session: DemoSessionView;
  readonly processingIndicator: ShellProcessingIndicator;
};

export function getShellDemoContext(): ShellDemoContext {
  const summary = getDemoDashboardSummary("northstar-retail");
  const processingStage =
    summary.pipelineStages.find((stage) => stage.status === "processing") ??
    summary.pipelineStages.find((stage) => stage.status === "review_required") ??
    summary.pipelineStages[0];

  return {
    session: summary.session,
    processingIndicator: {
      label: processingStage.label,
      detail: `${processingStage.processedCount.toLocaleString()} processed / ${processingStage.issueCount.toLocaleString()} issues`,
      status: processingStage.status,
    },
  };
}
