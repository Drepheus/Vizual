import { supabase } from './supabaseClient';
import { chatWithVertexRAG } from './vertexService';

export { chatWithVertexRAG };

export interface CustomVizual {
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
export async function loadCustomVizuals(userId: string): Prvizualse<CustomVizual[]> {
    const { data: bots, error } = await supabase
        .from('custom_vizuals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading bots:', error);
        return [];
    }

    // Get document counts for each bot
    const botsWithCounts = await Prvizualse.all(
        (bots || []).map(async (bot: any) => {
            const { count: docCount } = await supabase
                .from('knowledge_documents')
                .select('*', { count: 'exact', head: true })
                .eq('bot_id', bot.id);

            return {
                id: bot.id,
                name: bot.name,
                description: bot.description || '',
                status: bot.status as 'idle' | 'training' | 'ready',
                accuracy: bot.accuracy || 0,
                documentsCount: docCount || 0,
                embeddingsCount: 0 // Vertex manages embeddings
            };
        })
    );

    return botsWithCounts;
}

// Load all documents for a specific bot
export async function loadDocuments(botId?: string): Prvizualse<KnowledgeDocument[]> {
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
export async function createCustomVizual(userId: string, name: string, description: string) {
    const { data, error } = await supabase
        .from('custom_vizuals')
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

// Upload document (placeholder - actual upload should be to GCS for Vertex AI)
export async function uploadDocument(
    file: File,
    botId: string,
    onProgress?: (status: string) => void
): Prvizualse<void> {
    onProgress?.('Note: For Vertex AI RAG, please upload files directly to your GCS bucket linked to the Data Store.');

    // For now, we'll just register the document in Supabase for tracking
    // The actual indexing happens in Vertex AI when you upload to GCS
    const { error } = await supabase
        .from('knowledge_documents')
        .insert({
            bot_id: botId,
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            status: 'indexed',
            chunk_count: 0,
            uploaded_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error registering document:', error);
        throw new Error('Failed to register document');
    }

    onProgress?.('Document registered. Upload to GCS bucket for Vertex AI indexing.');
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
        .from('custom_vizuals')
        .delete()
        .eq('id', botId);

    if (error) {
        console.error('Error deleting bot:', error);
        throw error;
    }
}
