import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

    const variantStyles = {
      primary: "bg-primary text-on-primary hover:bg-surface-tint shadow-sm",
      secondary: "bg-surface-container text-on-surface hover:bg-surface-container-high",
      outline: "border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-low",
      ghost: "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
      destructive: "bg-error text-on-error hover:bg-error/90 shadow-sm",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-5 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
