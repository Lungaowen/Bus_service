import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isAuthenticated, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster />
    </>
  );
}
