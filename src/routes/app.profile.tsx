import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import { signOut } from "@/services/auth.service";
import { listSubjects } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { IconBadge } from "@/components/neo/IconBadge";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LogOut,
  Mail,
  Bell,
  HelpCircle,
  Shapes,
} from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  component: ProfileScreen,
});

function ProfileScreen() {
  const { profile, role } = useSession();
  const navigate = useNavigate();
  const cls = profile?.class ?? undefined;
  const subjectsQ = useQuery({
    queryKey: ["subjects", cls],
    queryFn: () => listSubjects(cls),
    enabled: !!cls,
  });

  const initial = (profile?.name ?? profile?.email ?? "?").trim().slice(0, 1).toUpperCase() || "?";

  return (
    <div className="space-y-6 pb-4">
      <PremiumHeader
        avatarLinkTo="/app/profile"
        avatarLabel={profile?.name ?? profile?.email ?? "You"}
      />

      <div className="flex flex-col items-center pt-2 text-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-bold text-primary ring-4 ring-card shadow-[var(--shadow-float-sm-value)]">
            {initial}
          </div>
          <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-primary text-white shadow-md">
            <GraduationCap className="h-4 w-4" />
          </span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
          {profile?.name ?? "Student"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Class {profile?.class ?? "—"} · Coaching notes and institute updates
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NeoCard className="p-4 text-center">
          <IconBadge tone="accent" className="mx-auto mb-2 h-11 w-11">
            <BookOpen className="h-5 w-5" />
          </IconBadge>
          <p className="font-display text-2xl font-bold text-primary">
            {subjectsQ.data?.length ?? "—"}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Subjects
          </p>
        </NeoCard>
        <NeoCard className="p-4 text-center">
          <IconBadge tone="primary" className="mx-auto mb-2 h-11 w-11">
            <Shapes className="h-5 w-5" />
          </IconBadge>
          <p className="font-display text-2xl font-bold text-success">
            {profile?.class ?? "—"}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your class
          </p>
        </NeoCard>
      </div>

      <NeoCard variant="outline" className="p-0">
        <ProfileRow
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={profile?.email ?? "—"}
        />
        <div className="h-px bg-border/80" />
        <Link
          to="/app/subjects"
          className="tap-highlight-none flex items-center gap-3 p-4 transition hover:bg-muted/50"
        >
          <IconBadge tone="muted" className="h-10 w-10">
            <BookOpen className="h-4 w-4" />
          </IconBadge>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">My subjects</p>
            <p className="text-xs text-muted-foreground">Browse class materials</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="h-px bg-border/80" />
        <Link
          to="/app/notifications"
          className="tap-highlight-none flex items-center gap-3 p-4 transition hover:bg-muted/50"
        >
          <IconBadge tone="muted" className="h-10 w-10">
            <Bell className="h-4 w-4" />
          </IconBadge>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Alerts</p>
            <p className="text-xs text-muted-foreground">Institute announcements</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="h-px bg-border/80" />
        <div className="flex items-center gap-3 p-4 opacity-80">
          <IconBadge tone="muted" className="h-10 w-10">
            <HelpCircle className="h-4 w-4" />
          </IconBadge>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Help</p>
            <p className="text-xs text-muted-foreground">
              Contact your institute admin for access issues.
            </p>
          </div>
        </div>
      </NeoCard>

      <NeoCard className="relative overflow-hidden border-0 bg-gradient-to-r from-sky-500 via-primary to-indigo-600 p-5 text-white shadow-lg">
        <p className="font-display text-lg font-bold">CCI</p>
        <p className="mt-1 text-sm text-white/85">
          Your account is private and visible only to your institute.
        </p>
      </NeoCard>

      <div className="rounded-2xl border border-border/80 bg-card p-1">
        <p className="px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <IconBadge tone="muted" className="h-9 w-9 text-xs font-semibold">
            {role?.slice(0, 1).toUpperCase()}
          </IconBadge>
          <div className="flex-1 text-sm">
            <p className="font-semibold capitalize text-foreground">{role ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Role on this device</p>
          </div>
        </div>
      </div>

      <NeoButton
        variant="danger"
        className="w-full"
        onClick={async () => {
          await signOut();
          navigate({ to: "/login" });
        }}
      >
        <LogOut className="h-4 w-4" /> Sign out
      </NeoButton>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <IconBadge tone="muted" className="h-10 w-10">
        {icon}
      </IconBadge>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
