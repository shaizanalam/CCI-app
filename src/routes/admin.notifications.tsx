import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listNotifications, createNotification } from "@/services/notifications.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, NeoTextarea, NeoSelect, FieldLabel } from "@/components/neo/NeoInput";
import type { ClassLevel } from "@/hooks/use-session";
import { Bell } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | ClassLevel>("all");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) return toast.error("Please enter a title with at least 2 characters");
    if (message.trim().length < 2) return toast.error("Please enter a message with at least 2 characters");
    setLoading(true);
    try {
      await createNotification({
        title: title.trim(),
        message: message.trim(),
        target_class: target === "all" ? null : target,
      });
      toast.success("Notification sent");
      setTitle(""); setMessage("");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Send notification</h1>
      <NeoCard>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <FieldLabel>Title</FieldLabel>
            <NeoInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
          </div>
          <div>
            <FieldLabel>Message</FieldLabel>
            <NeoTextarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} required />
          </div>
          <div>
            <FieldLabel>Audience</FieldLabel>
            <NeoSelect value={target} onChange={(e) => setTarget(e.target.value as "all" | ClassLevel)}>
              <option value="all">All students</option>
              {(["9", "10", "11", "12"] as const).map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </NeoSelect>
          </div>
          <NeoButton type="submit" variant="primary" loading={loading} className="w-full">Send</NeoButton>
        </form>
      </NeoCard>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent</h2>
      <div className="space-y-3">
        {(data ?? []).map((n) => (
          <NeoCard key={n.id} className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl neo-inset text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{n.title}</p>
                <span className="text-[11px] text-muted-foreground">{format(new Date(n.created_at), "d MMM")}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.message}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-primary">
                {n.target_class ? `Class ${n.target_class}` : "All classes"}
              </p>
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}
