import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import pdf from 'pdf-extraction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

// Extract text from PDF buffer (serverless-safe)
async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(fileBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF extraction error (serverless safe):', error);
    return '';
  }
}

// Chunk text into smaller pieces
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start = end - overlap;
  }

  return chunks;
}

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
    
    // Create Supabase client with user's token for RLS
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { documentId, content, fileData, chunkSize = 1000, overlap = 200 } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: 'Missing documentId' });
    }

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let extractedText = content || '';

    // If we have PDF file data, extract text from it
    if (fileData && (document.type === 'PDF' || document.name.toLowerCase().endsWith('.pdf'))) {
      try {
        console.log(`Extracting text from PDF: ${document.name}`);
        
        // Convert base64 to Buffer
        const fileBuffer = Buffer.from(fileData, 'base64');
        
        // Extract text using pdf-extraction (serverless-safe)
        extractedText = await extractTextFromPDF(fileBuffer);
        
        console.log(`Extracted ${extractedText.length} characters from PDF`);
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text could be extracted from PDF');
        }
      } catch (pdfError: any) {
        console.error('PDF extraction error:', pdfError);
        await supabase
          .from('knowledge_documents')
          .update({ status: 'failed' })
          .eq('id', documentId);
        
        return res.status(400).json({ 
          error: 'Failed to extract text from PDF',
          details: pdfError.message 
        });
      }
    }
    
    // Validate we have content to process
    if (!extractedText || extractedText.trim().length === 0) {
      console.log(`Document ${documentId} has no content after extraction`);
      
      await supabase
        .from('knowledge_documents')
        .update({ status: 'failed' })
        .eq('id', documentId);
        
      return res.status(400).json({ 
        error: 'No text content could be extracted from the document' 
      });
    }

    // Chunk the text
    const chunks = chunkText(extractedText, chunkSize, overlap);
    console.log(`Processing ${chunks.length} chunks for document ${documentId}`);

    // Generate embeddings for each chunk
    const embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: chunk,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Validate embedding format
        if (!Array.isArray(embedding) || !embedding.length) {
          throw new Error('Invalid embedding format: must be a non-empty array');
        }

        // Ensure it's a flat array of floats
        if (!embedding.every(val => typeof val === 'number' && !isNaN(val))) {
          throw new Error('Invalid embedding format: must contain only numbers');
        }

        embeddings.push({
          document_id: documentId,
          user_id: user.id,
          content: chunk,
          embedding: embedding, // Pass array directly for pgvector
          metadata: {
            chunk_index: i,
            chunk_total: chunks.length,
            document_name: document.name
          }
        });

        console.log(`Generated embedding ${i + 1}/${chunks.length}`);
      } catch (embeddingError: any) {
        console.error(`Error generating embedding for chunk ${i}:`, embeddingError);
        // Continue with other chunks even if one fails
      }
    }

    // Insert embeddings into database
    try {
      const { error: insertError } = await supabase
        .from('document_embeddings')
        .insert(embeddings);

      if (insertError) {
        // Log the full Supabase error details
        console.error('Supabase insertion error:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        
        // Update document status to failed
        await supabase
          .from('knowledge_documents')
          .update({ status: 'failed' })
          .eq('id', documentId);

        return res.status(500).json({ 
          error: 'Failed to store embeddings',
          details: insertError.message,
          code: insertError.code
        });
      }
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      // Update document status to failed
      await supabase
        .from('knowledge_documents')
        .update({ status: 'failed' })
        .eq('id', documentId);

      return res.status(500).json({ 
        error: 'Database operation failed',
        details: dbError.message || 'Unknown database error'
      });
    }

    // Update document status to indexed
    await supabase
      .from('knowledge_documents')
      .update({ 
        status: 'indexed',
        chunk_count: chunks.length
      })
      .eq('id', documentId);

    return res.status(200).json({ 
      success: true,
      chunksProcessed: chunks.length,
      message: 'Document processed and indexed successfully'
    });

  } catch (error: any) {
    console.error('Processing error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
