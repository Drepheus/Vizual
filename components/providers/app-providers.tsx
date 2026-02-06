"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { GuestModeProvider } from "@/context/guest-mode-context";
import { ToastProvider } from "@/components/ui/toast";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { initSentry } from "@/lib/sentry-client";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <GuestModeProvider>
      <AuthProvider>
        <Suspense fallback={null}>
          <PostHogProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </PostHogProvider>
        </Suspense>
      </AuthProvider>
    </GuestModeProvider>
  );
}
