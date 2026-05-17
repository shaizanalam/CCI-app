import { supabase } from "@/integrations/supabase/client";

export async function listPendingStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,class,stream,approved,created_at")
    .eq("approved", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,class,stream,approved,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function approveStudent(id: string) {
  const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", id);
  if (error) throw error;
}

export async function deleteStudentProfile(id: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
}

/** @deprecated Use deleteStudentProfile — kept for existing imports */
export const rejectStudent = deleteStudentProfile;
