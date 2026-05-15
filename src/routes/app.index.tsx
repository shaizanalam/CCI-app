import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { listSubjects, listRecentMaterials } from "@/services/materials.service";
import { listNotifications } from "@/services/notifications.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { PremiumHeader, SectionLabel } from "@/components/layout/PremiumHeader";
import { SearchBar } from "@/components/neo/SearchBar";
import { EmptyState } from "@/components/neo/EmptyState";
import { ListSkeleton } from "@/components/neo/ListSkeleton";
import { IconBadge } from "@/components/neo/IconBadge";
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/")({
  component: HomeScreen,
});

function HomeScreen() {
  const { profile } = useSession();
  const cls = profile?.class ?? undefined;
  const [q, setQ] = useState("");

  const subjectsQ = useQuery({
    queryKey: ["subjects", cls],
    queryFn: () => listSubjects(cls),
    enabled: !!cls,
  });
  const recentQ = useQuery({
    queryKey: ["recent-materials"],
    queryFn: () => listRecentMaterials(6),
  });
  const notifQ = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });

  const filteredSubjects = useMemo(() => {
    const list = subjectsQ.data ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((x) => x.name.toLowerCase().includes(s));
  }, [subjectsQ.data, q]);

  const first = filteredSubjects[0] ?? (subjectsQ.data ?? [])[0];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 pb-4">
      <PremiumHeader
        avatarLinkTo="/app/profile"
        avatarLabel={profile?.name ?? profile?.email ?? "You"}
      />
      <div>
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Hello, {profile?.name?.split(" ")[0] ?? "Student"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Class {profile?.class ?? "—"} · {subjectsQ.data?.length ?? 0} subjects
        </p>
      </div>

      <SearchBar value={q} onChange={setQ} placeholder="Search your notes…" />

      {first && (
        <Link to="/app/subjects/$subjectId" params={{ subjectId: first.id }}>
          <div className="tap-highlight-none neo-pressable glow-primary relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-indigo-600 p-6 text-white shadow-lg shadow-primary/25 dark:from-primary/90 dark:via-indigo-600 dark:to-violet-700">
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
            <span className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95">
              Active subject
            </span>
            <h2 className="relative mt-3 font-display text-xl font-bold leading-snug md:text-2xl">
              {first.name}
            </h2>
            <p className="relative mt-2 max-w-md text-sm leading-relaxed text-white/85">
              Open materials, PDFs, and class updates for this subject in one place.
            </p>
            <span className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-md">
              Resume learning
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      )}

      <section>
        <SectionLabel
          right={
            <Link
              to="/app/subjects"
              className="text-xs font-semibold text-primary transition hover:underline"
            >
              View all
            </Link>
          }
        >
          My subjects
        </SectionLabel>
        {subjectsQ.isLoading && <ListSkeleton rows={3} />}
        {!subjectsQ.isLoading && filteredSubjects.length === 0 && (
          <EmptyState
            title="No subjects yet"
            description="Your institute has not published subjects for your class, or nothing matches your search."
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          {filteredSubjects.slice(0, 4).map((s) => (
            <Link key={s.id} to="/app/subjects/$subjectId" params={{ subjectId: s.id }}>
              <NeoCard className="tap-highlight-none neo-pressable flex h-full flex-col p-4">
                <IconBadge tone="accent" className="mb-3 h-10 w-10">
                  <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                </IconBadge>
                <h3 className="font-display text-base font-semibold leading-tight text-foreground">
                  {s.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Class {s.class}</p>
              </NeoCard>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel
          right={
            <Link
              to="/app/subjects"
              className="text-xs font-semibold text-primary transition hover:underline"
            >
              View all
            </Link>
          }
        >
          Recent materials
        </SectionLabel>
        {recentQ.isLoading && <ListSkeleton rows={3} />}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {(recentQ.data ?? []).map((m) => (
            <Link
              key={m.id}
              to="/app/subjects/$subjectId"
              params={{ subjectId: m.subject_id }}
              className="tap-highlight-none w-[min(16rem,78vw)] shrink-0"
            >
              <NeoCard className="neo-pressable flex h-full flex-col p-4">
                <IconBadge
                  tone={m.file_type === "pdf" ? "pdf" : "image"}
                  className="mb-3 h-10 w-10"
                >
                  {m.file_type === "pdf" ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </IconBadge>
                <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground">
                  {m.title}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {(m as { subjects?: { name?: string } }).subjects?.name ?? "Subject"} ·{" "}
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Open <ExternalLink className="h-3 w-3" />
                </span>
              </NeoCard>
            </Link>
          ))}
        </div>
        {!recentQ.isLoading && (recentQ.data ?? []).length === 0 && (
          <EmptyState
            title="No uploads yet"
            description="When your teachers add PDFs or images, they will appear here."
          />
        )}
      </section>

      <section>
        <SectionLabel
          right={
            <Link
              to="/app/notifications"
              className="text-xs font-semibold text-primary transition hover:underline"
            >
              See all
            </Link>
          }
        >
          Latest alerts
        </SectionLabel>
        <NeoCard variant="outline" className="divide-y divide-border/80 p-0">
          {(notifQ.data ?? []).slice(0, 3).map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-4">
              <IconBadge tone="primary" className="h-10 w-10">
                <Bell className="h-4 w-4" strokeWidth={1.85} />
              </IconBadge>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{n.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {n.message}
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
          {!notifQ.isLoading && (notifQ.data ?? []).length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
        </NeoCard>
      </section>

      <div className="flex items-center justify-center gap-2 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
        <Sparkles className="h-3.5 w-3.5" />
        Calm learning, mobile-first
      </div>
    </div>
  );
}
