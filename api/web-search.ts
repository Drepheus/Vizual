import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  images?: string[];
  response_time: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, mode = 'search' } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      return res.status(500).json({ error: 'Tavily API key not configured' });
    }

    // Call Tavily API for web search
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: query,
        search_depth: mode === 'deep' ? 'advanced' : 'basic',
        include_answer: true,
        include_images: true,
        include_raw_content: false,
        max_results: 5,
      }),
    });

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text();
      console.error('Tavily API error:', errorText);
      return res.status(500).json({ error: 'Search service error' });
    }

    const tavilyData: TavilyResponse = await tavilyResponse.json();

    // Format search results for context
    const searchContext = tavilyData.results
      .map((result, index) => {
        return `[${index + 1}] ${result.title}
URL: ${result.url}
${result.published_date ? `Published: ${result.published_date}` : ''}
Content: ${result.content}
---`;
      })
      .join('\n\n');

    // Use Groq to generate a comprehensive summary
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert research assistant. Your task is to provide comprehensive, well-structured answers based on web search results. 

Guidelines:
- Synthesize information from multiple sources
- Include relevant citations with [1], [2], etc. matching the source numbers
- Provide detailed, informative responses
- Highlight key facts and important details
- Use clear formatting with paragraphs and bullet points where appropriate
- If information is conflicting, mention it
- Always cite your sources`,
        },
        {
          role: 'user',
          content: `Query: ${query}

Search Results:
${searchContext}

Please provide a comprehensive answer to the query based on these search results. Include citations [1], [2], etc. to reference the sources.`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';

    // Format sources for response
    const sources = tavilyData.results.map((result, index) => ({
      number: index + 1,
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 200) + '...',
      published_date: result.published_date,
    }));

    return res.status(200).json({
      query: tavilyData.query,
      summary: summary,
      sources: sources,
      images: tavilyData.images || [],
      answer: tavilyData.answer, // Tavily's direct answer
      response_time: tavilyData.response_time,
    });

  } catch (error) {
    console.error('Web search error:', error);
    return res.status(500).json({ 
      error: 'Failed to process search request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
