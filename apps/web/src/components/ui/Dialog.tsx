"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { IconButton } from "./IconButton";
import { cn } from "./utils";

export type DialogProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: ReactNode;
};

export function Dialog({ actions, children, className, description, onClose, open, title }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4" role="presentation">
      <section
        aria-modal="true"
        className={cn("w-full max-w-lg rounded-lg border border-border bg-surface-raised shadow-dialog", className)}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
          </div>
          <IconButton aria-label="Close dialog" icon={<X size={16} />} onClick={onClose} variant="ghost" />
        </header>
        <div className="px-4 py-4 text-sm text-text-secondary">{children}</div>
        {actions && <footer className="flex justify-end gap-2 border-t border-border px-4 py-3">{actions}</footer>}
      </section>
    </div>
  );
}
