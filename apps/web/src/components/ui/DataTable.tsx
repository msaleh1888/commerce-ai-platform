import type { ReactNode } from "react";

import { cn } from "./utils";

export type DataTableColumn<Row> = {
  align?: "left" | "center" | "right";
  cell?: (row: Row) => ReactNode;
  header: ReactNode;
  key: keyof Row | string;
};

export type DataTableProps<Row> = {
  ariaLabel: string;
  className?: string;
  columns: Array<DataTableColumn<Row>>;
  emptyState?: ReactNode;
  getRowId: (row: Row, index: number) => string;
  rows: Row[];
};

const alignClass = {
  center: "text-center",
  left: "text-left",
  right: "text-right",
};

function cellValue<Row extends object>(row: Row, key: keyof Row | string) {
  if (typeof key === "string" && key in row) {
    return String((row as Record<string, unknown>)[key] ?? "");
  }

  return "";
}

export function DataTable<Row extends object>({
  ariaLabel,
  className,
  columns,
  emptyState,
  getRowId,
  rows,
}: DataTableProps<Row>) {
  return (
    <div className={cn("overflow-x-auto rounded-md border border-border bg-surface-raised", className)}>
      <table aria-label={ariaLabel} className="min-w-full border-collapse text-sm">
        <thead className="bg-surface-subtle text-xs font-semibold uppercase text-text-muted">
          <tr>
            {columns.map((column) => (
              <th
                className={cn("border-b border-border px-3 py-2.5", alignClass[column.align ?? "left"])}
                key={String(column.key)}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-text-secondary">
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-8 text-center text-text-muted" colSpan={columns.length}>
                {emptyState ?? "No records found."}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr className="hover:bg-surface-subtle" key={getRowId(row, index)}>
                {columns.map((column) => (
                  <td
                    className={cn("whitespace-nowrap px-3 py-2.5", alignClass[column.align ?? "left"])}
                    key={String(column.key)}
                  >
                    {column.cell ? column.cell(row) : cellValue(row, column.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
