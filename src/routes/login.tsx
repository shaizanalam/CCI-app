import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signIn } from "@/services/auth.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, FieldLabel } from "@/components/neo/NeoInput";
import { BrandMark } from "@/components/layout/PremiumHeader";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — CCI Notes" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your input and try again");
      return;
    }
    setLoading(true);
    try {
      await signIn(parsed.data.email, parsed.data.password);
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your credentials and try again.",
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
          <h1 className="font-display text-2xl font-bold text-foreground">CCI Notes</h1>
          <p className="mt-2 text-sm text-muted-foreground">Simplicity in learning.</p>
        </div>

        <NeoCard className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <FieldLabel>Email or phone (email)</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <NeoInput
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <FieldLabel className="mb-0">Password</FieldLabel>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <NeoInput
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-12"
                  placeholder="Enter your password"
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
            <NeoButton
              type="submit"
              variant="primary"
              className="w-full min-h-[52px] text-base"
              loading={loading}
            >
              Sign in
            </NeoButton>
          </form>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-primary transition hover:underline">
              Create an account
            </Link>
          </p>
        </NeoCard>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
          <span className="h-px w-8 bg-border" />
          Secure academic portal
          <span className="h-px w-8 bg-border" />
        </p>
      </div>
    </div>
  );
}
