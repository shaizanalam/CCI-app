import { supabase } from "@/integrations/supabase/client";
import type { ClassLevel } from "@/hooks/use-session";

export async function listNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("id,title,message,target_class,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
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
