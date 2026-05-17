import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { listSubjects, createSubject, deleteSubjectCascade } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, FieldLabel } from "@/components/neo/NeoInput";
import { ClassPills } from "@/components/neo/ClassPills";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { EmptyState } from "@/components/neo/EmptyState";
import { IconBadge } from "@/components/neo/IconBadge";
import { ConfirmDestructiveDialog } from "@/components/neo/ConfirmDestructiveDialog";
import { useSession } from "@/hooks/use-session";
import { BookOpen, ChevronRight, FolderOpen, MoreVertical, PlusCircle, Trash2 } from "lucide-react";
import type { ClassLevel } from "@/hooks/use-session";
import {
  defaultStreamAccessForClass,
  formatStreamAccessLabel,
  streamAccessOptionsForAdminClass,
  type StreamAccess,
} from "@/lib/stream-access";
import { NeoSelect } from "@/components/neo/NeoInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/subjects")({
  component: AdminSubjects,
});

function AdminSubjects() {
  const { profile } = useSession();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["subjects-all"], queryFn: () => listSubjects() });
  const [name, setName] = useState("");
  const [cls, setCls] = useState<ClassLevel>("9");
  const [streamAccess, setStreamAccess] = useState<StreamAccess>("all");
  const [loading, setLoading] = useState(false);
  const streamOptions = streamAccessOptionsForAdminClass(cls);
  const [delSubject, setDelSubject] = useState<{ id: string; name: string } | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 80) {
      toast.error("Subject name must be between 1 and 80 characters");
      return;
    }
    setLoading(true);
    try {
      await createSubject(trimmed, cls, streamAccess);
      toast.success("Subject created");
      setName("");
      qc.invalidateQueries({ queryKey: ["subjects-all"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const runDeleteSubject = async () => {
    if (!delSubject) return;
    await deleteSubjectCascade(delSubject.id);
    toast.success("Subject and its materials were deleted");
    qc.invalidateQueries({ queryKey: ["subjects-all"] });
    qc.invalidateQueries({ queryKey: ["recent-materials"] });
    qc.invalidateQueries({ queryKey: ["pending"] });
    qc.invalidateQueries({ queryKey: ["materials"] });
    qc.invalidateQueries({ queryKey: ["subject", delSubject.id] });
  };

  return (
    <div className="space-y-8 pb-4">
      <PremiumHeader avatarLinkTo="/admin" avatarLabel={profile?.name ?? profile?.email ?? "Admin"} />
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">New subject</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a subject once per class. You can upload materials to it anytime.
        </p>
      </div>

      <NeoCard className="p-5 sm:p-6">
        <form onSubmit={onCreate} className="space-y-5">
          <div>
            <FieldLabel>Subject name</FieldLabel>
            <NeoInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics"
              required
            />
          </div>
          <div>
            <FieldLabel>Assign to class</FieldLabel>
            <ClassPills
              value={cls}
              onChange={(c) => {
                setCls(c);
                setStreamAccess(defaultStreamAccessForClass(c));
              }}
              disabled={loading}
            />
          </div>
          <div>
            <FieldLabel>Stream visibility</FieldLabel>
            <NeoSelect
              value={streamAccess}
              onChange={(e) => setStreamAccess(e.target.value as StreamAccess)}
              disabled={loading || streamOptions.length === 1}
            >
              {streamOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NeoSelect>
            <p className="mt-2 text-xs text-muted-foreground">
              {streamOptions.find((o) => o.value === streamAccess)?.hint ??
                "Choose who can see this subject."}
            </p>
          </div>
          <NeoCard variant="muted" className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">{name.trim() || "Subject name"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Class {cls} · {formatStreamAccessLabel(streamAccess)}
              </p>
            </div>
            <IconBadge tone="accent" className="h-12 w-12">
              <BookOpen className="h-5 w-5" />
            </IconBadge>
          </NeoCard>
          <NeoButton type="submit" variant="primary" loading={loading} className="w-full min-h-[52px] gap-2 text-base">
            <PlusCircle className="h-5 w-5" /> Create subject
          </NeoButton>
          <p className="text-center text-xs text-muted-foreground">
            You can add materials to this subject from the Upload tab.
          </p>
        </form>
      </NeoCard>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">All subjects</p>
        <div className="space-y-3">
          {(data ?? []).map((s) => (
            <NeoCard key={s.id} variant="outline" className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
              <IconBadge tone="accent" className="h-11 w-11 shrink-0">
                <BookOpen className="h-5 w-5" />
              </IconBadge>
              <Link
                to="/admin/subjects/$subjectId"
                params={{ subjectId: s.id }}
                className="min-w-0 flex-1 tap-highlight-none rounded-2xl py-1 transition hover:bg-muted/40"
              >
                <p className="font-display font-semibold text-foreground">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  Class {s.class} · {formatStreamAccessLabel(s.stream_access as StreamAccess)} · Manage files
                </p>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <NeoButton
                    type="button"
                    variant="ghost"
                    className="h-11 w-11 shrink-0 rounded-2xl p-0 text-muted-foreground"
                    aria-label="Subject actions"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </NeoButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl border-border/80 p-1 shadow-[var(--shadow-float-value)]">
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/admin/subjects/$subjectId" params={{ subjectId: s.id }} className="flex cursor-pointer items-center gap-2">
                      <FolderOpen className="h-4 w-4" /> Materials
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/admin/upload" className="flex cursor-pointer items-center gap-2">
                      <ChevronRight className="h-4 w-4 rotate-[-90deg]" /> Open upload
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                    onClick={() => setDelSubject({ id: s.id, name: s.name })}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete subject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </NeoCard>
          ))}
          {(data ?? []).length === 0 && (
            <EmptyState title="No subjects yet" description="Create your first subject using the form above." />
          )}
        </div>
      </div>

      <ConfirmDestructiveDialog
        open={!!delSubject}
        onOpenChange={(o) => !o && setDelSubject(null)}
        title="Delete this subject?"
        description={
          delSubject
            ? `Deleting “${delSubject.name}” will also remove all associated materials and their files from storage. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete subject"
        onConfirm={runDeleteSubject}
      />
    </div>
  );
}
