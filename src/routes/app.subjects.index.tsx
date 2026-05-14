import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { listSubjects } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { PremiumHeader, SectionLabel } from "@/components/layout/PremiumHeader";
import { SearchBar } from "@/components/neo/SearchBar";
import { EmptyState } from "@/components/neo/EmptyState";
import { ListSkeleton } from "@/components/neo/ListSkeleton";
import { IconBadge } from "@/components/neo/IconBadge";
import { BookOpen, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/subjects/")({
  component: SubjectsScreen,
});

function SubjectsScreen() {
  const { profile } = useSession();
  const cls = profile?.class ?? undefined;
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["subjects", cls],
    queryFn: () => listSubjects(cls),
    enabled: !!cls,
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((x) => x.name.toLowerCase().includes(s));
  }, [data, q]);

  return (
    <div className="space-y-6 pb-4">
      <PremiumHeader
        title="My subjects"
        subtitle={`Everything for Class ${profile?.class ?? "—"} in one library.`}
        avatarLinkTo="/app/profile"
        avatarLabel={profile?.name ?? profile?.email ?? "You"}
      />

      <SearchBar value={q} onChange={setQ} placeholder="Search your subjects…" />

      {isLoading && <ListSkeleton rows={5} />}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title="No subjects found"
          description={
            q
              ? "Try a different search."
              : "Your institute has not added subjects for your class yet."
          }
        />
      )}

      <div className="space-y-3">
        {filtered.map((s) => (
          <Link key={s.id} to="/app/subjects/$subjectId" params={{ subjectId: s.id }}>
            <NeoCard className="tap-highlight-none neo-pressable flex items-center gap-4 p-4">
              <IconBadge tone="accent" className="h-12 w-12 rounded-2xl">
                <BookOpen className="h-5 w-5" strokeWidth={1.75} />
              </IconBadge>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold text-foreground">{s.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Class {s.class} · Updated{" "}
                  {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </NeoCard>
          </Link>
        ))}
      </div>

      <SectionLabel>Tip</SectionLabel>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Tap a subject to view PDFs and images shared by your teachers. Files open in a secure viewer with an
        institute-branded watermark (no email shown on screen).
      </p>
    </div>
  );
}
