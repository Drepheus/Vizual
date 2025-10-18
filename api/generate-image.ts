import Replicate from 'replicate';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: Request) {
  console.log('=== IMAGE GENERATION API CALLED ===');
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, aspectRatio = '3:2' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.error('Missing REPLICATE_API_TOKEN environment variable');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Generating image with prompt:', prompt);
    const replicate = new Replicate({ auth: apiToken });

    const output = await replicate.run(
      "ideogram-ai/ideogram-v3-turbo",
      {
        input: {
          prompt,
          aspect_ratio: aspectRatio,
        },
      }
    ) as any;

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: output.url ? output.url() : (output[0] || output),
        prompt,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
