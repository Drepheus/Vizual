import { NextRequest, NextResponse } from 'next/server';
import { trackUsage, logApiCall } from '@/lib/usage-tracking';
import { getUserFromRequest, saveGeneratedMedia } from '@/lib/supabase-server';

// Decart API base URL
const DECART_API_BASE = 'https://api.decart.ai/v1';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { prompt, image, mode = 'remix' } = await req.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required for remix/more-like-this' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DECART_API_KEY;
    if (!apiKey) {
      console.error('DECART_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Decart API key missing' },
        { status: 500 }
      );
    }

    // Get user from auth token (optional)
    const authUser = await getUserFromRequest(req);
    const userId = authUser?.userId;
    const accessToken = authUser?.accessToken;

    console.log(`[Decart Remix] Processing ${mode} request with prompt: "${prompt.substring(0, 50)}..."`);

    // Convert base64 data URL to ArrayBuffer if needed
    let imageArrayBuffer: ArrayBuffer;
    if (image.startsWith('data:')) {
      // Extract base64 data from data URL
      const base64Data = image.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageArrayBuffer = bytes.buffer as ArrayBuffer;
    } else if (image.startsWith('http')) {
      // Fetch the image from URL
      const imageResponse = await fetch(image);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status}`);
      }
      imageArrayBuffer = await imageResponse.arrayBuffer();
    } else {
      // Assume it's already base64
      const binaryString = atob(image);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageArrayBuffer = bytes.buffer as ArrayBuffer;
    }

    // Prepare the form data for Decart API
    const formData = new FormData();
    formData.append('model', 'lucy-pro-i2i');
    formData.append('prompt', prompt);
    
    // Convert ArrayBuffer to Blob for FormData
    const imageBlob = new Blob([imageArrayBuffer], { type: 'image/jpeg' });
    formData.append('image', imageBlob, 'input.jpg');

    // Call Decart API
    const response = await fetch(`${DECART_API_BASE}/image/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Decart Remix] API error:', response.status, errorText);
      
      // Log failed API call
      if (userId) {
        await logApiCall({
          user_id: userId,
          endpoint: 'decart-remix',
          status_code: response.status,
          duration_ms: Date.now() - startTime,
          response_data: { error: errorText }
        });
      }
      
      return NextResponse.json(
        { error: `Decart API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('[Decart Remix] API response:', JSON.stringify(result).substring(0, 200));

    // Extract the output image URL
    let outputUrl = '';
    if (result.output && Array.isArray(result.output) && result.output.length > 0) {
      outputUrl = result.output[0];
    } else if (result.outputs && Array.isArray(result.outputs) && result.outputs.length > 0) {
      outputUrl = result.outputs[0];
    } else if (result.image) {
      outputUrl = result.image;
    } else if (result.url) {
      outputUrl = result.url;
    } else if (typeof result === 'string' && result.startsWith('http')) {
      outputUrl = result;
    }

    if (!outputUrl) {
      console.error('[Decart Remix] Unexpected output format:', result);
      return NextResponse.json(
        { error: 'Unexpected response format from Decart API' },
        { status: 500 }
      );
    }

    // Track usage and log API call
    const duration = Date.now() - startTime;
    if (userId) {
      await trackUsage(userId, 'image_gen');
      await logApiCall({
        user_id: userId,
        endpoint: 'decart-remix',
        status_code: 200,
        duration_ms: duration,
        request_data: { prompt: prompt.substring(0, 100), mode },
        response_data: { url: outputUrl.substring(0, 100) }
      });

      // Save to generated media
      await saveGeneratedMedia(
        userId,
        'image',
        outputUrl,
        prompt,
        'lucy-pro-i2i',
        undefined // No aspectRatio for remix
      );
    }

    console.log(`[Decart Remix] Success! Output URL: ${outputUrl.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      imageUrl: outputUrl,
      url: outputUrl, // Alias for compatibility
      mode,
      model: 'lucy-pro-i2i',
      duration,
    });

  } catch (error: any) {
    console.error('[Decart Remix] Error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to process remix request' },
      { status: 500 }
    );
  }
}
