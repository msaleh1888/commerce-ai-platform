"use client";

import { CheckCircle2, GitMerge, Pause, ShieldCheck, Split, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Button, StatusBadge } from "@/components/ui";
import type { ReviewCaseViewModel, ReviewDecision } from "../schemas/view-model";

const decisions: Array<{
  readonly decision: ReviewDecision;
  readonly icon: ReactNode;
  readonly label: string;
}> = [
  { decision: "merge_duplicate", icon: <GitMerge size={15} />, label: "Approve merge" },
  { decision: "mark_variant", icon: <Split size={15} />, label: "Mark as variant" },
  { decision: "keep_separate", icon: <XCircle size={15} />, label: "Keep separate" },
  { decision: "defer", icon: <Pause size={15} />, label: "Defer" },
];

export function ApprovalPanel({
  onOpenDecision,
  reviewCase,
}: {
  readonly onOpenDecision: (decision: ReviewDecision) => void;
  readonly reviewCase: ReviewCaseViewModel;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-raised px-4 py-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="text-accent-deep" size={17} />
            <h2 className="text-base font-semibold text-text-primary">Human approval</h2>
          </div>
          <p className="mt-2 break-words text-sm text-text-secondary">{reviewCase.approvalContext.message}</p>
        </div>
        <StatusBadge tone={reviewCase.isApprovalAvailable ? "ready" : "review"}>
          {reviewCase.isApprovalAvailable ? "Eligible to approve" : "Approval not executable"}
        </StatusBadge>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs text-text-muted">Required capability</dt>
          <dd className="break-all font-mono text-xs text-text-secondary">{reviewCase.approvalContext.requiredCapability}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-text-muted">Operation ID</dt>
          <dd className="break-all font-mono text-xs text-text-secondary">{reviewCase.approvalContext.operationId}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Audit boundary</dt>
          <dd className="text-text-secondary">Preview only in M2</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {decisions.map((item) => {
          const disabled = item.decision === "merge_duplicate" && !reviewCase.isApprovalAvailable;

          return (
            <Button
              disabled={disabled}
              icon={item.icon}
              key={item.decision}
              onClick={() => onOpenDecision(item.decision)}
              variant={item.decision === "merge_duplicate" && reviewCase.isApprovalAvailable ? "primary" : "secondary"}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
      {!reviewCase.isApprovalAvailable && (
        <p className="mt-3 text-sm text-text-muted">
          The approval context remains visible, but this role cannot open an executable merge confirmation.
        </p>
      )}
    </section>
  );
}
