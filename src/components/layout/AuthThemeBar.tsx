import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function AuthThemeBar() {
  return (
    <div className="fixed right-4 top-4 z-40 flex items-center sm:right-6 sm:top-6">
      <ThemeToggle />
    </div>
  );
}
