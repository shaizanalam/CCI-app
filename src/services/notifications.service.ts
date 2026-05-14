import { supabase } from "@/integrations/supabase/client";
import type { ClassLevel } from "@/hooks/use-session";

export async function listNotifications(limit = 200) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id,title,message,target_class,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function createNotification(input: {
  title: string;
  message: string;
  target_class: ClassLevel | null;
}) {
  const { data, error } = await supabase.from("notifications").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteNotificationsByIds(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await supabase.from("notifications").delete().in("id", ids);
  if (error) throw error;
}
