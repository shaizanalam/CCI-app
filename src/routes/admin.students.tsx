import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAllStudents, approveStudent, rejectStudent } from "@/services/students.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/students")({
  component: StudentsScreen,
});

function StudentsScreen() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["students"], queryFn: listAllStudents });
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const filtered = (data ?? []).filter((s) => (filter === "pending" ? !s.approved : true));

  const handle = async (id: string, fn: (id: string) => Promise<void>, label: string) => {
    try {
      await fn(id);
      toast.success(label);
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["pending"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to complete this action. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Students</h1>
      <div className="flex gap-2">
        <FilterBtn active={filter === "pending"} onClick={() => setFilter("pending")}>Pending</FilterBtn>
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>All</FilterBtn>
      </div>
      {isLoading && <NeoCard className="text-sm text-muted-foreground">Loading…</NeoCard>}
      {!isLoading && filtered.length === 0 && (
        <NeoCard className="text-center text-sm text-muted-foreground">Nothing here.</NeoCard>
      )}
      <div className="space-y-3">
        {filtered.map((s) => (
          <NeoCard key={s.id} className="space-y-3">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.email}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-primary">
                Class {s.class ?? "—"} · {s.approved ? "Approved" : "Pending"}
              </p>
            </div>
            <div className="flex gap-2">
              {!s.approved && (
                <NeoButton variant="primary" onClick={() => handle(s.id, approveStudent, "Approved")} className="flex-1">
                  <Check className="h-4 w-4" /> Approve
                </NeoButton>
              )}
              <NeoButton variant="danger" onClick={() => handle(s.id, rejectStudent, "Removed")} className="flex-1">
                <X className="h-4 w-4" /> {s.approved ? "Remove" : "Reject"}
              </NeoButton>
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`neo-pressable rounded-xl px-4 py-2 text-xs font-semibold ${active ? "neo-inset text-primary" : "neo-surface-sm text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
