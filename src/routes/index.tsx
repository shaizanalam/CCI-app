import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { AuthThemeBar } from "@/components/layout/AuthThemeBar";
import { BrandMark } from "@/components/layout/PremiumHeader";
import { BookOpen, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CCI — Class 9–12 coaching library" },
      {
        name: "description",
        content:
          "Private learning platform for coaching institute students. Class-isolated subjects, materials and notifications.",
      },
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
    <div className="relative min-h-dvh bg-background px-5 py-12">
      <AuthThemeBar />
      <div className="mx-auto max-w-md">
        <div className="mb-10 flex items-center gap-4">
          <BrandMark className="h-14 w-14 rounded-3xl" />
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">CCI</h1>
            <p className="text-sm text-muted-foreground">Coaching notes, simplified.</p>
          </div>
        </div>

        <NeoCard className="mb-8 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold leading-tight text-foreground">
            Premium notes for your class.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Classes 9 to 12. PDFs, images, and institute alerts — calm, fast, and mobile-first.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="flex-1">
              <NeoButton variant="primary" className="w-full min-h-[52px]">
                Sign in
              </NeoButton>
            </Link>
            <Link to="/signup" className="flex-1">
              <NeoButton className="w-full min-h-[52px]">Register</NeoButton>
            </Link>
          </div>
        </NeoCard>

        <div className="grid grid-cols-1 gap-4">
          <NeoCard className="flex items-start gap-4 p-5">
            <IconBadgeStatic>
              <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </IconBadgeStatic>
            <div>
              <h3 className="font-display font-semibold text-foreground">Class-only access</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                You only see subjects and files for your batch.
              </p>
            </div>
          </NeoCard>
          <NeoCard className="flex items-start gap-4 p-5">
            <IconBadgeStatic>
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </IconBadgeStatic>
            <div>
              <h3 className="font-display font-semibold text-foreground">Private by default</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Secure links and watermarks help protect institute IP.
              </p>
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}

function IconBadgeStatic({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
      {children}
    </div>
  );
}
