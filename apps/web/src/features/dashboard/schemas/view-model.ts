import type {
  AuditEventSummary,
  DashboardMetricCard,
  DashboardSummary,
  DemoStatus,
  EvaluationMetricSummary,
  ImportSummary,
  PipelineStageSummary,
  ReviewQueueSummary,
} from "@/features/demo-data/contracts";

export type DashboardStatusTone = "processing" | "ready" | "review" | "failed" | "inactive";

export type DashboardMetricViewModel = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly status: DemoStatus;
  readonly statusLabel: string;
  readonly tone: DashboardStatusTone;
  readonly sourceContext: string;
  readonly trendLabel?: string;
  readonly urgent: boolean;
};

export type PipelineStageViewModel = {
  readonly id: string;
  readonly label: string;
  readonly statusLabel: string;
  readonly tone: DashboardStatusTone;
  readonly processedCount: string;
  readonly issueCount: string;
  readonly hasException: boolean;
};

export type ImportViewModel = {
  readonly id: string;
  readonly source: string;
  readonly supplierName: string;
  readonly statusLabel: string;
  readonly tone: DashboardStatusTone;
  readonly submittedAt: string;
  readonly completedAt: string;
  readonly totalRows: string;
  readonly acceptedRows: string;
  readonly normalizedRows: string;
  readonly rejectedRows: string;
  readonly reviewCandidates: string;
  readonly searchableLabel: string;
  readonly issueSummary?: string;
  readonly partialSuccess: boolean;
};

export type ReviewSummaryViewModel = ReviewQueueSummary & {
  readonly hasUrgentWork: boolean;
};

export type EvaluationMetricViewModel = EvaluationMetricSummary & {
  readonly deltaTone: DashboardStatusTone;
};

export type EvaluationViewModel = {
  readonly manifestId: string;
  readonly runId: string;
  readonly configurationId: string;
  readonly evaluatedAt: string;
  readonly metrics: readonly EvaluationMetricViewModel[];
  readonly baselineComparison: string;
  readonly demoDataNotice: string;
};

export type AuditEventViewModel = AuditEventSummary & {
  readonly occurredAt: string;
  readonly metadataSummary: string;
};

export type DashboardViewModel = {
  readonly tenantName: string;
  readonly tenantSlug: string;
  readonly actorName: string;
  readonly roleLabel: string;
  readonly metrics: readonly DashboardMetricViewModel[];
  readonly pipelineStages: readonly PipelineStageViewModel[];
  readonly recentImports: readonly ImportViewModel[];
  readonly reviewSummary: ReviewSummaryViewModel;
  readonly evaluation: EvaluationViewModel;
  readonly auditEvents: readonly AuditEventViewModel[];
  readonly hasPartialSuccess: boolean;
};

export type DashboardFeatureState =
  | { readonly kind: "loading"; readonly tenantName: string }
  | { readonly kind: "ready"; readonly viewModel: DashboardViewModel }
  | { readonly kind: "empty"; readonly tenantName: string; readonly message: string }
  | {
      readonly kind: "error";
      readonly title: string;
      readonly message: string;
      readonly code: "unknown_tenant" | "load_failed";
    }
  | {
      readonly kind: "permission_denied";
      readonly tenantName: string;
      readonly message: string;
    };

const statusLabel: Record<DemoStatus, string> = {
  failed: "Failed",
  inactive: "Inactive",
  partial_success: "Partial success",
  processing: "Processing",
  ready: "Ready",
  review_required: "Review required",
};

const statusTone: Record<DemoStatus, DashboardStatusTone> = {
  failed: "failed",
  inactive: "inactive",
  partial_success: "review",
  processing: "processing",
  ready: "ready",
  review_required: "review",
};

const importStatus: Record<ImportSummary["status"], { label: string; tone: DashboardStatusTone }> = {
  failed: { label: "Failed", tone: "failed" },
  indexed: { label: "Ready", tone: "ready" },
  partial_success: { label: "Partial success", tone: "review" },
  processing: { label: "Processing", tone: "processing" },
  queued: { label: "Processing", tone: "processing" },
};

const searchableLabel: Record<ImportSummary["searchableState"], string> = {
  blocked: "Blocked",
  not_searchable: "Not searchable",
  partially_searchable: "Partially searchable",
  searchable: "Searchable",
};

const roleLabel: Record<DashboardSummary["session"]["role"], string> = {
  administrator: "Administrator",
  ai_engineer: "AI Engineer",
  catalog_manager: "Catalog Manager",
  merchandiser: "Merchandiser",
  viewer: "Viewer",
};

