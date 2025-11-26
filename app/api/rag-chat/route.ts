import { VertexAI } from '@google-cloud/vertexai';
import { NextRequest, NextResponse } from 'next/server';

const project = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const dataStoreId = process.env.VERTEX_DATA_STORE_ID;

export const runtime = 'nodejs'; // Vertex SDK requires Node.js runtime

export async function POST(req: NextRequest) {
    try {
        if (!project || !dataStoreId) {
            return NextResponse.json(
                { error: 'Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT_ID and VERTEX_DATA_STORE_ID.' },
                { status: 500 }
            );
        }

        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Initialize Vertex AI
        const vertexAI = new VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-1.5-pro-001', // Better for RAG reasoning
        });

        // Configure grounding with Vertex AI Search
        const tools = [
            {
                retrieval: {
                    vertexAiSearch: {
                        datastore: `projects/${project}/locations/global/collections/default_collection/dataStores/${dataStoreId}`,
                    },
                },
            },
        ];

        // Start chat with grounding
        const chat = model.startChat({
            tools: tools,
            history: history || [],
        });

        // Send message and stream response
        const result = await chat.sendMessageStream(message);

        // Create a readable stream for the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error: any) {
        console.error('RAG Chat Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
