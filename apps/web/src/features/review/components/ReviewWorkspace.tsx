"use client";

import { EmptyState, Panel, StatusBadge } from "@/components/ui";
import { useReviewWorkspace } from "../hooks/useReviewWorkspace";

import { ApprovalPanel } from "./ApprovalPanel";
import { AuditPreview } from "./AuditPreview";
import { EvaluationContextPanel } from "./EvaluationContextPanel";
import { FieldComparison } from "./FieldComparison";
import { MatchingSignals } from "./MatchingSignals";
import { ProvenancePanel } from "./ProvenancePanel";
import { RecommendationPanel } from "./RecommendationPanel";
import { RecordSummary } from "./RecordSummary";
import { ReviewCaseHeader } from "./ReviewCaseHeader";
import { ReviewDecisionDialog } from "./ReviewDecisionDialog";
import { ReviewQueue } from "./ReviewQueue";

export function ReviewWorkspace() {
  const review = useReviewWorkspace();

  if (review.state.kind === "loading") {
    return (
      <Panel description="Loading tenant-scoped duplicate-review data." title="Review queue">
        <p className="text-sm text-text-muted">Loading review cases.</p>
      </Panel>
    );
  }

  if (review.state.kind === "empty") {
    return <EmptyState description={review.state.message} title={review.state.title} />;
  }

  if (review.state.kind === "permission_denied") {
    return <EmptyState description={review.state.message} title={review.state.title} />;
  }

  if (review.state.kind === "error") {
    return <EmptyState description={review.state.message} title={review.state.title} />;
  }

  if (!review.interaction) {
    return (
      <Panel description="Preparing local interaction state." title="Review queue">
        <p className="text-sm text-text-muted">Loading review cases.</p>
      </Panel>
    );
  }

  const workspace = review.state.workspace;
  const selectedCase =
    workspace.casesById[review.interaction.selectedCaseId] ??
    workspace.casesById[workspace.initialSelectedCaseId];

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-surface-raised px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-text-primary">Review queue</h1>
          <p className="mt-1 break-words text-sm text-text-muted">
            {workspace.tenantName} / {workspace.role} / {workspace.unresolvedCount} unresolved cases
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="review">Selected {selectedCase.summary.caseId}</StatusBadge>
          <StatusBadge tone="inactive">Local prototype decisions only</StatusBadge>
        </div>
      </header>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(18rem,0.36fr)_minmax(0,0.64fr)]">
        <ReviewQueue
          onSelectCase={review.onSelectCase}
          rows={workspace.queue}
          selectedCaseId={review.interaction.selectedCaseId}
        />
        <section className="min-w-0 space-y-4" aria-label="Selected review case detail">
          <ReviewCaseHeader reviewCase={selectedCase} />
          <RecommendationPanel reviewCase={selectedCase} />
          <ApprovalPanel onOpenDecision={review.onOpenDecision} reviewCase={selectedCase} />
          {review.interaction.recordedDecision && (
            <div className="rounded-lg border border-status-ready/30 bg-status-surface-ready px-4 py-3">
              <p className="font-semibold text-text-primary">Recorded in this prototype</p>
              <p className="mt-1 break-words text-sm text-text-secondary">{review.interaction.recordedDecision.message}</p>
            </div>
          )}
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <RecordSummary label="Incoming supplier record" record={selectedCase.recordA} />
            <RecordSummary label="Existing canonical record" record={selectedCase.recordB} />
          </div>
          <MatchingSignals reviewCase={selectedCase} />
          <FieldComparison reviewCase={selectedCase} />
          <ProvenancePanel reviewCase={selectedCase} />
          <AuditPreview reviewCase={selectedCase} />
          <EvaluationContextPanel reviewCase={selectedCase} />
        </section>
      </div>
      <ReviewDecisionDialog
        decision={review.interaction.pendingDecision}
        onCancel={review.onCancelDecision}
        onConfirm={review.onConfirmDecision}
        reviewCase={selectedCase}
      />
    </div>
  );
}
