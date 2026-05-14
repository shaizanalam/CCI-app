import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signUp } from "@/services/auth.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, FieldLabel } from "@/components/neo/NeoInput";
import { ClassPills } from "@/components/neo/ClassPills";
import { BrandMark } from "@/components/layout/PremiumHeader";
import type { ClassLevel } from "@/hooks/use-session";
import { Eye, EyeOff, Lock, User, Mail } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — CCI Notes" }] }),
  component: SignupPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
  classLevel: z.enum(["9", "10", "11", "12"]),
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    classLevel: "9" as ClassLevel,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your input and try again");
      return;
    }
    setLoading(true);
    try {
      await signUp(parsed.data);
      toast.success("Account created. Waiting for admin approval.");
      navigate({ to: "/pending" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to create account. Please try again or contact support if the issue persists.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandMark className="h-14 w-14 rounded-3xl" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Join CCI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to start organizing your academic journey.
          </p>
        </div>

        <NeoCard className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <FieldLabel>Full name</FieldLabel>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <NeoInput
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="pl-11"
                  placeholder="As on your school ID"
                  required
                />
              </div>
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <NeoInput
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <NeoInput
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-11 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <FieldLabel>Select class</FieldLabel>
              <ClassPills
                value={form.classLevel}
                onChange={(classLevel) => setForm({ ...form, classLevel })}
              />
            </div>
            <NeoButton
              type="submit"
              variant="primary"
              className="w-full min-h-[52px] text-base"
              loading={loading}
            >
              Create account →
            </NeoButton>
          </form>
          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            Your account activates after an admin from your institute approves you.
          </p>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Have an account?{" "}
            <Link to="/login" className="font-semibold text-primary transition hover:underline">
              Sign in
            </Link>
          </p>
        </NeoCard>
      </div>
    </div>
  );
}
