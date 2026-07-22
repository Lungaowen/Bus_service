import { useEffect, useState } from "react";
import type { User } from "./mock-api";

const KEY = "tbs.session.v1";

type Session = { token: string; user: User } | null;

const listeners = new Set<() => void>();

function read(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function getSession(): Session {
  return read();
}

export function setSession(s: Session) {
  if (typeof window === "undefined") return;
  if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
  else window.localStorage.removeItem(KEY);
  emit();
}

export function useAuth() {
  const [session, setState] = useState<Session>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
    const l = () => setState(read());
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) l();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    hydrated,
    signOut: () => setSession(null),
  };
}
