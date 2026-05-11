import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Bell, User, LayoutDashboard, Users, Upload, Megaphone } from "lucide-react";
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
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { to: "/admin/upload", label: "Upload", icon: Upload },
  { to: "/admin/notifications", label: "Notify", icon: Megaphone },
];

export function BottomNav({ role }: { role: "student" | "admin" }) {
  const tabs = role === "admin" ? adminTabs : studentTabs;
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto flex max-w-2xl justify-around gap-1 border-t border-border/40 bg-background/85 px-2 py-2 backdrop-blur-md">
      {tabs.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || (to !== "/app" && to !== "/admin" && pathname.startsWith(to));
        const exactRoot = (to === "/app" && pathname === "/app") || (to === "/admin" && pathname === "/admin");
        const isActive = active || exactRoot;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex min-w-[60px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition",
              isActive ? "text-primary neo-inset" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
