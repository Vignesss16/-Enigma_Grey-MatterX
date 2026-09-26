import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-secondary-container text-on-secondary-container border-transparent",
    secondary: "bg-surface-container-high text-on-surface border-transparent",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    error: "bg-error-container text-on-error-container border-transparent",
    neutral: "bg-surface-container-low text-on-surface-variant border-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
