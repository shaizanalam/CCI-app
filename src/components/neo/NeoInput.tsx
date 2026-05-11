import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-xl bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground neo-inset focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/40";

export const NeoInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function NeoInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(base, className)} {...props} />;
  },
);

export const NeoTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function NeoTextarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(base, "min-h-[100px] resize-y", className)} {...props} />;
  },
);

export const NeoSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function NeoSelect({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(base, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
    );
  },
);

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</label>;
}
