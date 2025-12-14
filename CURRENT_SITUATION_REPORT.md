# 🚨 Current Situation Report: Omi AI RAG Issue

## 1. Web Application Setup
*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Custom Vanilla CSS
*   **Database & Auth:** Supabase (Auth, Database)
*   **Deployment:** Google Cloud Run (Dockerized)
*   **Build System:** Google Cloud Build
*   **Project ID:** `omi-ai-474603`
*   **Region:** `us-central1`

## 2. RAG (Retrieval-Augmented Generation) Setup
We are using **Google Vertex AI Search & Conversation** with **Gemini Grounding**.

*   **Infrastructure:**
    *   **Vector DB / Index:** Managed by Vertex AI Search (Data Store).
    *   **Data Store ID:** `codebase-rag-datastore_1764052581651`
    *   **Storage:** Documents are uploaded to a Google Cloud Storage bucket linked to the Data Store.
*   **Backend Implementation (`app/api/rag-chat/route.ts`):**
    *   Uses `@google-cloud/vertexai` SDK.
    *   Initializes `VertexAI` client with `project` and `location`.
    *   Calls `getGenerativeModel` to load a Gemini model.
    *   Uses the `tools` parameter to pass the Data Store ID for grounding:
        ```typescript
        tools = [{ retrieval: { vertexAiSearch: { datastore: ... } } }]
        ```

## 3. The Current Issue
**Error:** `404 Not Found` when attempting to chat with the bot.
**Specific Message:**
> "Publisher Model `projects/omi-ai-474603/locations/us-central1/publishers/google/models/gemini-1.5-flash` was not found or your project does not have access to it."

### Troubleshooting Steps Taken:
1.  **API Enablement:** Confirmed `aiplatform.googleapis.com` and `discoveryengine.googleapis.com` are enabled in the deployment script.
2.  **Environment Variables:**
    *   `GOOGLE_CLOUD_PROJECT_ID` is set to `omi-ai-474603`.
    *   `VERTEX_DATA_STORE_ID` is set correctly.
    *   `GOOGLE_CLOUD_LOCATION` was explicitly forced to `us-central1`.
3.  **Model Versions Attempted:**
    *   `gemini-1.5-pro-001` -> Failed (404)
    *   `gemini-1.5-flash` -> Failed (404)
    *   `gemini-1.5-flash-001` -> Failed (404)
    *   *Current Attempt (Pending Deployment):* Downgrading to `gemini-1.0-pro` to test stability.

### Suspected Causes:
*   **Region Mismatch:** The model might not be available in `us-central1` for this specific project tier, or the Data Store (which is global) requires a specific region for the LLM.
*   **Service Account Permissions:** The Cloud Run service account might lack specific IAM roles (`Vertex AI User` or `Discovery Engine Viewer`) to access the models or the Data Store.
