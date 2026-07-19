import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { StatusBadge } from "@/components/ui";
import type { ReviewCaseViewModel } from "../schemas/view-model";

export function RecommendationPanel({ reviewCase }: { readonly reviewCase: ReviewCaseViewModel }) {
  return (
    <section className="min-w-0 rounded-lg border border-accent/20 bg-accent-soft px-4 py-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-primary">Recommended proposal</h2>
          <p className="mt-1 break-words text-sm text-text-secondary">
            {reviewCase.proposalLabel}: strong evidence with {reviewCase.conflictCount} conflicts requiring human review.
          </p>
        </div>
        <StatusBadge tone="processing">{reviewCase.confidenceLabel} confidence</StatusBadge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex min-w-0 gap-2 rounded-md border border-border bg-surface-raised px-3 py-2">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-status-ready" size={16} />
          <p className="text-sm text-text-secondary">{reviewCase.supportingSignalCount} supporting matching signals</p>
        </div>
        <div className="flex min-w-0 gap-2 rounded-md border border-border bg-surface-raised px-3 py-2">
          <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-status-review" size={16} />
          <p className="text-sm text-text-secondary">{reviewCase.conflictCount} conflicts remain before approval</p>
        </div>
      </div>
    </section>
  );
}
