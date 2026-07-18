"use client";

import { useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { IconButton } from "./IconButton";
import { cn } from "./utils";
import { useModalAccessibility } from "./useModalAccessibility";

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
  const containerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useModalAccessibility({ closeButtonRef, containerRef, onClose, open });

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-surface-overlay/30 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn("w-full max-w-lg rounded-lg border border-border bg-surface-raised shadow-dialog", className)}
        ref={containerRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-primary" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-text-muted" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <IconButton
            aria-label="Close dialog"
            icon={<X size={16} />}
            onClick={onClose}
            ref={closeButtonRef}
            variant="ghost"
          />
        </header>
        <div className="px-4 py-4 text-sm text-text-secondary">{children}</div>
        {actions && <footer className="flex justify-end gap-2 border-t border-border px-4 py-3">{actions}</footer>}
      </section>
    </div>
  );
}
