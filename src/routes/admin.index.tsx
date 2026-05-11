import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPendingStudents } from "@/services/students.service";
import { listSubjects } from "@/services/materials.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { Users, Upload, BookOpen, Megaphone } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const pendingQ = useQuery({ queryKey: ["pending"], queryFn: listPendingStudents });
  const subjectsQ = useQuery({ queryKey: ["subjects-all"], queryFn: () => listSubjects() });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Pending students" value={pendingQ.data?.length ?? "—"} />
        <Stat label="Subjects" value={subjectsQ.data?.length ?? "—"} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ActionCard to="/admin/students" icon={<Users className="h-5 w-5" />} title="Approve students" subtitle="Review pending signups" />
        <ActionCard to="/admin/upload" icon={<Upload className="h-5 w-5" />} title="Upload material" subtitle="PDFs and images" />
        <ActionCard to="/admin/subjects" icon={<BookOpen className="h-5 w-5" />} title="Create subject" subtitle="Per class" />
        <ActionCard to="/admin/notifications" icon={<Megaphone className="h-5 w-5" />} title="Send notification" subtitle="Class or all" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <NeoCard>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
    </NeoCard>
  );
}

function ActionCard({ to, icon, title, subtitle }: { to: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Link to={to}>
      <NeoCard className="neo-pressable h-full">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl neo-inset text-primary">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </NeoCard>
    </Link>
  );
}
