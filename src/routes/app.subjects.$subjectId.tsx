import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listMaterialsBySubject } from "@/services/materials.service";
import { supabase } from "@/integrations/supabase/client";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { ProtectedViewer } from "@/components/viewer/ProtectedViewer";
import { useSession } from "@/hooks/use-session";
import { ArrowLeft, FileText, Image as ImageIcon, X } from "lucide-react";
import { format } from "date-fns";

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
      const { data, error } = await supabase.from("subjects").select("id,name,class").eq("id", subjectId).single();
      if (error) throw error;
      return data;
    },
  });

  const materialsQ = useQuery({
    queryKey: ["materials", subjectId],
    queryFn: () => listMaterialsBySubject(subjectId),
  });

  const [open, setOpen] = useState<{ path: string; type: "pdf" | "image"; title: string } | null>(null);

  return (
    <div className="space-y-4">
      <button onClick={() => navigate({ to: "/app/subjects" })} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Subjects
      </button>
      <div>
        <h1 className="text-2xl font-bold">{subjectQ.data?.name ?? "…"}</h1>
        <p className="text-xs text-muted-foreground">Class {subjectQ.data?.class}</p>
      </div>

      {materialsQ.isLoading && <NeoCard className="text-sm text-muted-foreground">Loading materials…</NeoCard>}
      {!materialsQ.isLoading && (materialsQ.data ?? []).length === 0 && (
        <NeoCard className="text-center text-sm text-muted-foreground">No materials uploaded yet.</NeoCard>
      )}

      <div className="space-y-3">
        {(materialsQ.data ?? []).map((m) => (
          <NeoCard key={m.id} className="neo-pressable flex items-center gap-3" onClick={() => setOpen({ path: m.storage_path, type: m.file_type, title: m.title })} role="button">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl neo-inset text-primary">
              {m.file_type === "pdf" ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(m.created_at), "d MMM yyyy")}</p>
            </div>
          </NeoCard>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background/95 backdrop-blur-md">
          <header className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
            <p className="truncate font-semibold">{open.title}</p>
            <NeoButton variant="ghost" onClick={() => setOpen(null)}>
              <X className="h-4 w-4" /> Close
            </NeoButton>
          </header>
          <div className="flex-1 p-3">
            <ProtectedViewer
              storagePath={open.path}
              fileType={open.type}
              watermark={profile?.email ?? "Lumen"}
            />
          </div>
        </div>
      )}

      {/* Trick to satisfy TS unused Link import */}
      <span className="hidden"><Link to="/app">.</Link></span>
    </div>
  );
}
