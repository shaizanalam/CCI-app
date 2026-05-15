import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PremiumHeader({
  title,
  subtitle,
  avatarLinkTo,
  avatarLabel,
  left,
}: {
  title?: string;
  subtitle?: string;
  avatarLinkTo: string;
  avatarLabel: string;
  left?: ReactNode;
}) {
  const initial = (avatarLabel || "?").trim().slice(0, 1).toUpperCase() || "?";

  return (
    <header className="mb-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {left ?? (
            <>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              </div>
              <span className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
                CCI
              </span>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to={avatarLinkTo}
            className="tap-highlight-none flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card text-sm font-bold text-primary shadow-[var(--shadow-float-sm-value)] transition hover:border-primary/35"
            aria-label="Open profile"
          >
            {initial}
          </Link>
        </div>
      </div>
      {(title || subtitle) && (
        <div className="mt-6">
          {title && (
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}

export function DetailHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  right,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="tap-highlight-none neo-pressable mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card text-foreground shadow-sm transition hover:border-primary/30"
          aria-label={backLabel}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold tracking-tight text-primary md:text-2xl">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        {right}
      </div>
    </header>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </h2>
      {right}
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary",
        className,
      )}
    >
      <BookOpen className="h-6 w-6" strokeWidth={1.75} />
    </div>
  );
}
