import { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Receipt, Bell, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TshwaneLogo } from "@/components/tshwane-logo";
import { useAuth } from "@/lib/auth-store";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Payment History", to: "/payment-history", icon: Receipt },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <TshwaneLogo />
        <div className="flex items-center gap-3">
          <button
            aria-label="Profile"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
          >
            <UserRound className="h-5 w-5" />
          </button>
          <button
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              3
            </span>
          </button>
          <Button
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => {
              signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground">
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
