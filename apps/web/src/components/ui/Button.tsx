import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "subtle" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-accent-deep text-text-inverse shadow-raised hover:bg-primary",
  secondary: "border-border bg-surface-raised text-text-primary shadow-raised hover:bg-surface-subtle",
  subtle: "border-transparent bg-accent-soft text-accent-deep hover:bg-surface-selected",
  danger: "border-transparent bg-status-failed text-text-inverse shadow-raised hover:bg-status-failed/90",
  ghost: "border-transparent bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-9 gap-2 px-3.5 text-sm",
  lg: "h-10 gap-2.5 px-4 text-sm",
};

export function Button({
  children,
  className,
  disabled,
  icon,
  isLoading = false,
  size = "md",
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border font-medium leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}
