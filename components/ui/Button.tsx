import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  // Clay-filled CTA — the app's single "go" color.
  primary: "bg-accent-500 text-white hover:bg-accent-600 shadow-[0_6px_14px_-8px_rgba(169,85,47,0.9)]",
  accent: "bg-accent-500 text-white hover:bg-accent-600 shadow-[0_6px_14px_-8px_rgba(169,85,47,0.9)]",
  // Pine outline pill — the everyday "add" action.
  secondary: "bg-transparent text-primary-700 border-[1.5px] border-primary-700 hover:bg-primary-50",
  ghost: "bg-transparent text-ink-700 border-[1.5px] border-hair hover:bg-surface-2",
  danger: "bg-transparent text-danger-600 hover:bg-danger-tint",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-pill font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
