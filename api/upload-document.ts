import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

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

    const { fileName, fileType, fileSize, botId } = req.body;

    if (!fileName || !botId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure required fields have defaults
    const documentType = fileType || fileName.split('.').pop()?.toUpperCase() || 'FILE';
    const documentSize = fileSize || 0;

    // Insert document record
    const { data: document, error: dbError } = await supabase
      .from('knowledge_documents')
      .insert({
        bot_id: botId,
        user_id: user.id,
        name: fileName,
        type: documentType,
        size: documentSize,
        status: 'processing',
        chunk_count: 0
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        error: 'Failed to create document record', 
        details: dbError.message,
        code: dbError.code 
      });
    }

    // Return document ID for further processing
    return res.status(200).json({ 
      success: true, 
      documentId: document.id,
      message: 'Document uploaded successfully. Processing will begin shortly.' 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
