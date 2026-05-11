import { supabase } from "@/integrations/supabase/client";

export async function listPendingStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,class,approved,created_at")
    .eq("approved", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,class,approved,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function approveStudent(id: string) {
  const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", id);
  if (error) throw error;
}

export async function rejectStudent(id: string) {
  // Reject = delete profile (cascades from auth.users requires admin; here we just mark unapproved + remove from list by deletion would need service role).
  // Safer: keep approved=false. We expose a "remove" by deleting the profile row only — auth user remains but cannot access anything.
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
}
