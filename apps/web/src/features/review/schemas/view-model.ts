import type {
  ApprovalContextView,
  AuditPreviewView,
  DemoActionResult,
  DemoCapability,
  DemoRole,
  DemoSessionView,
  DemoTenantView,
  EvaluationContextView,
  FieldComparisonView,
  MatchingSignalView,
  ProductProvenanceView,
  ProductRecordView,
  ReviewCaseDetail,
  ReviewCaseSummary,
} from "@/features/demo-data/contracts";

export type ReviewDecision = "merge_duplicate" | "mark_variant" | "keep_separate" | "defer";

export type ComparisonStatus = "match" | "caution" | "blocking";

export type ReviewAdapterErrorCode = "unknown_tenant" | "load_failed";

export type ReviewAdapterResult =
  | { readonly status: "loaded"; readonly payload: ReviewAdapterPayload }
  | { readonly status: "empty"; readonly payload: ReviewAdapterPayload }
  | { readonly status: "error"; readonly code: ReviewAdapterErrorCode; readonly message: string };

export interface ReviewAdapterPayload {
  readonly actor: DemoSessionView["actor"];
  readonly tenant: DemoTenantView;
  readonly role: DemoRole;
  readonly allowedCapabilities: readonly DemoCapability[];
  readonly summaries: readonly ReviewCaseSummary[];
  readonly cases: readonly ReviewCaseDetail[];
  readonly initialSelectedCaseId: string | null;
}

export interface ReviewQueueRowViewModel extends ReviewCaseSummary {
  readonly proposalLabel: string;
  readonly confidenceLabel: string;
}

export interface ReviewComparisonRowViewModel extends FieldComparisonView {
  readonly status: ComparisonStatus;
  readonly statusLabel: string;
}

export interface ReviewCaseViewModel {
  readonly summary: ReviewCaseSummary;
  readonly proposalLabel: string;
  readonly confidenceLabel: string;
  readonly supportingSignalCount: number;
  readonly conflictCount: number;
  readonly recordA: ProductRecordView;
  readonly recordB: ProductRecordView;
  readonly provenance: readonly ProductProvenanceView[];
  readonly comparison: readonly ReviewComparisonRowViewModel[];
  readonly conflicts: ReviewCaseDetail["conflicts"];
  readonly signals: readonly MatchingSignalView[];
  readonly approvalContext: ApprovalContextView;
  readonly auditPreview: AuditPreviewView;
  readonly evaluationContext: EvaluationContextView;
  readonly isApprovalAvailable: boolean;
}

export interface ReviewWorkspaceViewModel {
  readonly actorName: string;
  readonly tenantName: string;
  readonly tenantSlug: string;
  readonly role: DemoRole;
  readonly unresolvedCount: number;
  readonly queue: readonly ReviewQueueRowViewModel[];
  readonly casesById: Readonly<Record<string, ReviewCaseViewModel>>;
  readonly initialSelectedCaseId: string;
}

export type ReviewFeatureState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly workspace: ReviewWorkspaceViewModel }
  | { readonly kind: "empty"; readonly title: string; readonly message: string }
  | { readonly kind: "permission_denied"; readonly title: string; readonly message: string }
  | {
      readonly kind: "error";
      readonly code: ReviewAdapterErrorCode;
      readonly title: string;
      readonly message: string;
    };

export interface ReviewInteractionState {
  readonly selectedCaseId: string;
  readonly pendingDecision: ReviewDecision | null;
  readonly recordedDecision: DemoActionResult | null;
}
