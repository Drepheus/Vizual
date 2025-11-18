"use client";

import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { initSentry } from "@/lib/sentry-client";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <AuthProvider>{children}</AuthProvider>
  );
}
