import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listSubjects, createSubject } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, NeoSelect, FieldLabel } from "@/components/neo/NeoInput";
import { BookOpen } from "lucide-react";
import type { ClassLevel } from "@/hooks/use-session";

export const Route = createFileRoute("/admin/subjects")({
  component: AdminSubjects,
});

function AdminSubjects() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["subjects-all"], queryFn: () => listSubjects() });
  const [name, setName] = useState("");
  const [cls, setCls] = useState<ClassLevel>("9");
  const [loading, setLoading] = useState(false);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 80) {
      toast.error("Subject name must be between 1 and 80 characters");
      return;
    }
    setLoading(true);
    try {
      await createSubject(trimmed, cls);
      toast.success("Subject created");
      setName("");
      qc.invalidateQueries({ queryKey: ["subjects-all"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subjects</h1>
      <NeoCard>
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <FieldLabel>Subject name</FieldLabel>
            <NeoInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" required />
          </div>
          <div>
            <FieldLabel>Class</FieldLabel>
            <NeoSelect value={cls} onChange={(e) => setCls(e.target.value as ClassLevel)}>
              {(["9", "10", "11", "12"] as const).map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </NeoSelect>
          </div>
          <NeoButton type="submit" variant="primary" loading={loading} className="w-full">Create subject</NeoButton>
        </form>
      </NeoCard>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All subjects</h2>
      <div className="space-y-3">
        {(data ?? []).map((s) => (
          <NeoCard key={s.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl neo-inset text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">Class {s.class}</p>
            </div>
          </NeoCard>
        ))}
        {(data ?? []).length === 0 && (
          <NeoCard className="text-center text-sm text-muted-foreground">No subjects yet.</NeoCard>
        )}
      </div>
    </div>
  );
}
