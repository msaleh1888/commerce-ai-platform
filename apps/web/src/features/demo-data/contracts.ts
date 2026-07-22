export type DemoTenantId = "tenant_northstar_retail" | "tenant_acme_outlet";

export type DemoScenarioId = "northstar-retail" | "acme-outlet";

export type DemoRole =
  | "administrator"
  | "catalog_manager"
  | "merchandiser"
  | "ai_engineer"
  | "viewer";

export type DemoCapability =
  | "catalog.import:create"
  | "catalog.import:read"
  | "catalog.product:read"
  | "catalog.review:read"
  | "catalog.review:decide"
  | "catalog.approval:execute"
  | "evaluation.run:read"
  | "audit.event:read"
  | "tenant.member:manage";

export interface DemoActorView {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface DemoTenantView {
  readonly id: DemoTenantId;
  readonly name: string;
  readonly slug: string;
}

export interface DemoMembershipView {
  readonly tenant: DemoTenantView;
  readonly role: DemoRole;
  readonly allowedCapabilities: readonly DemoCapability[];
}

export interface DemoSessionView {
  readonly actor: DemoActorView;
  readonly activeTenant: DemoTenantView;
  readonly memberships: readonly DemoMembershipView[];
  readonly role: DemoRole;
  readonly allowedCapabilities: readonly DemoCapability[];
}

export type DemoStatus =
  | "ready"
  | "processing"
  | "review_required"
  | "partial_success"
  | "failed"
  | "inactive";

export interface DashboardMetricCard {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly status: DemoStatus;
  readonly sourceContext: string;
  readonly trendLabel?: string;
}

export interface ImportRowCounts {
  readonly total: number;
  readonly accepted: number;
  readonly normalized: number;
  readonly rejected: number;
  readonly reviewCandidates: number;
}

export interface ImportSummary {
  readonly id: string;
  readonly source: string;
  readonly supplierName: string;
  readonly status: "queued" | "processing" | "indexed" | "partial_success" | "failed";
  readonly submittedAt: string;
  readonly completedAt?: string;
  readonly rowCounts: ImportRowCounts;
  readonly searchableState:
    | "not_searchable"
    | "partially_searchable"
    | "searchable"
    | "blocked";
  readonly failureSummary?: string;
}

export interface PipelineStageSummary {
  readonly id: string;
  readonly label: string;
  readonly status: DemoStatus;
  readonly processedCount: number;
  readonly issueCount: number;
}

export interface FeedHealthSummary {
  readonly id: string;
  readonly source: string;
  readonly status: DemoStatus;
  readonly lastReceivedAt: string;
  readonly detail: string;
}

export interface ReviewQueueSummary {
  readonly open: number;
  readonly highRisk: number;
  readonly assignedToMe: number;
  readonly oldestOpenAge: string;
}

export interface ReviewCaseSummary {
  readonly caseId: string;
  readonly tenantId: DemoTenantId;
  readonly status: "unresolved" | "approved" | "deferred" | "kept_separate" | "variant";
  readonly risk: "low" | "medium" | "high";
  readonly proposal: "merge_duplicate" | "mark_variant" | "keep_separate" | "defer";
  readonly confidence: number;
  readonly reasonCodes: readonly string[];
  readonly sourceImportId: string;
  readonly sourceSupplier: string;
  readonly age: string;
  readonly assignee: string;
  readonly title: string;
}

export interface ProductRecordView {
  readonly id: string;
  readonly supplier: string;
  readonly supplierSku: string;
  readonly title: string;
  readonly brand: string;
  readonly category: string;
  readonly gtin: string;
  readonly manufacturerPartNumber: string;
  readonly price: number;
  readonly currency: "USD";
  readonly color?: string;
  readonly capacity?: string;
  readonly connectivity?: string;
  readonly sourceImportId: string;
}

export interface ProductProvenanceView {
  readonly field: string;
  readonly source: string;
  readonly sourceImportId: string;
  readonly sourceRow: number;
  readonly observedAt: string;
}

export interface FieldComparisonView {
  readonly field: string;
  readonly rawValue: string;
  readonly normalizedValue: string;
  readonly canonicalValue: string;
}

export interface ConflictView {
  readonly field: string;
  readonly recordAValue: string;
  readonly recordBValue: string;
  readonly severity: "low" | "medium" | "high";
  readonly note: string;
}

export interface MatchingSignalView {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly weight: "supporting" | "caution" | "blocking";
  readonly explanation: string;
}

export interface ApprovalContextView {
  readonly required: true;
  readonly operationId: string;
  readonly requiredCapability: Extract<DemoCapability, "catalog.approval:execute">;
  readonly allowedForCurrentRole: boolean;
  readonly message: string;
}

export interface AuditPreviewView {
  readonly action: string;
  readonly target: string;
  readonly metadata: readonly string[];
}

export interface EvaluationContextView {
  readonly label: string;
  readonly runId: string;
  readonly manifestId: string;
  readonly configurationId: string;
  readonly status: "demo_data";
  readonly metricNotes: readonly string[];
}

export interface ReviewCaseDetail {
  readonly summary: ReviewCaseSummary;
  readonly recordA: ProductRecordView;
  readonly recordB: ProductRecordView;
  readonly provenance: readonly ProductProvenanceView[];
  readonly rawNormalizedCanonical: readonly FieldComparisonView[];
  readonly conflicts: readonly ConflictView[];
  readonly signals: readonly MatchingSignalView[];
  readonly approvalContext: ApprovalContextView;
  readonly auditPreview: AuditPreviewView;
  readonly evaluationContext: EvaluationContextView;
}

export interface EvaluationMetricSummary {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly baselineValue: string;
  readonly delta: string;
}

export interface EvaluationSummary {
  readonly manifestId: string;
  readonly runId: string;
  readonly configurationId: string;
  readonly status: "demo_data";
  readonly evaluatedAt: string;
  readonly metrics: readonly EvaluationMetricSummary[];
  readonly baselineComparison: string;
  readonly demoDataNotice: string;
}

export interface AuditEventSummary {
  readonly id: string;
  readonly timestamp: string;
  readonly actor: string;
  readonly tenant: DemoTenantView;
  readonly action: string;
  readonly target: string;
  readonly metadata: readonly string[];
}

export interface DashboardSummary {
  readonly session: DemoSessionView;
  readonly metricCards: readonly DashboardMetricCard[];
  readonly recentImports: readonly ImportSummary[];
  readonly feedHealth: readonly FeedHealthSummary[];
  readonly pipelineStages: readonly PipelineStageSummary[];
  readonly reviewSummary: ReviewQueueSummary;
  readonly reviewCases: readonly ReviewCaseSummary[];
  readonly evaluationSummary: EvaluationSummary;
  readonly auditEvents: readonly AuditEventSummary[];
}

export interface DemoScenarioData {
  readonly id: DemoScenarioId;
  readonly session: DemoSessionView;
  readonly dashboard: Omit<DashboardSummary, "session">;
  readonly reviewCases: readonly ReviewCaseDetail[];
}

export interface DemoActionResult {
  readonly mode: "demo";
  readonly status: "recorded_locally";
  readonly caseId: string;
  readonly message: string;
}
