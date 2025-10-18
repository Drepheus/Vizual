const Replicate = require('replicate');

module.exports = async function handler(req, res) {
  console.log('=== IMAGE GENERATION API CALLED ===');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, aspectRatio = '3:2' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.error('Missing REPLICATE_API_TOKEN environment variable');
      return res.status(500).json({ error: 'API token not configured' });
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
    );

    console.log('Image generated successfully');

    return res.status(200).json({
      success: true,
      imageUrl: output.url ? output.url() : (output[0] || output),
      prompt,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
