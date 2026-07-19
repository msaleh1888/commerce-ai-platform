import type { ReviewCaseViewModel } from "../schemas/view-model";

export function RecordSummary({
  label,
  record,
}: {
  readonly label: string;
  readonly record: ReviewCaseViewModel["recordA"];
}) {
  const rows = [
    ["Supplier", record.supplier],
    ["SKU", record.supplierSku],
    ["Category", record.category],
    ["GTIN", record.gtin],
    ["MPN", record.manufacturerPartNumber],
    ["Price", `${record.price.toFixed(2)} ${record.currency}`],
    ["Color", record.color],
    ["Capacity", record.capacity],
    ["Connectivity", record.connectivity],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface-raised px-4 py-4">
      <p className="text-xs font-medium uppercase text-text-muted">{label}</p>
      <h3 className="mt-1 break-words text-base font-semibold text-text-primary">{record.title}</h3>
      <p className="mt-1 break-all text-xs text-text-muted">{record.id}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        {rows.map(([name, value]) => (
          <div className="grid min-w-0 grid-cols-[6rem_minmax(0,1fr)] gap-2" key={name}>
            <dt className="text-xs text-text-muted">{name}</dt>
            <dd className="break-words text-text-secondary">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
