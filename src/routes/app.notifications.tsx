import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "@/services/notifications.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { Bell } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsScreen,
});

function NotificationsScreen() {
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {isLoading && <NeoCard className="text-sm text-muted-foreground">Loading…</NeoCard>}
      {!isLoading && (data ?? []).length === 0 && (
        <NeoCard className="text-center text-sm text-muted-foreground">No notifications yet.</NeoCard>
      )}
      <div className="space-y-3">
        {(data ?? []).map((n) => (
          <NeoCard key={n.id} className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl neo-inset text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{n.title}</p>
                <span className="text-[11px] text-muted-foreground">{format(new Date(n.created_at), "d MMM")}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{n.message}</p>
              {n.target_class && <p className="mt-2 text-[10px] uppercase tracking-wider text-primary">Class {n.target_class}</p>}
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}
