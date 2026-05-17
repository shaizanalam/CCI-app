import { supabase } from "@/integrations/supabase/client";
import type { ClassLevel } from "@/hooks/use-session";
import type { StreamAccess } from "@/lib/stream-access";
import { defaultStreamAccessForClass } from "@/lib/stream-access";

const BUCKET = "materials";

const SUBJECT_COLUMNS = "id,name,class,stream_access,created_at";

export async function listSubjects(classLevel?: ClassLevel) {
  const q = supabase.from("subjects").select(SUBJECT_COLUMNS).order("name");
  const { data, error } = classLevel ? await q.eq("class", classLevel) : await q;
  if (error) throw error;
  return data ?? [];
}

export async function createSubject(
  name: string,
  classLevel: ClassLevel,
  streamAccess?: StreamAccess,
) {
  const access = streamAccess ?? defaultStreamAccessForClass(classLevel);
  const { data, error } = await supabase
    .from("subjects")
    .insert({ name, class: classLevel, stream_access: access })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Removes every material file for a subject, then deletes the subject row. Admin-only via RLS. */
export async function deleteSubjectCascade(subjectId: string) {
  const { data: mats, error } = await supabase.from("materials").select("id, storage_path").eq("subject_id", subjectId);
  if (error) throw error;
  for (const m of mats ?? []) {
    await deleteMaterial(m.id, m.storage_path);
  }
  const { error: delSub } = await supabase.from("subjects").delete().eq("id", subjectId);
  if (delSub) throw delSub;
}

export async function listMaterialsBySubject(subjectId: string) {
  const { data, error } = await supabase
    .from("materials")
    .select("id,title,description,storage_path,file_type,created_at,subject_id")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listRecentMaterials(limit = 5) {
  const { data, error } = await supabase
    .from("materials")
    .select("id,title,file_type,created_at,subject_id,subjects(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function uploadMaterial(args: {
  file: File;
  classLevel: ClassLevel;
  subjectId: string;
  title: string;
  description?: string;
}) {
  const ext = args.file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const fileType: "pdf" | "image" = ext === "pdf" ? "pdf" : "image";
  const safe = args.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${args.classLevel}/${args.subjectId}/${Date.now()}-${safe}`;

  const up = await supabase.storage.from(BUCKET).upload(path, args.file, {
    contentType: args.file.type || undefined,
    upsert: false,
  });
  if (up.error) throw up.error;

  const { data, error } = await supabase
    .from("materials")
    .insert({
      class: args.classLevel,
      subject_id: args.subjectId,
      title: args.title,
      description: args.description ?? null,
      storage_path: path,
      file_type: fileType,
    })
    .select()
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export async function updateMaterialMeta(id: string, input: { title: string; description: string | null }) {
  const { error } = await supabase
    .from("materials")
    .update({
      title: input.title.trim(),
      description: input.description,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function getSignedUrl(storagePath: string, expiresInSec = 60 * 10) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, expiresInSec);
  if (error) throw error;
  return data.signedUrl;
}

/** Deletes storage object first, then DB row. Admin-only via RLS. */
export async function deleteMaterial(id: string, storagePath: string) {
  const { error: st } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (st) throw st;
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
}
