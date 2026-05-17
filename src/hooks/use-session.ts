import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "admin";
export type ClassLevel = "9" | "10" | "11" | "12";
export type StudentStream = "pcm" | "pcb" | "commerce";

export interface Profile {
  id: string;
  name: string;
  email: string;
  class: ClassLevel | null;
  stream: StudentStream | null;
  approved: boolean;
}

export interface SessionState {
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,name,email,class,stream,approved").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(prof as Profile | null);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    setRole(isAdmin ? "admin" : (roles ?? []).length ? "student" : null);
  }, []);

  const refresh = useCallback(async () => {
    if (!session?.user.id) return;
    await loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user.id) {
        // defer to avoid deadlock
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user.id) await loadProfile(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  return { session, profile, role, loading, refresh };
}
