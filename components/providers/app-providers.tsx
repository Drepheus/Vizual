"use client";

import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { GuestModeProvider } from "@/context/guest-mode-context";
import { ToastProvider } from "@/components/ui/toast";
import { initSentry } from "@/lib/sentry-client";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <GuestModeProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </GuestModeProvider>
  );
}
