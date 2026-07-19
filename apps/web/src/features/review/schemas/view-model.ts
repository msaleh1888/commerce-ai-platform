import type {
  ApprovalContextView,
  AuditPreviewView,
  DemoActionResult,
  EvaluationContextView,
  FieldComparisonView,
  MatchingSignalView,
  ProductProvenanceView,
  ProductRecordView,
  ReviewCaseDetail,
  ReviewCaseSummary,
} from "@/features/demo-data/contracts";
import type { CurrentTenantView } from "@/lib/auth";

export type ReviewDecision = "merge_duplicate" | "mark_variant" | "keep_separate" | "defer";

export type ComparisonStatus = "match" | "caution" | "blocking";

export type ReviewAdapterErrorCode = "unknown_tenant" | "load_failed" | "incomplete_case_detail";

export type ReviewAdapterResult =
  | { readonly status: "loaded"; readonly payload: ReviewAdapterPayload }
  | { readonly status: "partial"; readonly payload: ReviewAdapterPayload }
  | { readonly status: "empty"; readonly payload: ReviewAdapterPayload }
  | { readonly status: "error"; readonly code: ReviewAdapterErrorCode; readonly message: string };

export interface ReviewAdapterPayload {
  readonly actorName: string;
  readonly tenant: CurrentTenantView;
  readonly role: string;
  readonly allowedCapabilities: readonly string[];
  readonly summaries: readonly ReviewCaseSummary[];
  readonly cases: readonly ReviewCaseDetail[];
  readonly initialSelectedCaseId: string | null;
  readonly unavailableCaseCount: number;
}

export interface ReviewQueueRowViewModel extends ReviewCaseSummary {
  readonly proposalLabel: string;
  readonly confidenceLabel: string;
  readonly detailAvailability: "ready" | "unavailable";
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
  readonly role: string;
  readonly unresolvedCount: number;
  readonly queue: readonly ReviewQueueRowViewModel[];
  readonly casesById: Readonly<Record<string, ReviewCaseViewModel>>;
  readonly initialSelectedCaseId: string;
}

export type ReviewFeatureState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly workspace: ReviewWorkspaceViewModel }
  | { readonly kind: "partial_success"; readonly workspace: ReviewWorkspaceViewModel; readonly message: string }
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
