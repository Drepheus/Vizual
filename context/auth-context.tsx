"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { identifyUser, resetUser, trackSignIn, trackSignOut } from "@/lib/posthog";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange> | null =
      null;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .finally(() => setLoading(false));

    // Safety timeout: if Supabase takes too long, stop loading so UI is interactive
    const timer = setTimeout(() => {
      setLoading(false);
    }, 8000);



    subscription = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      
      // Track auth events in PostHog
      if (_event === 'SIGNED_IN' && nextSession?.user) {
        const u = nextSession.user;
        identifyUser(u.id, {
          email: u.email,
          name: u.user_metadata?.name,
          auth_provider: u.app_metadata?.provider,
        });
        trackSignIn(
          u.app_metadata?.provider === 'google' ? 'google' : 'email',
          u.email
        );
      } else if (_event === 'SIGNED_OUT') {
        trackSignOut();
        resetUser();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription?.data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({ session, user, loading }),
    [loading, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
