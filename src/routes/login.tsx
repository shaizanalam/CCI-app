import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signIn } from "@/services/auth.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, FieldLabel } from "@/components/neo/NeoInput";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Lumen" }] }),
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
      toast.error(err instanceof Error ? err.message : "Unable to sign in. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Welcome back</h1>
        <NeoCard>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <FieldLabel>Email</FieldLabel>
              <NeoInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <NeoInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <NeoButton type="submit" variant="primary" className="w-full" loading={loading}>
              Sign in
            </NeoButton>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-primary">Create an account</Link>
          </p>
        </NeoCard>
      </div>
    </div>
  );
}
