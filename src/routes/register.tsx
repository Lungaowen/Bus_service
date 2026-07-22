import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TshwaneLogo } from "@/components/tshwane-logo";
import { register } from "@/lib/mock-api";
import { setSession } from "@/lib/auth-store";
import busHero from "@/assets/bus-hero.jpeg.asset.json";
import registerBackground from "@/components/Login and Register.jpeg";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account · Tshwane Bus Services" },
      {
        name: "description",
        content:
          "Create a Tshwane Bus Services account to issue and manage virtual cards for the city bus network.",
      },
      { property: "og:title", content: "Create account · Tshwane Bus Services" },
      {
        property: "og:description",
        content: "Join Tshwane Bus Services and manage your travel card online.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const m = useMutation({
    mutationFn: () => register({ username, email, password }),
    onSuccess: (res) => {
      if (!res.success || !res.data) return toast.error(res.message);
      setSession({ token: res.data.token, user: res.data.user });
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    },
  });

  const canSubmit =
    username.trim().length >= 3 &&
    /.+@.+\..+/.test(email) &&
    password.length >= 6 &&
    password === confirm;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(9,60,32,0.85), rgba(9,60,32,0.55)), url(${registerBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          <h1 className="max-w-md font-display text-5xl font-bold leading-tight">
            Join the journey <span className="text-brand-yellow">forward.</span>
          </h1>
          <p className="mt-3 text-white/85">
            One account for every Tshwane Bus Services ride.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-brand-yellow/80 blur-2xl" />
      </div>

      <div className="flex items-center justify-center bg-card px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="flex justify-center">
            <TshwaneLogo />
          </div>
          <div className="mt-8 flex flex-col items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
              <UserPlus className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              It only takes a minute to get started
            </p>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) m.mutate();
            }}
          >
            <Field
              id="username"
              label="Username"
              value={username}
              onChange={setUsername}
              autoComplete="username"
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <Field
              id="confirm"
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              hint={
                confirm && confirm !== password ? "Passwords don't match" : undefined
              }
            />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>

            <Button
              type="submit"
              disabled={!canSubmit || m.isPending}
              className="h-12 w-full text-base"
            >
              {m.isPending ? "Creating..." : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition focus:border-primary"
      />
      {hint && <p className="mt-1 text-xs text-destructive">{hint}</p>}
    </div>
  );
}
