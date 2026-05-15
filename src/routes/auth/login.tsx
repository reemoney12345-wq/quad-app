import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Login — Quad" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(form);
      login(data.user, data.token);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 pb-24 pt-20">
      <PageHeader eyebrow="Welcome back" title="Log in to Quad." />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
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
            className="bg-paper"
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
}