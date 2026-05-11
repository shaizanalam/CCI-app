import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { signOut } from "@/services/auth.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { Mail, GraduationCap, User as UserIcon, LogOut } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  component: ProfileScreen,
});

function ProfileScreen() {
  const { profile, role } = useSession();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <NeoCard className="space-y-3">
        <Row icon={<UserIcon className="h-4 w-4" />} label="Name" value={profile?.name ?? "—"} />
        <Row icon={<Mail className="h-4 w-4" />} label="Email" value={profile?.email ?? "—"} />
        <Row icon={<GraduationCap className="h-4 w-4" />} label="Class" value={profile?.class ? `Class ${profile.class}` : "—"} />
        <Row icon={<UserIcon className="h-4 w-4" />} label="Role" value={role ?? "—"} />
      </NeoCard>
      <NeoButton variant="danger" className="w-full" onClick={async () => { await signOut(); navigate({ to: "/login" }); }}>
        <LogOut className="h-4 w-4" /> Sign out
      </NeoButton>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl neo-inset text-primary">{icon}</div>
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
