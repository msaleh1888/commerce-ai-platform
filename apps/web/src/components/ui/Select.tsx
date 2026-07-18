import type { SelectHTMLAttributes } from "react";

import { cn } from "./utils";

export type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  helperText?: string;
  label: string;
  options: SelectOption[];
};

export function Select({ className, helperText, id, label, options, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-text-secondary">
      <span>{label}</span>
      <select
        className={cn(
          "h-9 rounded-md border border-border bg-surface-raised px-3 text-sm text-text-primary shadow-raised",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          className,
        )}
        id={selectId}
        {...props}
      >
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <span className="text-xs font-normal text-text-muted">{helperText}</span>}
    </label>
  );
}
