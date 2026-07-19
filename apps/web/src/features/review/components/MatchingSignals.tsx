import { StatusBadge } from "@/components/ui";
import type { ReviewCaseViewModel } from "../schemas/view-model";

const tone = {
  blocking: "failed",
  caution: "review",
  supporting: "ready",
} as const;

export function MatchingSignals({ reviewCase }: { readonly reviewCase: ReviewCaseViewModel }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-raised">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-text-primary">Matching signals</h2>
      </header>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        {reviewCase.signals.map((signal) => (
          <article className="min-w-0 rounded-md border border-border bg-surface-subtle px-3 py-3" key={signal.id}>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <h3 className="break-words text-sm font-semibold text-text-primary">{signal.label}</h3>
              <StatusBadge tone={tone[signal.weight]}>{signal.weight}</StatusBadge>
            </div>
            <p className="mt-1 break-words text-sm text-text-secondary">{signal.value}</p>
            <p className="mt-2 break-words text-xs text-text-muted">{signal.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
