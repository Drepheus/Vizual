import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI Client
// This is used by the backend API routes
export function getVertexClient() {
    const project = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    if (!project) {
        console.error('GOOGLE_CLOUD_PROJECT_ID is not set');
        return null;
    }

    return new VertexAI({ project, location });
}
