import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// This endpoint returns the WebSocket URL with the API key for authenticated users
// The key is stored server-side and never exposed to the client

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DECART_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: "Decart API key not configured",
      message: "Add DECART_API_KEY to your environment variables"
    }, { status: 503 });
  }

  // Get the model type from query params
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') || 'mirage';

  // Return the WebSocket URL with the API key
  // For Video Restyling: model = 'mirage' or 'mirage_v2'
  // For Avatar Live: model = 'live_avatar'
  
  let wsUrl: string;
  
  if (model === 'live_avatar') {
    wsUrl = `wss://api3.decart.ai/v1/live_avatar/stream?api_key=${apiKey}`;
  } else {
    wsUrl = `wss://api3.decart.ai/v1/stream?api_key=${apiKey}&model=${model}`;
  }

  return NextResponse.json({
    wsUrl,
    model,
    specs: model === 'live_avatar' 
      ? { fps: 25, width: 1280, height: 720 }
      : { fps: 25, width: 1280, height: 704 }
  });
}
