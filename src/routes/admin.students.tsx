import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { listAllStudents, approveStudent, deleteStudentProfile } from "@/services/students.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { EmptyState } from "@/components/neo/EmptyState";
import { ListSkeleton } from "@/components/neo/ListSkeleton";
import { ConfirmDestructiveDialog } from "@/components/neo/ConfirmDestructiveDialog";
import { useSession } from "@/hooks/use-session";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/students")({
  component: StudentsScreen,
});

function StudentsScreen() {
  const { profile } = useSession();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["students"], queryFn: listAllStudents });
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [remove, setRemove] = useState<{ id: string; name: string; approved: boolean } | null>(null);

  const filtered = (data ?? []).filter((s) => (filter === "pending" ? !s.approved : true));
  const selfId = profile?.id;

  const handleApprove = async (id: string) => {
    try {
      await approveStudent(id);
      toast.success("Approved");
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["pending"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to approve. Please try again.");
    }
  };

  const runRemove = async () => {
    if (!remove) return;
    await deleteStudentProfile(remove.id);
    toast.success(remove.approved ? "Student removed from the institute app" : "Signup declined");
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["pending"] });
  };

  return (
    <div className="space-y-6 pb-4">
      <PremiumHeader avatarLinkTo="/admin" avatarLabel={profile?.name ?? profile?.email ?? "Admin"} />
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Pending approvals</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and manage student signups. Destructive actions require confirmation.
        </p>
      </div>

      <div className="flex gap-2">
        <FilterBtn active={filter === "pending"} onClick={() => setFilter("pending")}>
          Pending
        </FilterBtn>
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
          All students
        </FilterBtn>
      </div>

      {isLoading && <ListSkeleton rows={4} />}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title="Nothing to show"
          description={
            filter === "pending" ? "No students waiting for approval." : "No students in the list yet."
          }
        />
      )}

      <div className="space-y-4">
        {filtered.map((s) => {
          const initial = (s.name || s.email || "?").trim().slice(0, 1).toUpperCase();
          const isSelf = s.id === selfId;
          return (
            <NeoCard key={s.id} className="space-y-4 p-5">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold text-foreground">{s.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{s.email}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Class {s.class ?? "—"} · {s.approved ? "Approved" : "Pending approval"}
                    {isSelf ? " · You" : ""}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {!s.approved && (
                  <NeoButton
                    variant="primary"
                    onClick={() => void handleApprove(s.id)}
                    className="w-full min-h-[52px]"
                    disabled={isSelf}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </NeoButton>
                )}
                <NeoButton
                  variant="default"
                  onClick={() => !isSelf && setRemove({ id: s.id, name: s.name, approved: s.approved })}
                  disabled={isSelf}
                  className={cn(
                    "w-full min-h-[52px] border-rose-200 bg-rose-50 text-rose-700 shadow-sm hover:bg-rose-100 disabled:opacity-40",
                    s.approved && "col-span-2",
                  )}
                >
                  <X className="h-4 w-4" /> {s.approved ? "Remove" : "Decline"}
                </NeoButton>
              </div>
            </NeoCard>
          );
        })}
      </div>

      <ConfirmDestructiveDialog
        open={!!remove}
        onOpenChange={(o) => !o && setRemove(null)}
        title={remove?.approved ? "Remove this student?" : "Decline this signup?"}
        description={
          remove
            ? remove.approved
              ? `“${remove.name}” will lose access to materials and alerts. Their login account may still exist until separately removed from authentication.`
              : `“${remove.name}” will be removed from the pending list. They will not be able to use the app until they sign up again.`
            : ""
        }
        confirmLabel={remove?.approved ? "Remove student" : "Decline signup"}
        onConfirm={runRemove}
      />
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap-highlight-none neo-pressable min-h-[44px] flex-1 rounded-2xl text-sm font-semibold transition",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "border border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
