import type { ReactNode } from "react";

import { cn } from "./utils";

export type TooltipProps = {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  side?: "top" | "bottom";
};

export function Tooltip({ children, className, content, side = "top" }: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-slate-950 px-2 py-1 text-xs font-medium text-white shadow-raised group-hover/tooltip:block group-focus-within/tooltip:block",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}
