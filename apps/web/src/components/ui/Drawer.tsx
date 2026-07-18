"use client";

import { useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { IconButton } from "./IconButton";
import { cn } from "./utils";
import { useModalAccessibility } from "./useModalAccessibility";

export type DrawerProps = {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  onClose: () => void;
  open: boolean;
  side?: "left" | "right";
  title: ReactNode;
};

export function Drawer({
  children,
  className,
  description,
  onClose,
  open,
  side = "right",
  title,
}: DrawerProps) {
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
      className="fixed inset-0 z-50 bg-surface-overlay/30"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <aside
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "fixed top-0 flex h-full w-full max-w-md flex-col border-border bg-surface-raised shadow-dialog",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          className,
        )}
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
            aria-label="Close drawer"
            icon={<X size={16} />}
            onClick={onClose}
            ref={closeButtonRef}
            variant="ghost"
          />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </aside>
    </div>
  );
}
