import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function NeoCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={cn("neo-surface p-5", className)} {...props}>
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
