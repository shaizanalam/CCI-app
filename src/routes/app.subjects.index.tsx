import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { listSubjects } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { BookOpen, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/subjects/")({
  component: SubjectsScreen,
});

function SubjectsScreen() {
  const { profile } = useSession();
  const cls = profile?.class ?? undefined;
  const { data, isLoading } = useQuery({ queryKey: ["subjects", cls], queryFn: () => listSubjects(cls), enabled: !!cls });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subjects</h1>
      <p className="text-sm text-muted-foreground">All subjects for Class {profile?.class}</p>

      {isLoading && <NeoCard className="text-sm text-muted-foreground">Loading…</NeoCard>}
      {!isLoading && (data ?? []).length === 0 && (
        <NeoCard className="text-center text-sm text-muted-foreground">No subjects available yet.</NeoCard>
      )}

      <div className="space-y-3">
        {(data ?? []).map((s) => (
          <Link key={s.id} to="/app/subjects/$subjectId" params={{ subjectId: s.id }}>
            <NeoCard className="neo-pressable flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl neo-inset text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">Class {s.class}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </NeoCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
