import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

const variants = {
  elevated:
    "border border-border/60 bg-card text-card-foreground shadow-[var(--shadow-float-value)]",
  muted: "border border-transparent bg-muted/70 text-foreground",
  outline:
    "border border-border bg-card text-card-foreground shadow-[var(--shadow-float-sm-value)]",
} as const;

export type NeoCardVariant = keyof typeof variants;

export function NeoCard({
  className,
  children,
  variant = "elevated",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode; variant?: NeoCardVariant }) {
  return (
    <div
      className={cn("rounded-3xl p-5 transition-shadow duration-200", variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function NeoInset({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={cn("neo-inset p-3", className)} {...props}>
      {children}
    </div>
  );
}
