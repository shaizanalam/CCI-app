import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "default" | "primary" | "danger" | "ghost" | "secondary";

export interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  default:
    "border border-border/80 bg-card text-foreground shadow-[var(--shadow-float-sm-value)] hover:border-primary/30 hover:text-primary",
  secondary: "border border-border bg-muted/50 text-foreground hover:bg-muted",
  primary:
    "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:brightness-[1.04] active:brightness-[0.98]",
  danger:
    "bg-destructive text-destructive-foreground shadow-sm hover:brightness-[1.04] active:brightness-[0.98]",
  ghost: "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
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
        "tap-highlight-none neo-pressable inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  );
});
