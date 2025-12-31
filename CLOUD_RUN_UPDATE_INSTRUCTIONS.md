# Updating Cloud Run Environment Variables

You have two options to update your environment variables.

## Option 1: Google Cloud Console (Easiest)

1. Go to the [Google Cloud Run Console](https://console.cloud.google.com/run).
2. Click on your service (likely `vizual-ai-1` or similar).
3. Click **Edit & Deploy New Revision** at the top.
4. Go to the **Variables & Secrets** tab.
5. Add the following variables (copy values from `CLOUD_RUN_ENV_VARS.txt`):
   - `OPENAI_API_KEY`
   - `GROQ_API_KEY`
6. Ensure the following are also present:
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `TAVILY_API_KEY`
   - `REPLICATE_API_TOKEN`
7. Click **Deploy**.

## Option 2: Command Line

Run the following command in your terminal (replace the keys with your actual values):

```powershell
gcloud run services update vizual-ai-workspace `
  --region us-central1 `
  --set-env-vars "OPENAI_API_KEY=PASTE_YOUR_OPENAI_KEY_HERE,GROQ_API_KEY=PASTE_YOUR_GROQ_KEY_HERE"
```

(Note: If your service name is different, replace `vizual-ai-workspace` with the correct name).
