import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
  head: () => ({
    meta: [{ title: "Sign Up — Quad" }],
  }),
});

function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.register(form);
      login(data.user, data.token);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 pb-24 pt-20">
      <PageHeader eyebrow="Get started" title="Create your account." />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
            Full Name
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="bg-paper"
          />
        </div>
        
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            className="bg-paper"
          />
        </div>
        
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={6}
            className="bg-paper"
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth/login" className="text-primary hover:underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}