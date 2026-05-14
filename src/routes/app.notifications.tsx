import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listNotifications } from "@/services/notifications.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { EmptyState } from "@/components/neo/EmptyState";
import { ListSkeleton } from "@/components/neo/ListSkeleton";
import { IconBadge } from "@/components/neo/IconBadge";
import { Bell, Megaphone, FileText } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsScreen,
});

function groupLabel(d: Date) {
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMM yyyy");
}

function NotificationsScreen() {
  const { profile } = useSession();
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });

  const groups = useMemo(() => {
    const list = data ?? [];
    const map = new Map<string, typeof list>();
    for (const n of list) {
      const key = groupLabel(new Date(n.created_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    return Array.from(map.entries());
  }, [data]);

  return (
    <div className="space-y-6 pb-4">
      <PremiumHeader
        title="Alerts"
        subtitle="Stay updated with your latest academic activities."
        avatarLinkTo="/app/profile"
        avatarLabel={profile?.name ?? profile?.email ?? "You"}
      />

      {isLoading && <ListSkeleton rows={4} />}
      {!isLoading && (data ?? []).length === 0 && (
        <EmptyState
          title="You are all caught up"
          description="When your institute sends announcements, they will appear here."
        />
      )}

      <div className="space-y-8">
        {groups.map(([label, items]) => (
          <section key={label}>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
              </h2>
              <div className="h-px flex-1 bg-border/80" />
            </div>
            <div className="space-y-3">
              {items.map((n) => (
                <NeoCard key={n.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <IconBadge tone="primary" className="h-11 w-11">
                      <FileText className="h-5 w-5" />
                    </IconBadge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-foreground">{n.title}</p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {format(new Date(n.created_at), "h:mm a")}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {n.message}
                      </p>
                      {n.target_class && (
                        <span className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Class {n.target_class}
                        </span>
                      )}
                    </div>
                  </div>
                </NeoCard>
              ))}
            </div>
          </section>
        ))}
      </div>

      {(data ?? []).length > 0 && (
        <NeoCard className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-indigo-600 p-5 text-white shadow-lg shadow-primary/20">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold">Notification summary</p>
              <p className="mt-1 text-sm text-white/85">
                You have {(data ?? []).length} recent alerts in your feed.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
          </div>
        </NeoCard>
      )}

      <div className="flex justify-center pb-2 text-muted-foreground">
        <Bell className="h-8 w-8 opacity-20" strokeWidth={1} />
      </div>
    </div>
  );
}
