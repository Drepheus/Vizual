import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// This endpoint handles Decart API configuration
// The API key should be stored in environment variables

export async function GET() {
  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return the Decart API status (not the key itself for security)
  const hasApiKey = !!process.env.DECART_API_KEY;
  
  return NextResponse.json({
    configured: hasApiKey,
    message: hasApiKey 
      ? "Decart API is configured" 
      : "Decart API key not configured. Add DECART_API_KEY to your environment variables."
  });
}
