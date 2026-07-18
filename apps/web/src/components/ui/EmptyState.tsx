import type { ReactNode } from "react";
import { CircleDashed } from "lucide-react";

import { Button, type ButtonProps } from "./Button";
import { cn } from "./utils";

export type EmptyStateProps = {
  action?: ButtonProps;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
};

export function EmptyState({ action, className, description, icon, title }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle px-6 py-8 text-center",
        className,
      )}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-surface-raised text-text-muted shadow-raised">
        {icon ?? <CircleDashed aria-hidden="true" size={18} />}
      </div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && (
        <div className="mt-4">
          <Button {...action} />
        </div>
      )}
    </div>
  );
}
