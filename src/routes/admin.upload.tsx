import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listSubjects, uploadMaterial } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, NeoTextarea, NeoSelect, FieldLabel } from "@/components/neo/NeoInput";
import { Upload as UploadIcon, FileText } from "lucide-react";
import type { ClassLevel } from "@/hooks/use-session";

export const Route = createFileRoute("/admin/upload")({
  component: UploadScreen,
});

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

function UploadScreen() {
  const [cls, setCls] = useState<ClassLevel>("9");
  const [subjectId, setSubjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const subjectsQ = useQuery({ queryKey: ["subjects-all"], queryFn: () => listSubjects() });
  const subjectsForClass = useMemo(() => (subjectsQ.data ?? []).filter((s) => s.class === cls), [subjectsQ.data, cls]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file to upload");
    if (!subjectId) return toast.error("Please select a subject for this material");
    if (title.trim().length < 2) return toast.error("Please enter a title with at least 2 characters");
    if (file.size > MAX_BYTES) return toast.error("File size exceeds 25MB limit. Please choose a smaller file.");

    setLoading(true);
    try {
      await uploadMaterial({ file, classLevel: cls, subjectId, title: title.trim(), description: description.trim() || undefined });
      toast.success("Uploaded");
      setTitle(""); setDescription(""); setFile(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed. Please try again or check your file format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Upload material</h1>
      <NeoCard>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <FieldLabel>Class</FieldLabel>
            <NeoSelect value={cls} onChange={(e) => { setCls(e.target.value as ClassLevel); setSubjectId(""); }}>
              {(["9", "10", "11", "12"] as const).map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </NeoSelect>
          </div>
          <div>
            <FieldLabel>Subject</FieldLabel>
            <NeoSelect value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              <option value="">— Select subject —</option>
              {subjectsForClass.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </NeoSelect>
            {subjectsForClass.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">No subjects for this class yet — create one first.</p>
            )}
          </div>
          <div>
            <FieldLabel>Title</FieldLabel>
            <NeoInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 1 — Real numbers" required />
          </div>
          <div>
            <FieldLabel>Description (optional)</FieldLabel>
            <NeoTextarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </div>
          <div>
            <FieldLabel>File (PDF or image, max 25MB)</FieldLabel>
            <label className="neo-inset flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-4 py-8 text-center text-sm text-muted-foreground hover:text-foreground">
              <input
                type="file"
                accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <FileText className="h-4 w-4" /> {file.name}
                </span>
              ) : (
                <>
                  <UploadIcon className="h-6 w-6" />
                  <span>Tap to choose a file</span>
                </>
              )}
            </label>
          </div>
          <NeoButton type="submit" variant="primary" loading={loading} className="w-full">Upload</NeoButton>
        </form>
      </NeoCard>
    </div>
  );
}
