import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'wavespeed';
import { trackUsage, logApiCall } from '@/lib/usage-tracking';

// Model ID mapping - maps our internal IDs to Wavespeed model paths
const MODEL_MAP: Record<string, string> = {
    // Free tier models
    'flux-schnell': 'wavespeed-ai/flux-schnell',
    'p-image': 'wavespeed-ai/flux-dev', // PrunaAI uses Flux Dev as closest match
    'imagen-4-fast': 'google/google-imagen4-fast',
    'imagen-3-fast': 'google/google-imagen3-fast',
    'ideogram-v3-turbo': 'ideogram-ai/ideogram-ai-ideogram-v3-turbo',
    'seedream-4': 'bytedance/bytedance-seedream-v4',
    // Premium models (require subscription)
    'flux-1.1-pro-ultra': 'wavespeed-ai/flux-1.1-pro-ultra',
    'imagen-4-ultra': 'google/google-imagen4-ultra',
    'seedream-4.5': 'bytedance/bytedance-seedream-v4.5',
    'nano-banana-pro': 'google/google-nano-banana-pro-text-to-image',
};

// Initialize Wavespeed client
function getWavespeedClient() {
    const apiKey = process.env.WAVESPEED_API_KEY;
    if (!apiKey) {
        throw new Error('WAVESPEED_API_KEY is not set');
    }
    return new Client(apiKey);
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const { prompt, aspectRatio = '16:9', model = 'flux-schnell' } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        if (!process.env.WAVESPEED_API_KEY) {
            console.error('WAVESPEED_API_KEY is not set');
            return NextResponse.json(
                { error: 'Server configuration error: API token missing' },
                { status: 500 }
            );
        }

        // Get the Wavespeed model path
        const wavespeedModel = MODEL_MAP[model] || MODEL_MAP['flux-schnell'];

        console.log(`Generating image with model: ${wavespeedModel}, prompt: ${prompt}`);

        const client = getWavespeedClient();

        // Run the model with Wavespeed SDK
        const output = await client.run(wavespeedModel, {
            prompt: prompt,
            aspect_ratio: aspectRatio,
            // Additional parameters supported by most image models
            num_outputs: 1,
        }, {
            timeout: 300, // 5 minute timeout
            pollInterval: 2.0, // Check every 2 seconds
        });

        console.log('Wavespeed output:', output);

        // Extract the image URL from the output
        let imageUrl = '';

        if (output && output.outputs && Array.isArray(output.outputs) && output.outputs.length > 0) {
            imageUrl = output.outputs[0];
        } else if (output && output.output && Array.isArray(output.output) && output.output.length > 0) {
            imageUrl = output.output[0];
        } else if (typeof output === 'string') {
            imageUrl = output;
        } else {
            console.error('Unexpected output format from Wavespeed:', JSON.stringify(output));
            return NextResponse.json({ error: 'Failed to parse generation output' }, { status: 500 });
        }

        // Track usage in background (don't await to avoid blocking response)
        logApiCall({
            endpoint: '/api/generate-image',
            status_code: 200,
            duration_ms: Date.now() - startTime,
            request_data: { prompt_length: prompt.length, aspect_ratio: aspectRatio, model },
            response_data: { success: true }
        }).catch(err => console.error('API logging error:', err));

        return NextResponse.json({ imageUrl, model: wavespeedModel });

    } catch (error: any) {
        console.error('Image generation error:', error);

        // Log error
        logApiCall({
            endpoint: '/api/generate-image',
            status_code: 500,
            duration_ms: Date.now() - startTime,
            request_data: { error: error.message || 'Unknown' }
        }).catch(err => console.error('API logging error:', err));

        return NextResponse.json(
            { error: error.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
}
