import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPendingStudents } from "@/services/students.service";
import { listSubjects } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { PremiumHeader } from "@/components/layout/PremiumHeader";
import { useSession } from "@/hooks/use-session";
import { Users, Upload, BookOpen, Megaphone, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { profile } = useSession();
  const pendingQ = useQuery({ queryKey: ["pending"], queryFn: listPendingStudents });
  const subjectsQ = useQuery({ queryKey: ["subjects-all"], queryFn: () => listSubjects() });
  const pending = pendingQ.data?.length ?? 0;

  return (
    <div className="space-y-8 pb-4">
      <PremiumHeader
        avatarLinkTo="/admin"
        avatarLabel={profile?.name ?? profile?.email ?? "Admin"}
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Approve students, publish subjects, upload materials, and send alerts.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Pending students"
          value={pendingQ.isLoading ? "…" : String(pending)}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="purple"
        />
        <Stat
          label="Total subjects"
          value={subjectsQ.isLoading ? "…" : String(subjectsQ.data?.length ?? 0)}
          icon={<BookOpen className="h-5 w-5" />}
          tone="green"
        />
      </div>

      <Link to="/admin/students">
        <div className="tap-highlight-none neo-pressable relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-indigo-600 p-6 text-white shadow-lg shadow-primary/25">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            Queue
          </p>
          <p className="mt-2 font-display text-2xl font-bold">{pending} pending approvals</p>
          <p className="mt-2 text-sm text-white/85">
            Review new student signups in one tap-friendly list.
          </p>
          <span className="mt-5 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            Open student queue
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <ActionCard
          to="/admin/students"
          icon={<Users className="h-5 w-5" />}
          title="Students"
          subtitle="Approve or remove"
        />
        <ActionCard
          to="/admin/upload"
          icon={<Upload className="h-5 w-5" />}
          title="Upload"
          subtitle="PDFs & images"
        />
        <ActionCard
          to="/admin/subjects"
          icon={<BookOpen className="h-5 w-5" />}
          title="Subjects"
          subtitle="Create per class"
        />
        <ActionCard
          to="/admin/notifications"
          icon={<Megaphone className="h-5 w-5" />}
          title="Alerts"
          subtitle="Notify batches"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: "purple" | "green";
}) {
  const ring = tone === "purple" ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-600";
  return (
    <NeoCard className="p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${ring}`}>
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-bold text-foreground">{value}</p>
    </NeoCard>
  );
}

function ActionCard({
  to,
  icon,
  title,
  subtitle,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link to={to}>
      <NeoCard className="tap-highlight-none neo-pressable h-full p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-primary">
          {icon}
        </div>
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </NeoCard>
    </Link>
  );
}
