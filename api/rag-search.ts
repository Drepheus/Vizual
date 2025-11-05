import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      query, 
      matchThreshold = 0.7, 
      matchCount = 5
    } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Perform vector similarity search using the Postgres function
    const { data: matches, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_user_id: user.id
    });

    if (searchError) {
      console.error('Search error:', searchError);
      return res.status(500).json({ error: 'Failed to search documents' });
    }

    // Format results
    const results = matches.map((match: any) => ({
      id: match.id,
      documentId: match.document_id,
      content: match.content,
      metadata: match.metadata,
      similarity: match.similarity
    }));

    return res.status(200).json({ 
      success: true,
      results,
      query,
      matchCount: results.length
    });

  } catch (error: any) {
    console.error('RAG search error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
