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
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }
  if (!profile.approved || role === "admin") return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto max-w-2xl px-5 pt-6">
        <Outlet />
      </main>
      <BottomNav role="student" />
    </div>
  );
}
