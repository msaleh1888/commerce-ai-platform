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
        <h2 className="text-sm font-semibold text-text-primary">Review queue</h2>
        <p className="mt-1 text-xs text-text-muted">Tenant-scoped duplicate candidates</p>
      </header>
      <div className="divide-y divide-border" role="listbox" aria-label="Review cases">
        {rows.map((row) => {
          const selected = row.caseId === selectedCaseId;

          return (
            <button
              aria-selected={selected}
              className={[
                "flex w-full min-w-0 flex-col gap-2 px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                selected ? "bg-surface-selected" : "hover:bg-surface-subtle",
              ].join(" ")}
              key={row.caseId}
              onClick={() => onSelectCase(row.caseId)}
              role="option"
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
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
