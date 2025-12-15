
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json(
                { error: 'Server configuration error: API token missing' },
                { status: 500 }
            );
        }

        console.log('Generating video with prompt:', prompt);

        // Using Zeroscope v2 XL (text-to-video)
        const output = await replicate.run(
            "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b8309d6394e38159125a3445809fcb78eccdd74fd7f0",
            {
                input: {
                    prompt: prompt,
                    num_frames: 24,
                    width: 576,
                    height: 320,
                    fps: 12
                }
            }
        );

        console.log('Replicate video output:', output);

        // Output is usually a the URL of the generated video
        let videoUrl = '';
        if (Array.isArray(output) && output.length > 0) {
            videoUrl = String(output[0]);
        } else if (typeof output === 'string') {
            videoUrl = output;
        }

        return NextResponse.json({ videoUrl });

    } catch (error: any) {
        console.error('Video generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate video' },
            { status: 500 }
        );
    }
}
