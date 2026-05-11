import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { listSubjects, listRecentMaterials } from "@/services/materials.service";
import { listNotifications } from "@/services/notifications.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { BookOpen, FileText, Image as ImageIcon, Bell, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/")({
  component: HomeScreen,
});

function HomeScreen() {
  const { profile } = useSession();
  const cls = profile?.class ?? undefined;

  const subjectsQ = useQuery({ queryKey: ["subjects", cls], queryFn: () => listSubjects(cls), enabled: !!cls });
  const recentQ = useQuery({ queryKey: ["recent-materials"], queryFn: () => listRecentMaterials(4) });
  const notifQ = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Hello,</p>
        <h1 className="text-2xl font-bold">{profile?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-xs text-muted-foreground">Class {profile?.class} · {(subjectsQ.data?.length ?? 0)} subjects</p>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subjects</h2>
          <Link to="/app/subjects" className="text-xs font-semibold text-primary">See all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(subjectsQ.data ?? []).slice(0, 4).map((s) => (
            <Link key={s.id} to="/app/subjects/$subjectId" params={{ subjectId: s.id }}>
              <NeoCard className="neo-pressable h-full">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl neo-inset text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Class {s.class}</p>
              </NeoCard>
            </Link>
          ))}
          {!subjectsQ.isLoading && (subjectsQ.data ?? []).length === 0 && (
            <NeoCard className="col-span-2 text-center text-sm text-muted-foreground">
              No subjects yet for your class.
            </NeoCard>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent uploads</h2>
        <div className="space-y-3">
          {(recentQ.data ?? []).map((m) => (
            <Link key={m.id} to="/app/subjects/$subjectId" params={{ subjectId: m.subject_id }}>
              <NeoCard className="neo-pressable flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl neo-inset text-primary">
                  {m.file_type === "pdf" ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold">{m.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {(m as { subjects?: { name?: string } }).subjects?.name ?? ""} · {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </NeoCard>
            </Link>
          ))}
          {!recentQ.isLoading && (recentQ.data ?? []).length === 0 && (
            <NeoCard className="text-center text-sm text-muted-foreground">No uploads yet.</NeoCard>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Latest alerts</h2>
          <Link to="/app/notifications" className="text-xs font-semibold text-primary">See all</Link>
        </div>
        <div className="space-y-3">
          {(notifQ.data ?? []).slice(0, 2).map((n) => (
            <NeoCard key={n.id} className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl neo-inset text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.message}</p>
              </div>
            </NeoCard>
          ))}
          {!notifQ.isLoading && (notifQ.data ?? []).length === 0 && (
            <NeoCard className="text-center text-sm text-muted-foreground">No notifications yet.</NeoCard>
          )}
        </div>
      </section>
    </div>
  );
}
