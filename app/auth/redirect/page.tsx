"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Check for stored redirect URL from login page
    const storedRedirect = sessionStorage.getItem('authRedirectUrl');
    sessionStorage.removeItem('authRedirectUrl');

    // Redirect to stored URL or default to studio
    const redirectTo = storedRedirect || '/vizual/studio';
    router.replace(redirectTo);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Redirecting...</p>
      </div>
    </div>
  );
}
