import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { signOut } from "@/services/auth.service";
import { Hourglass } from "lucide-react";

export const Route = createFileRoute("/pending")({
  head: () => ({ meta: [{ title: "Pending approval — Lumen" }] }),
  component: PendingPage,
});

function PendingPage() {
  const { session, profile, role, loading, refresh } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (role === "admin") navigate({ to: "/admin" });
    else if (profile?.approved) navigate({ to: "/app" });
  }, [loading, session, profile, role, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-md text-center">
        <NeoCard>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full neo-inset text-primary">
            <Hourglass className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold">Waiting for approval</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account has been created. An admin from your coaching institute will approve you shortly.
          </p>
          <div className="mt-6 flex gap-3">
            <NeoButton onClick={refresh} className="flex-1">Check status</NeoButton>
            <NeoButton variant="ghost" onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="flex-1">Sign out</NeoButton>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
