"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useAuth } from "@/context/auth-context";
import { useGuestMode } from "@/context/guest-mode-context";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/vizual/studio';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const { session, loading } = useAuth();
  const { setGuestMode } = useGuestMode();

  // Check for error in URL
  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      setError(errorMsg);
    }
  }, [searchParams]);

  // Store redirect URL in sessionStorage for OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authRedirectUrl', redirectTo);
    }
  }, [redirectTo]);

  useEffect(() => {
    if (session) {
      router.replace(redirectTo);
    }
  }, [router, session, redirectTo]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  // State for email form
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  const handleEmailAuth = async () => {
    if (!emailInput.trim() || !passwordInput.trim()) return;
    if (isSignUp && !fullNameInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setEmailMessage("");

    try {
      if (isSignUp) {
        // Sign Up
        const { error } = await supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
          options: {
            data: {
              full_name: fullNameInput,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        setEmailMessage("Account created! Check your email to confirm.");
        setEmailSent(true);
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput,
        });

        if (error) throw error;
        // Successful login will be handled by useEffect
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };



  if (loading || session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20" />

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-3xl blur-xl" />

        <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              Welcome to Vizual
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to create stunning AI-generated content
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Email Sign In/Up */}
            <div className="space-y-3 pt-3">
              {!emailSent ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-[#0a0a0a] px-2 text-gray-500">or sign in with email</span>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                      className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      type="button"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleEmailAuth}
                    disabled={isLoading || !emailInput || !passwordInput || (isSignUp && !fullNameInput)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>

                  {emailMessage && (
                    <p className="text-xs text-center text-green-400">
                      {emailMessage}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setEmailMessage("");
                        setError(null);
                      }}
                      className="hover:text-white transition-colors underline mx-auto"
                    >
                      {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                  <p className="text-green-400 font-medium mb-2">Check your inbox!</p>
                  <p className="text-gray-400 text-sm">{emailMessage}</p>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="mt-3 text-sm text-gray-500 hover:text-white transition-colors underline"
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-gray-400 hover:text-white underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-gray-400 hover:text-white underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
