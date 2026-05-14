import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-3xl border border-border/50 bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[70%] max-w-[200px]" />
            <Skeleton className="h-3 w-[45%] max-w-[120px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
