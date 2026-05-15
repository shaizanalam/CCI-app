import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { signOut } from "@/services/auth.service";
import { Hourglass } from "lucide-react";
import { AuthThemeBar } from "@/components/layout/AuthThemeBar";
import { BrandMark } from "@/components/layout/PremiumHeader";

export const Route = createFileRoute("/pending")({
  head: () => ({ meta: [{ title: "Pending approval — CCI Notes" }] }),
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
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12">
      <AuthThemeBar />
      <div className="mb-6">
        <BrandMark className="h-14 w-14 rounded-3xl" />
      </div>
      <div className="mx-auto w-full max-w-md text-center">
        <NeoCard className="p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
            <Hourglass className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Waiting for approval</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your account is ready. An admin from your coaching institute will approve you shortly so
            you can access class materials.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <NeoButton onClick={refresh} className="flex-1 min-h-[52px]">
              Check status
            </NeoButton>
            <NeoButton
              variant="ghost"
              onClick={async () => {
                await signOut();
                navigate({ to: "/login" });
              }}
              className="flex-1 min-h-[52px] border border-border/80"
            >
              Sign out
            </NeoButton>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
