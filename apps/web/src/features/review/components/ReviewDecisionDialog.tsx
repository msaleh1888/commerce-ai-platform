"use client";

import { Button, Dialog } from "@/components/ui";
import type { ReviewCaseViewModel, ReviewDecision } from "../schemas/view-model";
import { formatProposalLabel } from "../state/review-state";

export function ReviewDecisionDialog({
  decision,
  onCancel,
  onConfirm,
  reviewCase,
}: {
  readonly decision: ReviewDecision | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly reviewCase: ReviewCaseViewModel;
}) {
  const label = decision ? formatProposalLabel(decision) : "";

  return (
    <Dialog
      actions={
        <>
          <Button onClick={onCancel} variant="secondary">Cancel</Button>
          <Button onClick={onConfirm} variant="primary">Record local decision</Button>
        </>
      }
      description="This confirmation records local UI state only and does not change catalog data."
      onClose={onCancel}
      open={decision !== null}
      title={label}
    >
      <dl className="grid gap-3">
        <div>
          <dt className="text-xs text-text-muted">Proposed outcome</dt>
          <dd className="font-medium text-text-primary">{label}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-text-muted">Target record</dt>
          <dd className="break-all font-mono text-xs text-text-secondary">{reviewCase.auditPreview.target}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-text-muted">Operation ID</dt>
          <dd className="break-all font-mono text-xs text-text-secondary">{reviewCase.approvalContext.operationId}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Audit preview</dt>
          <dd className="break-words text-text-secondary">{reviewCase.auditPreview.action}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Prototype limitation</dt>
          <dd className="break-words text-text-secondary">
            The fixture remains unresolved; no FastAPI call, browser storage write, audit event, or catalog mutation occurs.
          </dd>
        </div>
      </dl>
    </Dialog>
  );
}
