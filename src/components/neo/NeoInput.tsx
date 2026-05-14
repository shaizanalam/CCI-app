import { cn } from "@/lib/utils";
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const base =
  "w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export const NeoInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function NeoInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(base, className)} {...props} />;
  },
);

export const NeoTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function NeoTextarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(base, "min-h-[120px] resize-y", className)} {...props} />
  );
});

export const NeoSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function NeoSelect({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(base, "min-h-[48px] appearance-none bg-card pr-10", className)}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export function FieldLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label
      className={cn(
        "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </label>
  );
}
