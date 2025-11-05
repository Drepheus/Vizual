import { supabase } from './supabaseClient';

export interface CustomOmi {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'training' | 'ready';
  accuracy: number;
  documentsCount?: number;
  embeddingsCount?: number;
}

export interface KnowledgeDocument {
  id: string;
  bot_id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'indexed' | 'failed';
  chunk_count: number;
  uploaded_at: string;
}

// Load all custom bots for the current user
export async function loadCustomOmis(userId: string): Promise<CustomOmi[]> {
  const { data: bots, error } = await supabase
    .from('custom_omis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading bots:', error);
    return [];
  }

  // Get document and embedding counts for each bot
  const botsWithCounts = await Promise.all(
    (bots || []).map(async (bot: any) => {
      const { count: docCount } = await supabase
        .from('knowledge_documents')
        .select('*', { count: 'exact', head: true })
        .eq('bot_id', bot.id);

      const { count: embeddingCount } = await supabase
        .from('document_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        id: bot.id,
        name: bot.name,
        description: bot.description || '',
        status: bot.status as 'idle' | 'training' | 'ready',
        accuracy: bot.accuracy || 0,
        documentsCount: docCount || 0,
        embeddingsCount: embeddingCount || 0
      };
    })
  );

  return botsWithCounts;
}

// Load all documents for a specific bot
export async function loadDocuments(botId?: string): Promise<KnowledgeDocument[]> {
  let query = supabase
    .from('knowledge_documents')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (botId) {
    query = query.eq('bot_id', botId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading documents:', error);
    return [];
  }

  return data || [];
}

// Create a new custom bot
export async function createCustomOmi(userId: string, name: string, description: string) {
  const { data, error } = await supabase
    .from('custom_omis')
    .insert({
      user_id: userId,
      name,
      description,
      status: 'idle',
      accuracy: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating bot:', error);
    throw error;
  }

  return data;
}

// Read file content as text
export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Read as text for supported formats
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || 
        file.name.endsWith('.md') || file.name.endsWith('.json') ||
        file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      // For other formats, we'll need server-side processing
      resolve(''); // Empty content will trigger server-side extraction
    }
  });
}

// Upload and process a document
export async function uploadDocument(
  file: File,
  botId: string,
  onProgress?: (status: string) => void
): Promise<void> {
  try {
    onProgress?.('Reading file...');
    const content = await readFileContent(file);

    onProgress?.('Uploading document...');
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    // Step 1: Upload document metadata
    const uploadResponse = await fetch('/api/upload-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        file: content,
        fileName: file.name,
        fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'FILE',
        fileSize: file.size,
        botId
      })
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error || 'Upload failed');
    }

    const { documentId } = await uploadResponse.json();

    // Step 2: Process document (chunk and embed)
    onProgress?.('Processing and generating embeddings...');
    const processResponse = await fetch('/api/process-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        documentId,
        content,
        chunkSize: 1000,
        overlap: 200
      })
    });

    if (!processResponse.ok) {
      const error = await processResponse.json();
      throw new Error(error.error || 'Processing failed');
    }

    onProgress?.('Document indexed successfully!');
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Perform RAG search
export async function performRAGSearch(
  query: string,
  matchThreshold: number = 0.7,
  matchCount: number = 5
) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/rag-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        matchThreshold,
        matchCount
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Search failed');
    }

    return await response.json();
  } catch (error) {
    console.error('RAG search error:', error);
    throw error;
  }
}

// Delete a document
export async function deleteDocument(documentId: string) {
  const { error } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Delete a bot
export async function deleteBot(botId: string) {
  const { error } = await supabase
    .from('custom_omis')
    .delete()
    .eq('id', botId);

  if (error) {
    console.error('Error deleting bot:', error);
    throw error;
  }
}
