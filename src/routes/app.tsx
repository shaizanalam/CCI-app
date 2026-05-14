import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { session, profile, role, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
    else if (profile && !profile.approved) navigate({ to: "/pending" });
  }, [loading, session, role, profile, navigate]);

  if (loading || !session || !profile) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading your workspace…</p>
      </div>
    );
  }
  if (!profile.approved || role === "admin") return null;

  return (
    <div className="min-h-dvh bg-background pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
      <main className="mx-auto max-w-2xl px-5 pt-5 sm:px-6 sm:pt-8">
        <Outlet />
      </main>
      <BottomNav role="student" />
    </div>
  );
}
