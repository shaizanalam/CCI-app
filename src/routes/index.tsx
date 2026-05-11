import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Premium notes for Class 9–12" },
      { name: "description", content: "Your coaching institute's private library of subjects, PDFs and notifications. Calm, fast, mobile-first." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { session, role, profile, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !session) return;
    if (role === "admin") navigate({ to: "/admin" });
    else if (profile && !profile.approved) navigate({ to: "/pending" });
    else navigate({ to: "/app" });
  }, [loading, session, role, profile, navigate]);

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="neo-surface-sm flex h-12 w-12 items-center justify-center text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Lumen</h1>
            <p className="text-xs text-muted-foreground">Coaching notes, simplified.</p>
          </div>
        </div>

        <NeoCard className="mb-6">
          <h2 className="text-2xl font-bold leading-tight">Premium notes for your class.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Class 9 to 12. PDFs, images and important alerts — all in one calm place, just for your batch.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/login" className="flex-1">
              <NeoButton variant="primary" className="w-full">Sign in</NeoButton>
            </Link>
            <Link to="/signup" className="flex-1">
              <NeoButton className="w-full">Register</NeoButton>
            </Link>
          </div>
        </NeoCard>

        <div className="grid grid-cols-1 gap-4">
          <NeoCard className="flex items-start gap-3">
            <BookOpen className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Class-only access</h3>
              <p className="text-sm text-muted-foreground">You only see your own class's subjects and materials. No noise.</p>
            </div>
          </NeoCard>
          <NeoCard className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Private by default</h3>
              <p className="text-sm text-muted-foreground">Files are protected with signed links and watermarked with your email.</p>
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
