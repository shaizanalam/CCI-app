import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listSubjects, uploadMaterial } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, NeoTextarea, NeoSelect, FieldLabel } from "@/components/neo/NeoInput";
import { ClassPills } from "@/components/neo/ClassPills";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { useSession } from "@/hooks/use-session";
import { FileUploadPicker } from "@/components/neo/FileUploadPicker";
import type { ClassLevel } from "@/hooks/use-session";

export const Route = createFileRoute("/admin/upload")({
  component: UploadScreen,
});

const MAX_BYTES = 25 * 1024 * 1024;

function UploadScreen() {
  const { profile } = useSession();
  const [cls, setCls] = useState<ClassLevel>("9");
  const [subjectId, setSubjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const subjectsQ = useQuery({ queryKey: ["subjects-all"], queryFn: () => listSubjects() });
  const subjectsForClass = useMemo(
    () => (subjectsQ.data ?? []).filter((s) => s.class === cls),
    [subjectsQ.data, cls],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file to upload");
    if (!subjectId) return toast.error("Please select a subject for this material");
    if (title.trim().length < 2)
      return toast.error("Please enter a title with at least 2 characters");
    if (file.size > MAX_BYTES)
      return toast.error("File size exceeds 25MB limit. Please choose a smaller file.");

    setLoading(true);
    try {
      await uploadMaterial({
        file,
        classLevel: cls,
        subjectId,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Uploaded");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Upload failed. Please try again or check your file format.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-4">
      <PremiumHeader
        avatarLinkTo="/admin"
        avatarLabel={profile?.name ?? profile?.email ?? "Admin"}
      />
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Upload material
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add PDFs or images for a class and subject. Maximum file size 25MB.
        </p>
      </div>

      <NeoCard className="space-y-6 p-5 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <FieldLabel>Select class</FieldLabel>
            <ClassPills
              value={cls}
              onChange={(c) => {
                setCls(c);
                setSubjectId("");
              }}
            />
          </div>
          <div>
            <FieldLabel>Subject</FieldLabel>
            <NeoSelect value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              <option value="">Choose a subject…</option>
              {subjectsForClass.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NeoSelect>
            {subjectsForClass.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                No subjects for this class yet — create one in Subjects first.
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Material title</FieldLabel>
            <NeoInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Calculus basics — Chapter 1"
              required
            />
          </div>
          <div>
            <FieldLabel>Description (optional)</FieldLabel>
            <NeoTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Short note for students (optional)"
            />
          </div>
          <div>
            <FieldLabel>Upload file</FieldLabel>
            <FileUploadPicker file={file} onChange={setFile} maxBytes={MAX_BYTES} />
          </div>
          <NeoButton
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full min-h-[52px] text-base"
          >
            Upload now
          </NeoButton>
        </form>
      </NeoCard>
    </div>
  );
}
