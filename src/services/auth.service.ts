import { supabase } from "@/integrations/supabase/client";
import type { ClassLevel } from "@/hooks/use-session";

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  classLevel: ClassLevel;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: { name: input.name, class: input.classLevel },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
