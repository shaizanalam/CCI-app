import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listNotifications,
  createNotification,
  deleteNotification,
  deleteNotificationsByIds,
} from "@/services/notifications.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, NeoTextarea, FieldLabel } from "@/components/neo/NeoInput";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { IconBadge } from "@/components/neo/IconBadge";
import { ConfirmDestructiveDialog } from "@/components/neo/ConfirmDestructiveDialog";
import { useSession } from "@/hooks/use-session";
import type { ClassLevel } from "@/hooks/use-session";
import { Bell, Send, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const { profile } = useSession();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: () => listNotifications(200) });
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | ClassLevel>("all");
  const [loading, setLoading] = useState(false);
  const [delOne, setDelOne] = useState<{ id: string; title: string } | null>(null);
  const [delBulk, setDelBulk] = useState(false);

  const ids = (data ?? []).map((n) => n.id);

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
      setTitle("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const levels: ClassLevel[] = ["9", "10", "11", "12"];

  const runDeleteOne = async () => {
    if (!delOne) return;
    await deleteNotification(delOne.id);
    toast.success("Notification deleted");
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const runDeleteBulk = async () => {
    if (ids.length === 0) {
      toast.error("Nothing to delete");
      throw new Error("empty");
    }
    await deleteNotificationsByIds(ids);
    toast.success("All listed notifications were deleted");
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="space-y-8 pb-4">
      <PremiumHeader avatarLinkTo="/admin" avatarLabel={profile?.name ?? profile?.email ?? "Admin"} />
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Send notification</h1>
        <p className="mt-2 text-sm text-muted-foreground">Broadcast short updates to all students or a single class.</p>
      </div>

      <NeoCard className="space-y-5 p-5 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <FieldLabel>Recipient group</FieldLabel>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setTarget("all")}
                className={cn(
                  "tap-highlight-none neo-pressable flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 text-left text-sm font-semibold transition",
                  target === "all"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <IconBadge tone="muted" className="h-10 w-10">
                  <Users className="h-5 w-5" />
                </IconBadge>
                All students
              </button>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {levels.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTarget(c)}
                    className={cn(
                      "tap-highlight-none neo-pressable min-h-[48px] rounded-2xl border text-sm font-semibold transition",
                      target === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Class {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <FieldLabel>Title</FieldLabel>
            <NeoInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Short headline"
              required
            />
          </div>
          <div>
            <FieldLabel>Message content</FieldLabel>
            <NeoTextarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              required
              placeholder="Write your announcement here…"
            />
          </div>
          <NeoButton type="submit" variant="primary" loading={loading} className="w-full min-h-[52px] gap-2 text-base">
            <Send className="h-4 w-4" /> Send alert
          </NeoButton>
        </form>
      </NeoCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent alerts</p>
        <NeoButton
          type="button"
          variant="default"
          disabled={ids.length === 0}
          className="min-h-[40px] border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
          onClick={() => setDelBulk(true)}
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear all shown
        </NeoButton>
      </div>
      <div className="space-y-3">
        {(data ?? []).map((n) => (
          <NeoCard key={n.id} variant="outline" className="flex gap-3 p-4">
            <IconBadge tone="primary" className="h-11 w-11 shrink-0">
              <Bell className="h-5 w-5" />
            </IconBadge>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground">{n.title}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{format(new Date(n.created_at), "d MMM")}</span>
              </div>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{n.message}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {n.target_class ? `Class ${n.target_class}` : "All classes"}
              </p>
            </div>
            <NeoButton
              type="button"
              variant="ghost"
              className="h-10 w-10 shrink-0 rounded-xl p-0 text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
              aria-label="Delete notification"
              onClick={() => setDelOne({ id: n.id, title: n.title })}
            >
              <Trash2 className="h-4 w-4" />
            </NeoButton>
          </NeoCard>
        ))}
      </div>

      <ConfirmDestructiveDialog
        open={!!delOne}
        onOpenChange={(o) => !o && setDelOne(null)}
        title="Delete this notification?"
        description={delOne ? `“${delOne.title}” will be removed for everyone.` : ""}
        confirmLabel="Delete"
        onConfirm={runDeleteOne}
      />

      <ConfirmDestructiveDialog
        open={delBulk}
        onOpenChange={setDelBulk}
        title="Delete all listed notifications?"
        description={`This will permanently delete ${ids.length} notification(s) shown in this list (up to the server fetch limit). Students will no longer see them.`}
        confirmLabel="Delete all"
        onConfirm={runDeleteBulk}
      />
    </div>
  );
}
