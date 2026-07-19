import type { ReviewCaseViewModel } from "../schemas/view-model";

export function ProvenancePanel({ reviewCase }: { readonly reviewCase: ReviewCaseViewModel }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-raised">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-text-primary">Provenance</h2>
      </header>
      <div className="divide-y divide-border">
        {reviewCase.provenance.map((item) => (
          <dl className="grid min-w-0 gap-2 px-4 py-3 text-sm sm:grid-cols-5" key={`${item.field}-${item.sourceImportId}-${item.sourceRow}`}>
            <div className="min-w-0">
              <dt className="text-xs text-text-muted">Field</dt>
              <dd className="break-words font-medium text-text-primary">{item.field}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-text-muted">Supplier</dt>
              <dd className="break-words text-text-secondary">{item.source}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-text-muted">Import ID</dt>
              <dd className="break-all font-mono text-xs text-text-secondary">{item.sourceImportId}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Source row</dt>
              <dd className="text-text-secondary">{item.sourceRow}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-text-muted">Observed time</dt>
              <dd className="break-words text-text-secondary">{item.observedAt}</dd>
            </div>
          </dl>
        ))}
      </div>
    </section>
  );
}
