import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Home,
  LayoutDashboard,
  Megaphone,
  Upload,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface Tab {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const studentTabs: Tab[] = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/subjects", label: "Subjects", icon: BookOpen },
  { to: "/app/notifications", label: "Alerts", icon: Bell },
  { to: "/app/profile", label: "Profile", icon: User },
];

const adminTabs: Tab[] = [
  { to: "/admin", label: "Home", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/upload", label: "Upload", icon: Upload },
  { to: "/admin/notifications", label: "Alerts", icon: Megaphone },
];

export function BottomNav({ role }: { role: "student" | "admin" }) {
  const tabs = role === "admin" ? adminTabs : studentTabs;
  const { pathname } = useLocation();

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div
        className={cn(
          "pointer-events-auto flex max-w-2xl flex-1 items-stretch gap-0.5 rounded-[1.35rem] border border-border/70 bg-card/95 px-1.5 py-1.5 shadow-[var(--shadow-float-value)] backdrop-blur-md supports-[backdrop-filter]:bg-card/90",
          role === "admin" ? "overflow-x-auto scrollbar-none" : "",
        )}
      >
        {tabs.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/app"
              ? pathname === "/app"
              : to === "/admin"
                ? pathname === "/admin"
                : pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "tap-highlight-none neo-pressable flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1 text-[10px] font-semibold transition-colors",
                role === "admin" && "min-w-[4.25rem] shrink-0 flex-none",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-current",
                )}
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.85} />
              </span>
              <span className="max-w-[4.5rem] truncate leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
