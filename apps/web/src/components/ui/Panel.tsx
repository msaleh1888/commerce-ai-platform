import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
};

export function Panel({
  actions,
  children,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PanelProps) {
  return (
    <section
      className={cn("rounded-lg border border-border bg-surface-raised shadow-raised", className)}
      {...props}
    >
      {(title || description || actions || eyebrow) && (
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {eyebrow && <p className="text-xs font-medium uppercase text-text-muted">{eyebrow}</p>}
            {title && <h2 className="truncate text-base font-semibold text-text-primary">{title}</h2>}
            {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
