import type { ReviewCaseViewModel } from "../schemas/view-model";

export function AuditPreview({ reviewCase }: { readonly reviewCase: ReviewCaseViewModel }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-raised px-4 py-4">
      <h2 className="text-base font-semibold text-text-primary">Audit preview</h2>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs text-text-muted">Proposed action</dt>
          <dd className="break-words font-medium text-text-primary">{reviewCase.auditPreview.action}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-text-muted">Target</dt>
          <dd className="break-all font-mono text-xs text-text-secondary">{reviewCase.auditPreview.target}</dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-xs text-text-muted">Metadata</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {reviewCase.auditPreview.metadata.map((item) => (
              <span className="break-words rounded-sm border border-border bg-surface-subtle px-2 py-1 text-xs text-text-secondary" key={item}>
                {item}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </section>
  );
}
