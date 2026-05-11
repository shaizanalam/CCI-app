import { supabase } from "@/integrations/supabase/client";
import type { ClassLevel } from "@/hooks/use-session";

const BUCKET = "materials";

export async function listSubjects(classLevel?: ClassLevel) {
  const q = supabase.from("subjects").select("id,name,class,created_at").order("name");
  const { data, error } = classLevel ? await q.eq("class", classLevel) : await q;
  if (error) throw error;
  return data ?? [];
}

export async function createSubject(name: string, classLevel: ClassLevel) {
  const { data, error } = await supabase
    .from("subjects")
    .insert({ name, class: classLevel })
    .select()
    .single();
  if (error) throw error;
  return data;
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
    // best effort cleanup
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export async function getSignedUrl(storagePath: string, expiresInSec = 60 * 10) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, expiresInSec);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteMaterial(id: string, storagePath: string) {
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
}
