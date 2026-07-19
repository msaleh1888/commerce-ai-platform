"use client";

import { StatusBadge } from "@/components/ui";
import type { ReviewQueueRowViewModel } from "../schemas/view-model";

const riskTone = {
  high: "failed",
  low: "inactive",
  medium: "review",
} as const;

export function ReviewQueue({
  onSelectCase,
  rows,
  selectedCaseId,
}: {
  readonly onSelectCase: (caseId: string) => void;
  readonly rows: readonly ReviewQueueRowViewModel[];
  readonly selectedCaseId: string;
}) {
  return (
    <section aria-label="Duplicate review queue" className="min-w-0 rounded-lg border border-border bg-surface-raised">
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Review queue</h2>
            <p className="mt-1 text-xs text-text-muted">Tenant-scoped duplicate candidates</p>
          </div>
          {rows.some((row) => row.detailAvailability === "unavailable") && (
            <StatusBadge tone="review">Evidence unavailable</StatusBadge>
          )}
        </div>
      </header>
      <ul aria-label="Review cases" className="divide-y divide-border">
        {rows.map((row) => {
          const selected = row.caseId === selectedCaseId;
          const unavailable = row.detailAvailability === "unavailable";

          return (
            <li key={row.caseId}>
              <button
                aria-current={selected ? "true" : undefined}
                aria-describedby={unavailable ? `${row.caseId}-availability` : undefined}
                className={[
                  "flex w-full min-w-0 flex-col gap-2 px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted",
                  selected ? "bg-surface-selected" : "hover:bg-surface-subtle",
                ].join(" ")}
                disabled={unavailable}
                onClick={() => onSelectCase(row.caseId)}
                type="button"
              >
                <span className="flex min-w-0 items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-semibold text-text-primary">{row.title}</span>
                    <span className="mt-1 block break-all text-xs text-text-muted">{row.caseId}</span>
                  </span>
                  <StatusBadge tone={riskTone[row.risk]}>{row.risk} risk</StatusBadge>
                </span>
                <span className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-1 text-xs text-text-muted">
                  <span className="break-words">{row.sourceSupplier}</span>
                  <span>{row.proposalLabel}</span>
                  <span>{row.confidenceLabel} confidence</span>
                  <span>{row.age} open</span>
                  <span className="break-words">Assignee: {row.assignee}</span>
                  <span>Status: {row.status}</span>
                  {unavailable && (
                    <span className="col-span-2" id={`${row.caseId}-availability`}>
                      Evidence unavailable - source detail recovery required
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
