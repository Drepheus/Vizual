# Google Vertex AI RAG Setup Guide

This guide explains how to set up the **Vertex AI Search & Conversation** infrastructure required for your RAG pipeline.

## 1. Google Cloud Console Setup

### Step 1: Enable APIs
1. Go to the [Google Cloud Console](https://console.cloud.google.com).
2. Select your project.
3. Navigate to **APIs & Services > Library**.
4. Enable the following APIs:
   - **Vertex AI API**
   - **Vertex AI Search and Conversation API** (formerly Gen App Builder)

### Step 2: Create a Data Store
1. Search for "Vertex AI Search and Conversation" in the top bar.
2. Click **New App**.
3. Select **Search** as the app type.
4. Enable **Enterprise Edition** features if asked (required for some advanced features, but Standard is fine for basic text).
5. **Configure Data Store**:
   - Click **Create New Data Store**.
   - Select **Cloud Storage** (if your files are in a bucket) or **Upload** (for manual testing).
   - *Recommendation*: Create a Google Cloud Storage bucket (e.g., `vizual-ai-knowledge-base`) and select it. This allows you to just drop files there to update the index.
   - Select "Unstructured documents" (PDF, HTML, TXT, etc.).
6. **Link Data Store**: Select the data store you just created and click **Create**.

### Step 3: Get IDs
You will need two IDs for your environment variables:
1. **Project ID**: Your GCP Project ID (e.g., `vizual-ai-123`).
2. **Data Store ID**: Go to the Data Stores tab, click your data store, and copy the ID (e.g., `vizual-knowledge-base_12345`).
3. **Location**: usually `global` or `us-central1`.

---

## 2. Environment Variables

Add these to your `.env.local` and your Cloud Run environment variables:

```bash
# Google Cloud Project
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Vertex AI Search
VERTEX_DATA_STORE_ID=your-data-store-id
```

---

## 3. How It Works (The "Optimized" Way)

We are using **Google Gemini Grounding**. Instead of manually querying the vector database and stuffing the context into the prompt, we use the `tools` parameter in the Vertex AI SDK.

**The Flow:**
1. User sends a message: "How do I reset my password?"
2. Our API calls Gemini Pro with the `googleSearchRetrieval` or `retrieval` tool enabled.
3. Gemini automatically queries your Data Store.
4. Gemini decides which information is relevant.
5. Gemini generates a response with **citations** linking back to the source document.

### Advantages:
- **Lower Latency**: No separate DB round-trip in your code.
- **Better Accuracy**: Google's model decides what to search for.
- **Citations**: Automatic handling of "According to document X...".

---

## 4. Testing

Once deployed, you can test the RAG pipeline by uploading a file (e.g., `employee_handbook.pdf`) to your linked Cloud Storage bucket. Wait a few minutes for indexing, then ask a question about it in the chat.
