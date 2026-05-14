import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { listMaterialsBySubject } from "@/services/materials.service";
import { supabase } from "@/integrations/supabase/client";
import { NeoCard } from "@/components/neo/NeoCard";
import { ProtectedViewer } from "@/components/viewer/ProtectedViewer";
import { useSession } from "@/hooks/use-session";
import { DetailHeader } from "@/components/layout/PremiumHeader";
import { EmptyState } from "@/components/neo/EmptyState";
import { ListSkeleton } from "@/components/neo/ListSkeleton";
import { IconBadge } from "@/components/neo/IconBadge";
import { buildWatermarkText } from "@/lib/watermark";
import { FileText, Image as ImageIcon, MoreVertical } from "lucide-react";
export const Route = createFileRoute("/app/subjects/$subjectId")({
  component: SubjectDetail,
});

function SubjectDetail() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const { profile } = useSession();

  const subjectQ = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id,name,class,created_at")
        .eq("id", subjectId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const materialsQ = useQuery({
    queryKey: ["materials", subjectId],
    queryFn: () => listMaterialsBySubject(subjectId),
  });

  const [open, setOpen] = useState<{ path: string; type: "pdf" | "image"; title: string } | null>(
    null,
  );

  const latestMaterialAt = materialsQ.data?.[0]?.created_at;
  const updatedLabel = latestMaterialAt
    ? formatDistanceToNow(new Date(latestMaterialAt), { addSuffix: true })
    : subjectQ.data?.created_at
      ? formatDistanceToNow(new Date(subjectQ.data.created_at), { addSuffix: true })
      : "—";

  const initial = (profile?.name ?? profile?.email ?? "Y").trim().slice(0, 1).toUpperCase() || "Y";

  return (
    <div className="space-y-5 pb-4">
      <DetailHeader
        title={subjectQ.data?.name ?? "Subject"}
        subtitle={`Class ${subjectQ.data?.class ?? "—"} · ${materialsQ.data?.length ?? 0} files · Updated ${updatedLabel}`}
        onBack={() => navigate({ to: "/app/subjects" })}
        backLabel="Back to subjects"
        right={
          <Link
            to="/app/profile"
            className="tap-highlight-none flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card text-sm font-bold text-primary shadow-sm transition hover:border-primary/35"
            aria-label="Profile"
          >
            {initial}
          </Link>
        }
      />

      <NeoCard className="flex items-start gap-3 p-4">
        <IconBadge tone="accent" className="h-12 w-12">
          <FileText className="h-5 w-5" />
        </IconBadge>
        <div>
          <p className="font-display text-base font-semibold text-foreground">Subject overview</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {materialsQ.data?.length ?? 0} files · Updated {updatedLabel}
          </p>
        </div>
      </NeoCard>

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Study materials
        </h2>
        <span className="text-xs font-semibold text-primary">Newest first</span>
      </div>

      {materialsQ.isLoading && <ListSkeleton rows={4} />}
      {!materialsQ.isLoading && (materialsQ.data ?? []).length === 0 && (
        <EmptyState
          title="No materials yet"
          description="Your teachers have not uploaded files for this subject."
        />
      )}

      <div className="space-y-3">
        {(materialsQ.data ?? []).map((m) => (
          <NeoCard
            key={m.id}
            className="tap-highlight-none neo-pressable flex cursor-pointer items-center gap-3 p-4"
            onClick={() => setOpen({ path: m.storage_path, type: m.file_type, title: m.title })}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen({ path: m.storage_path, type: m.file_type, title: m.title });
              }
            }}
            tabIndex={0}
          >
            <IconBadge tone={m.file_type === "pdf" ? "pdf" : "image"}>
              {m.file_type === "pdf" ? (
                <FileText className="h-5 w-5" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
            </IconBadge>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-semibold text-foreground">{m.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {format(new Date(m.created_at), "d MMM yyyy")}
              </p>
            </div>
            <MoreVertical className="h-5 w-5 shrink-0 text-muted-foreground/70" aria-hidden />
          </NeoCard>
        ))}
      </div>

      {open && (
        <ProtectedViewer
          storagePath={open.path}
          fileType={open.type}
          watermark={buildWatermarkText(profile?.name)}
          title={open.title}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
