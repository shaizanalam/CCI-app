import type { ClassLevel } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const LEVELS: ClassLevel[] = ["9", "10", "11", "12"];

export function ClassPills({
  value,
  onChange,
  disabled,
}: {
  value: ClassLevel;
  onChange: (v: ClassLevel) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {LEVELS.map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onChange(c)}
            className={cn(
              "tap-highlight-none neo-pressable flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "border border-border/90 bg-card text-foreground hover:border-primary/35",
            )}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
