import { StatusBadge } from "@/components/ui";
import type { ReviewCaseViewModel } from "../schemas/view-model";

const riskTone = {
  high: "failed",
  low: "inactive",
  medium: "review",
} as const;

export function ReviewCaseHeader({ reviewCase }: { readonly reviewCase: ReviewCaseViewModel }) {
  return (
    <header className="min-w-0 rounded-lg border border-border bg-surface-raised px-4 py-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-text-muted">Selected case</p>
          <h1 className="mt-1 break-words text-xl font-semibold text-text-primary">{reviewCase.summary.title}</h1>
          <p className="mt-1 break-all text-xs text-text-muted">{reviewCase.summary.caseId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={riskTone[reviewCase.summary.risk]}>{reviewCase.summary.risk} risk</StatusBadge>
          <StatusBadge tone="review">{reviewCase.summary.status}</StatusBadge>
          <StatusBadge tone="processing">{reviewCase.confidenceLabel} confidence</StatusBadge>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-xs text-text-muted">Supplier/import</dt>
          <dd className="break-words font-medium text-text-primary">
            {reviewCase.summary.sourceSupplier} / {reviewCase.summary.sourceImportId}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Age</dt>
          <dd className="font-medium text-text-primary">{reviewCase.summary.age}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Assignee</dt>
          <dd className="font-medium text-text-primary">{reviewCase.summary.assignee}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Recommended action</dt>
          <dd className="font-medium text-text-primary">{reviewCase.proposalLabel}</dd>
        </div>
      </dl>
    </header>
  );
}
