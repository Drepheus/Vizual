import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// This endpoint returns the WebSocket URL with the API key for authenticated users
// The key is stored server-side and never exposed to the client

export async function GET(request: NextRequest) {
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
        { error: "Unauthorized", message: "Please sign in to use live streaming" }, 
        { status: 401 }
      );
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
    const model = searchParams.get('model') || 'lucy_2_rt';

    // Return the WebSocket URL with the API key
    // Models:
    // - lucy_2_rt: Character reference (transform into different character)
    // - mirage_v2: Video restyling (apply artistic styles)
    // - live_avatar: Avatar animation (animate portrait with audio)

    let wsUrl: string;
    let specs: { fps: number; width: number; height: number };

    if (model === 'live_avatar') {
      wsUrl = `wss://api3.decart.ai/v1/live_avatar/stream?api_key=${apiKey}`;
      specs = { fps: 25, width: 1280, height: 720 };
    } else if (model === 'lucy_2_rt') {
      // Lucy 2 RT - for character reference / face swap
      wsUrl = `wss://api3.decart.ai/v1/stream?api_key=${apiKey}&model=${model}`;
      specs = { fps: 25, width: 1280, height: 720 };
    } else {
      // Mirage models - for style transfer
      wsUrl = `wss://api3.decart.ai/v1/stream?api_key=${apiKey}&model=${model}`;
      specs = { fps: 25, width: 1280, height: 704 };
    }

    return NextResponse.json({
      wsUrl,
      model,
      specs
    });
  } catch (error: any) {
    console.error('Decart stream API error:', error);
    return NextResponse.json(
      { error: "Server error", message: error.message || "Failed to initialize stream" },
      { status: 500 }
    );
  }
}