export function createDashboardReadyState(summary: DashboardSummary): DashboardFeatureState {
  const hasNoWork =
    summary.recentImports.length === 0 &&
    summary.reviewSummary.open === 0 &&
    summary.auditEvents.length === 0;

  if (hasNoWork) {
    return {
      kind: "empty",
      tenantName: summary.session.activeTenant.name,
      message:
        "No imports, review cases, or audit events are available for this active tenant in the deterministic demo data.",
    };
  }

  return {
    kind: "ready",
    viewModel: mapDashboardSummaryToViewModel(summary),
  };
}

export function mapDashboardSummaryToViewModel(summary: DashboardSummary): DashboardViewModel {
  return {
    tenantName: summary.session.activeTenant.name,
    tenantSlug: summary.session.activeTenant.slug,
    actorName: summary.session.actor.name,
    roleLabel: roleLabel[summary.session.role],
    metrics: summary.metricCards.map(mapMetric),
    pipelineStages: summary.pipelineStages.map(mapPipelineStage),
    recentImports: summary.recentImports.map(mapImport),
    reviewSummary: {
      ...summary.reviewSummary,
      hasUrgentWork: summary.reviewSummary.highRisk > 0,
    },
    evaluation: {
      manifestId: summary.evaluationSummary.manifestId,
      runId: summary.evaluationSummary.runId,
      configurationId: summary.evaluationSummary.configurationId,
      evaluatedAt: formatIso(summary.evaluationSummary.evaluatedAt),
      metrics: summary.evaluationSummary.metrics.map((metric) => ({
        ...metric,
        deltaTone: metric.delta.startsWith("-") ? "failed" : "ready",
      })),
      baselineComparison: summary.evaluationSummary.baselineComparison,
      demoDataNotice: summary.evaluationSummary.demoDataNotice,
    },
    auditEvents: summary.auditEvents.map((event) => ({
      ...event,
      occurredAt: formatIso(event.timestamp),
      metadataSummary: event.metadata.join("; "),
    })),
    hasPartialSuccess:
      summary.metricCards.some((metric) => metric.status === "partial_success") ||
      summary.pipelineStages.some((stage) => stage.status === "partial_success") ||
      summary.recentImports.some((item) => item.status === "partial_success"),
  };
}

function mapMetric(metric: DashboardMetricCard): DashboardMetricViewModel {
  return {
    id: metric.id,
    label: metric.id.includes("search_quality") ? "Search-quality summary" : metric.label,
    value: metric.value,
    status: metric.status,
    statusLabel: metric.id.includes("search_quality")
      ? `Demo evaluation - ${statusLabel[metric.status]}`
      : statusLabel[metric.status],
    tone: statusTone[metric.status],
    sourceContext: metric.sourceContext,
    trendLabel: metric.trendLabel,
    urgent: metric.status === "review_required" && metric.id.includes("review"),
  };
}

function mapPipelineStage(stage: PipelineStageSummary): PipelineStageViewModel {
  return {
    id: stage.id,
    label: stage.label,
    statusLabel: statusLabel[stage.status],
    tone: statusTone[stage.status],
    processedCount: stage.processedCount.toLocaleString("en-US"),
    issueCount: stage.issueCount.toLocaleString("en-US"),
    hasException:
      stage.status === "review_required" ||
      stage.status === "partial_success" ||
      stage.status === "failed",
  };
}

function mapImport(item: ImportSummary): ImportViewModel {
  const status = importStatus[item.status];

  return {
    id: item.id,
    source: item.source,
    supplierName: item.supplierName,
    statusLabel: status.label,
    tone: status.tone,
    submittedAt: formatIso(item.submittedAt),
    completedAt: item.completedAt ? formatIso(item.completedAt) : "Not completed",
    totalRows: item.rowCounts.total.toLocaleString("en-US"),
    acceptedRows: item.rowCounts.accepted.toLocaleString("en-US"),
    normalizedRows: item.rowCounts.normalized.toLocaleString("en-US"),
    rejectedRows: item.rowCounts.rejected.toLocaleString("en-US"),
    reviewCandidates: item.rowCounts.reviewCandidates.toLocaleString("en-US"),
    searchableLabel: searchableLabel[item.searchableState],
    issueSummary: item.failureSummary,
    partialSuccess: item.status === "partial_success",
  };
}

function formatIso(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}
