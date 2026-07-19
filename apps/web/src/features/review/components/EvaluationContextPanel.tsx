import { StatusBadge } from "@/components/ui";
import type { ReviewCaseViewModel } from "../schemas/view-model";

export function EvaluationContextPanel({ reviewCase }: { readonly reviewCase: ReviewCaseViewModel }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-raised px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-text-primary">Evaluation context</h2>
        <StatusBadge tone="inactive">Demo context</StatusBadge>
      </div>
      <p className="mt-2 text-sm text-text-secondary">{reviewCase.evaluationContext.label}</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <Id label="Run ID" value={reviewCase.evaluationContext.runId} />
        <Id label="Manifest ID" value={reviewCase.evaluationContext.manifestId} />
        <Id label="Configuration ID" value={reviewCase.evaluationContext.configurationId} />
      </dl>
      <ul className="mt-3 grid gap-2 text-sm text-text-secondary">
        {reviewCase.evaluationContext.metricNotes.map((note) => (
          <li className="break-words" key={note}>{note}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-text-muted">
        Demo evaluation context for frontend prototyping; not a verified production measurement.
      </p>
    </section>
  );
}

function Id({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="break-all font-mono text-xs text-text-secondary">{value}</dd>
    </div>
  );
}
