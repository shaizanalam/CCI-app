import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "default" | "primary" | "danger" | "ghost";

export interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  default: "text-foreground neo-surface-sm hover:text-primary",
  primary:
    "text-primary-foreground bg-[var(--color-primary)] shadow-[8px_8px_16px_var(--neo-shadow-dark),-8px_-8px_16px_var(--neo-shadow-light)] hover:brightness-105",
  danger:
    "text-destructive-foreground bg-[var(--color-destructive)] shadow-[8px_8px_16px_var(--neo-shadow-dark),-8px_-8px_16px_var(--neo-shadow-light)] hover:brightness-105",
  ghost: "text-muted-foreground hover:text-foreground",
};

export const NeoButton = forwardRef<HTMLButtonElement, NeoButtonProps>(function NeoButton(
  { className, variant = "default", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "neo-pressable inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  );
});
