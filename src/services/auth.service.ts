import { supabase } from "@/integrations/supabase/client";
import type { ClassLevel, StudentStream } from "@/hooks/use-session";
import { classNeedsStream } from "@/lib/stream-access";

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  classLevel: ClassLevel;
  stream?: StudentStream;
}) {
  if (classNeedsStream(input.classLevel) && !input.stream) {
    throw new Error("Please select your stream (PCM, PCB, or Commerce).");
  }

  const metadata: Record<string, string> = {
    name: input.name,
    class: input.classLevel,
  };
  if (classNeedsStream(input.classLevel) && input.stream) {
    metadata.stream = input.stream;
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: metadata,
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
