export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

/**
 * Chat with Vertex AI RAG using the backend API
 * @param message - User's message
 * @param history - Previous chat history
 * @param onChunk - Callback for streaming response chunks
 */
export async function chatWithVertexRAG(
    message: string,
    history: ChatMessage[],
    onChunk: (text: string) => void
): Prvizualse<void> {
    try {
        const response = await fetch('/api/rag-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                history,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get response from Vertex AI');
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            onChunk(chunk);
        }
    } catch (error) {
        console.error('Vertex RAG Chat Error:', error);
        throw error;
    }
}
