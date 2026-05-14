export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/90 bg-card/70 px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
