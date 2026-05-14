import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { deleteMaterial, listMaterialsBySubject, updateMaterialMeta } from "@/services/materials.service";
import { supabase } from "@/integrations/supabase/client";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, NeoTextarea, FieldLabel } from "@/components/neo/NeoInput";
import { ProtectedViewer } from "@/components/viewer/ProtectedViewer";
import { useSession } from "@/hooks/use-session";
import { DetailHeader } from "@/components/layout/PremiumHeader";
import { EmptyState } from "@/components/neo/EmptyState";
import { ListSkeleton } from "@/components/neo/ListSkeleton";
import { IconBadge } from "@/components/neo/IconBadge";
import { ConfirmDestructiveDialog } from "@/components/neo/ConfirmDestructiveDialog";
import { buildWatermarkText } from "@/lib/watermark";
import { FileText, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/subjects/$subjectId")({
  component: AdminSubjectMaterials,
});

function AdminSubjectMaterials() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const { profile } = useSession();
  const qc = useQueryClient();

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

  const [open, setOpen] = useState<{ path: string; type: "pdf" | "image"; title: string } | null>(null);
  const [edit, setEdit] = useState<{ id: string; title: string; description: string | null } | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [del, setDel] = useState<{ id: string; title: string; path: string } | null>(null);

  const watermarkText = buildWatermarkText(profile?.name);

  const saveEdit = async () => {
    if (!edit) return;
    const t = edit.title.trim();
    if (t.length < 2) {
      toast.error("Title must be at least 2 characters");
      return;
    }
    setEditSaving(true);
    try {
      await updateMaterialMeta(edit.id, {
        title: t,
        description: edit.description?.trim() ? edit.description.trim() : null,
      });
      toast.success("Material updated");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["materials", subjectId] });
      qc.invalidateQueries({ queryKey: ["recent-materials"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update material.");
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!del) return;
    await deleteMaterial(del.id, del.path);
    toast.success("Material deleted");
    setDel(null);
    qc.invalidateQueries({ queryKey: ["materials", subjectId] });
    qc.invalidateQueries({ queryKey: ["recent-materials"] });
    qc.invalidateQueries({ queryKey: ["subjects-all"] });
  };

  return (
    <div className="space-y-5 pb-4">
      <DetailHeader
        title={subjectQ.data?.name ?? "Subject"}
        subtitle={`Class ${subjectQ.data?.class ?? "—"} · Manage uploads`}
        onBack={() => navigate({ to: "/admin/subjects" })}
        backLabel="Back to subjects"
      />

      {materialsQ.isLoading && <ListSkeleton rows={4} />}
      {!materialsQ.isLoading && (materialsQ.data ?? []).length === 0 && (
        <EmptyState title="No materials" description="Upload files from the Upload tab for this subject." />
      )}

      <div className="space-y-3">
        {(materialsQ.data ?? []).map((m) => (
          <NeoCard key={m.id} variant="outline" className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <button
              type="button"
              className="tap-highlight-none flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={() => setOpen({ path: m.storage_path, type: m.file_type, title: m.title })}
            >
              <IconBadge tone={m.file_type === "pdf" ? "pdf" : "image"}>
                {m.file_type === "pdf" ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </IconBadge>
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold text-foreground">{m.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{format(new Date(m.created_at), "d MMM yyyy")}</p>
              </div>
            </button>
            <div className="flex shrink-0 gap-2">
              <NeoButton
                type="button"
                variant="secondary"
                className="min-h-[44px] flex-1 border-border sm:flex-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setEdit({
                    id: m.id,
                    title: m.title,
                    description: m.description ?? null,
                  });
                }}
              >
                <Pencil className="h-4 w-4" /> Edit
              </NeoButton>
              <NeoButton
                type="button"
                variant="default"
                className="min-h-[44px] flex-1 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 sm:flex-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setDel({ id: m.id, title: m.title, path: m.storage_path });
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </NeoButton>
            </div>
          </NeoCard>
        ))}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md rounded-3xl border-border/80 bg-card p-6 shadow-[var(--shadow-float-value)] sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Edit material</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4 py-2">
              <div>
                <FieldLabel>Title</FieldLabel>
                <NeoInput value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <NeoTextarea
                  value={edit.description ?? ""}
                  onChange={(e) => setEdit({ ...edit, description: e.target.value || null })}
                  maxLength={500}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <NeoButton
              type="button"
              variant="primary"
              className="w-full"
              loading={editSaving}
              onClick={() => void saveEdit()}
            >
              Save changes
            </NeoButton>
            <NeoButton type="button" variant="ghost" className="w-full" onClick={() => setEdit(null)}>
              Cancel
            </NeoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDestructiveDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="Delete this material?"
        description={
          del
            ? `“${del.title}” will be removed permanently, including the file in storage. Students will no longer see it.`
            : ""
        }
        confirmLabel="Delete material"
        onConfirm={confirmDelete}
      />

      {open && (
        <ProtectedViewer
          storagePath={open.path}
          fileType={open.type}
          watermark={watermarkText}
          title={open.title}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
