import { Link, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/map", label: "Map" },
  { to: "/rooms", label: "Rooms" },
  { to: "/updates", label: "Updates" },
  { to: "/lost-found", label: "Lost & Found" },
] as const;

export function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-serif text-2xl leading-none text-ink">
          Quad
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.slice(1).map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          
          {isAuthenticated ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-4 w-4" strokeWidth={1.5} />
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="ml-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}