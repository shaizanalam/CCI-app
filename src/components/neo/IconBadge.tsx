import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const tones = {
  primary: "bg-primary/12 text-primary",
  pdf: "bg-red-50 text-red-600 dark:bg-red-950/35 dark:text-red-300",
  image: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-300",
  muted: "bg-muted text-muted-foreground",
  accent: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
} as const;

export type IconBadgeTone = keyof typeof tones;

export function IconBadge({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: IconBadgeTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
