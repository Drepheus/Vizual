import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// This endpoint handles Decart API configuration
// The API key should be stored in environment variables

export async function GET() {
  try {
    // Check if user is authenticated
    // Handle cookies() as async (Next.js 15+) or sync (Next.js 13-14)
    const cookieStorePromise = cookies();
    // @ts-ignore - cookies() may be sync or async depending on Next.js version
    const cookieStore = typeof cookieStorePromise.then === 'function' ? await cookieStorePromise : cookieStorePromise;
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to check API status" }, 
        { status: 401 }
      );
    }

    // Return the Decart API status (not the key itself for security)
    const hasApiKey = !!process.env.DECART_API_KEY;

    return NextResponse.json({
      configured: hasApiKey,
      message: hasApiKey
        ? "Decart API is configured"
        : "Decart API key not configured. Add DECART_API_KEY to your environment variables."
    });
  } catch (error: any) {
    console.error('Decart config API error:', error);
    return NextResponse.json(
      { error: "Server error", message: error.message || "Failed to check configuration" },
      { status: 500 }
    );
  }
}
