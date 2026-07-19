import { StatusBadge } from "@/components/ui";
import type { ReviewCaseViewModel } from "../schemas/view-model";

const tone = {
  blocking: "failed",
  caution: "review",
  match: "ready",
} as const;

export function FieldComparison({ reviewCase }: { readonly reviewCase: ReviewCaseViewModel }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-raised">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-text-primary">Raw/normalized/canonical comparison</h2>
      </header>
      <div className="hidden overflow-x-auto md:block">
        <table aria-label="Field comparison" className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-surface-subtle text-xs font-semibold uppercase text-text-muted">
            <tr>
              {["Field", "Raw incoming", "Normalized incoming", "Existing canonical", "Status"].map((header) => (
                <th className="border-b border-border px-3 py-2 text-left" key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviewCase.comparison.map((row) => (
              <tr key={row.field}>
                <td className="break-words px-3 py-3 font-medium text-text-primary">{row.field}</td>
                <td className="break-words px-3 py-3 text-text-secondary">{row.rawValue}</td>
                <td className="break-words px-3 py-3 text-text-secondary">{row.normalizedValue}</td>
                <td className="break-words px-3 py-3 text-text-secondary">{row.canonicalValue}</td>
                <td className="px-3 py-3">
                  <StatusBadge tone={tone[row.status]}>{row.statusLabel}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 md:hidden">
        {reviewCase.comparison.map((row) => (
          <article className="min-w-0 rounded-md border border-border px-3 py-3" key={row.field}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-text-primary">{row.field}</h3>
              <StatusBadge tone={tone[row.status]}>{row.statusLabel}</StatusBadge>
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <FieldValue label="Raw incoming" value={row.rawValue} />
              <FieldValue label="Normalized incoming" value={row.normalizedValue} />
              <FieldValue label="Existing canonical" value={row.canonicalValue} />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function FieldValue({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="break-words text-text-secondary">{value}</dd>
    </div>
  );
}
