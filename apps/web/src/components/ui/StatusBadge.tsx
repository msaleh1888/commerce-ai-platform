import type { HTMLAttributes } from "react";

import { cn } from "./utils";

export type StatusBadgeTone = "processing" | "ready" | "review" | "failed" | "inactive";

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone: StatusBadgeTone;
};

const toneClass: Record<StatusBadgeTone, string> = {
  processing: "border-status-processing/25 bg-status-surface-processing text-status-processing",
  ready: "border-status-ready/25 bg-status-surface-ready text-status-ready",
  review: "border-status-review/25 bg-status-surface-review text-status-review",
  failed: "border-status-failed/25 bg-status-surface-failed text-status-failed",
  inactive: "border-status-inactive/25 bg-status-surface-inactive text-status-inactive",
};

export function StatusBadge({ children, className, tone, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium leading-5",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
