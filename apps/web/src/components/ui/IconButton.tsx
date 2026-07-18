import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { Tooltip } from "./Tooltip";
import { cn } from "./utils";

type IconButtonSize = "sm" | "md" | "lg";
type IconButtonVariant = "secondary" | "subtle" | "ghost" | "danger";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> & {
  "aria-label": string;
  icon: ReactNode;
  size?: IconButtonSize;
  tooltip?: string;
  variant?: IconButtonVariant;
};

const sizeClass: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
};

const variantClass: Record<IconButtonVariant, string> = {
  secondary: "border-border bg-surface-raised text-text-secondary shadow-raised hover:bg-surface-subtle hover:text-text-primary",
  subtle: "border-transparent bg-accent-soft text-accent-deep hover:bg-surface-selected",
  ghost: "border-transparent bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
  danger: "border-transparent bg-status-failed text-text-inverse shadow-raised hover:bg-status-failed/90",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, icon, size = "md", tooltip, type = "button", variant = "secondary", ...props },
  ref,
) {
  const button = (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        sizeClass[size],
        variantClass[variant],
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    >
      <span aria-hidden="true" className="flex size-4 items-center justify-center">
        {icon}
      </span>
    </button>
  );

  return <Tooltip content={tooltip ?? props["aria-label"]}>{button}</Tooltip>;
});
