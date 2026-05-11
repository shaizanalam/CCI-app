import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signUp } from "@/services/auth.service";
import { NeoCard } from "@/components/neo/NeoCard";
import { NeoButton } from "@/components/neo/NeoButton";
import { NeoInput, NeoSelect, FieldLabel } from "@/components/neo/NeoInput";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Lumen" }] }),
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
  const [form, setForm] = useState({ name: "", email: "", password: "", classLevel: "9" as "9" | "10" | "11" | "12" });
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
      toast.error(err instanceof Error ? err.message : "Unable to create account. Please try again or contact support if the issue persists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Join your class</h1>
        <NeoCard>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <FieldLabel>Full name</FieldLabel>
              <NeoInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <NeoInput type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <NeoInput type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <FieldLabel>Class</FieldLabel>
              <NeoSelect value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value as "9" | "10" | "11" | "12" })}>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </NeoSelect>
            </div>
            <NeoButton type="submit" variant="primary" className="w-full" loading={loading}>
              Create account
            </NeoButton>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Your account will activate once an admin approves you.
          </p>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">Sign in</Link>
          </p>
        </NeoCard>
      </div>
    </div>
  );
}
