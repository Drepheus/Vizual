import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'wavespeed';
import { trackUsage, logApiCall } from '@/lib/usage-tracking';

// Video Model ID mapping - maps our internal IDs to Wavespeed model paths
const VIDEO_MODEL_MAP: Record<string, string> = {
    // Free tier models
    'seedance-1-pro-fast': 'bytedance/seedance-v1-pro-fast/text-to-video',
    'seedance-1-lite': 'bytedance/seedance-v1-lite/text-to-video',
    // Premium models (require subscription)
    'seedance-1-pro': 'bytedance/bytedance-seedance-v1-pro-t2v-1080p',
    'wan-2.5-i2v': 'alibaba/alibaba-wan-2.5-image-to-video',
    'wan-2.5-t2v': 'alibaba/alibaba-wan-2.5-text-to-video',
    'wan-2.5-t2v-fast': 'wavespeed-ai/wan-2.1-t2v-720p-ultra-fast',
    'wan-2.1-t2v-720p': 'wavespeed-ai/wan-2.1-t2v-720p',
    'wan-2.1-i2v-720p': 'wavespeed-ai/wan-2.1-i2v-720p',
    'pixverse-v4.5': 'pixverse/pixverse-pixverse-v4.5-t2v',
    'kling-v2.5-turbo-pro': 'kwaivgi/kwaivgi-kling-v2.5-turbo-pro-text-to-video',
    'hailuo-2.3-fast': 'minimax/minimax-hailuo-2.3-fast',
    'hailuo-2.3': 'minimax/minimax-hailuo-2.3-t2v-pro',
    'sora-2': 'openai/openai-sora-2-text-to-video',
    'veo-3-fast': 'google/google-veo3-fast',
    'veo-3.1-fast': 'google/google-veo3.1-fast-text-to-video',
    'veo-3': 'google/google-veo3',
    'veo-3.1': 'google/google-veo3.1-text-to-video',
    'veo-2': 'google/google-veo2',
};

// Image-to-Video model mapping (for when user provides a reference image)
const I2V_MODEL_MAP: Record<string, string> = {
    'seedance-1-pro-fast': 'bytedance/seedance-v1-pro-fast/image-to-video',
    'seedance-1-lite': 'bytedance/seedance-v1-lite/image-to-video',
    'seedance-1-pro': 'bytedance/seedance-v1-pro/image-to-video',
    'wan-2.5-i2v': 'alibaba/alibaba-wan-2.5-image-to-video',
    'wan-2.1-i2v-720p': 'wavespeed-ai/wan-2.1-i2v-720p',
    'kling-v2.5-turbo-pro': 'kwaivgi/kwaivgi-kling-v2.5-turbo-pro-image-to-video',
    'hailuo-2.3': 'minimax/minimax-hailuo-2.3-i2v-pro',
    'veo-3-fast': 'google/google-veo3-fast-image-to-video',
    'veo-3.1-fast': 'google/google-veo3.1-fast-image-to-video',
    'veo-3': 'google/google-veo3-image-to-video',
    'veo-3.1': 'google/google-veo3.1-image-to-video',
    'veo-2': 'google/google-veo2-image-to-video',
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
        const {
            prompt,
            model = 'seedance-1-pro-fast',
            aspectRatio = '16:9',
            duration = 5, // Duration in seconds
            imageUrl = null, // Optional reference image for I2V
        } = await req.json();

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

        // Determine if this is Image-to-Video or Text-to-Video
        const isImageToVideo = !!imageUrl;
        const modelMap = isImageToVideo ? I2V_MODEL_MAP : VIDEO_MODEL_MAP;

        // Get the Wavespeed model path
        const wavespeedModel = modelMap[model] || VIDEO_MODEL_MAP['seedance-1-pro-fast'];

        console.log(`Generating video with model: ${wavespeedModel}, prompt: ${prompt}, duration: ${duration}s`);

        const client = getWavespeedClient();

        // Build input parameters
        const inputParams: Record<string, any> = {
            prompt: prompt,
            aspect_ratio: aspectRatio,
            duration: duration,
        };

        // Add image URL for Image-to-Video models
        if (isImageToVideo && imageUrl) {
            inputParams.image = imageUrl;
            inputParams.image_url = imageUrl; // Some models use different param names
        }

        // Run the model with Wavespeed SDK
        const output = await client.run(wavespeedModel, inputParams, {
            timeout: 600, // 10 minute timeout for video generation
            pollInterval: 3.0, // Check every 3 seconds
        });

        console.log('Wavespeed video output:', output);

        // Extract the video URL from the output
        let videoUrl = '';

        if (output && output.outputs && Array.isArray(output.outputs) && output.outputs.length > 0) {
            videoUrl = output.outputs[0];
        } else if (output && output.output && Array.isArray(output.output) && output.output.length > 0) {
            videoUrl = output.output[0];
        } else if (output && output.video_url) {
            videoUrl = output.video_url;
        } else if (typeof output === 'string') {
            videoUrl = output;
        } else {
            console.error('Unexpected output format from Wavespeed:', JSON.stringify(output));
            return NextResponse.json({ error: 'Failed to parse generation output' }, { status: 500 });
        }

        // Log API call in background (don't await)
        logApiCall({
            endpoint: '/api/generate-video',
            status_code: 200,
            duration_ms: Date.now() - startTime,
            request_data: { prompt_length: prompt.length, model, duration, isImageToVideo },
            response_data: { success: true }
        }).catch(err => console.error('API logging error:', err));

        return NextResponse.json({
            videoUrl,
            model: wavespeedModel,
            duration,
            isImageToVideo
        });

    } catch (error: any) {
        console.error('Video generation error:', error);

        // Log error
        logApiCall({
            endpoint: '/api/generate-video',
            status_code: 500,
            duration_ms: Date.now() - startTime,
            request_data: { error: error.message || 'Unknown' }
        }).catch(err => console.error('API logging error:', err));

        return NextResponse.json(
            { error: error.message || 'Failed to generate video' },
            { status: 500 }
        );
    }
}
