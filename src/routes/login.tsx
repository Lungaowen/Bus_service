import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UserRound, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TshwaneLogo } from "@/components/tshwane-logo";
import { login } from "@/lib/mock-api";
import { setSession } from "@/lib/auth-store";
import busHero from "@/assets/bus-hero.jpeg.asset.json";
import loginBackground from "@/components/Login and Register.jpeg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Tshwane Bus Services" },
      {
        name: "description",
        content:
          "Sign in to your Tshwane Bus Services account to manage your virtual card, top up and view payment history.",
      },
      { property: "og:title", content: "Sign in · Tshwane Bus Services" },
      {
        property: "og:description",
        content:
          "Reliable. Accessible. Sustainable. Manage your Tshwane Bus Services card online.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("mpho@example.com");
  const [password, setPassword] = useState("password");

  const m = useMutation({
    mutationFn: () => login({ email: identifier, password }),
    onSuccess: (res) => {
      if (!res.success || !res.data) return toast.error(res.message);
      setSession({ token: res.data.token, user: res.data.user });
      toast.success(`Welcome back, ${res.data.user.username}`);
      navigate({ to: "/dashboard" });
    },
  });

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left hero */}
      <div
        className="relative hidden overflow-hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(9,60,32,0.85), rgba(9,60,32,0.55)), url(${loginBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          <h1 className="max-w-md font-display text-5xl font-bold leading-tight">
            Moving Tshwane forward,{" "}
            <span className="text-brand-yellow">together.</span>
          </h1>
          <p className="mt-3 text-white/85">Reliable. Accessible. Sustainable.</p>

          <div className="mt-8 max-w-sm rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white">
                i
              </div>
              <div>
                <div className="font-semibold">Welcome to Tshwane Bus Services</div>
                <p className="text-sm text-white/80">
                  Please sign in to continue to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* decorative yellow orb */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-brand-yellow/80 blur-2xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-card px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="flex justify-center">
            <TshwaneLogo />
          </div>
          <div className="mt-8 flex flex-col items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
              <UserRound className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to access your account</p>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!identifier.trim() || !password) return;
              m.mutate();
            }}
          >
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition focus:border-primary"
              />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create an Account
              </Link>
            </p>

            <Button
              type="submit"
              disabled={m.isPending}
              className="h-12 w-full gap-2 text-base"
            >
              <Lock className="h-4 w-4" />
              {m.isPending ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo credentials pre-filled — click Sign in to continue.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
