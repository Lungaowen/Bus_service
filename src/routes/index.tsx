import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const [dest, setDest] = useState<"/login" | "/dashboard" | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("tbs.session.v1");
      setDest(raw ? "/dashboard" : "/login");
    } catch {
      setDest("/login");
    }
  }, []);
  if (!dest) return null;
  return <Navigate to={dest} />;
}
