# Google Cloud Run Deployment Guide

## Prerequisites

1. **Install Google Cloud SDK**
   ```bash
   # Windows (PowerShell as Admin)
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
   & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

2. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Note your Project ID

3. **Enable Billing**
   - Cloud Run requires billing enabled (free tier available)
   - Go to Billing → Link a billing account

## Environment Variables You Need

Copy these from your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `TAVILY_API_KEY`

Plus any Stripe keys:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Deployment Steps

### Option 1: Using PowerShell Script (Windows)

1. **Set environment variables** in PowerShell:
   ```powershell
   $env:NEXT_PUBLIC_SUPABASE_URL="https://cnysdbjajxnpmrugnpme.supabase.co"
   $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   $env:GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"
   $env:TAVILY_API_KEY="your-tavily-key"
   ```

2. **Edit `deploy-cloudrun.ps1`**:
   - Replace `your-gcp-project-id` with your actual project ID

3. **Run deployment**:
   ```powershell
   .\deploy-cloudrun.ps1
   ```

### Option 2: Manual Deployment

1. **Initialize gcloud**:
   ```powershell
   gcloud init
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable APIs**:
   ```powershell
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

3. **Build and deploy**:
   ```powershell
   # Build
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/vizual-ai
   
   # Deploy
   gcloud run deploy vizual-ai `
     --image gcr.io/YOUR_PROJECT_ID/vizual-ai `
     --platform managed `
     --region us-central1 `
     --allow-unauthenticated `
     --port 8080
   ```

4. **Set environment variables** (via Cloud Run console):
   - Go to Cloud Run → Your service → Edit & Deploy New Revision
   - Add all environment variables
   - Deploy

## After Deployment

1. **Get your Cloud Run URL**:
   ```powershell
   gcloud run services describe vizual-ai --region us-central1 --format 'value(status.url)'
   ```

2. **Update Frontend API Calls**:
   - Replace `/api/` with `https://your-cloudrun-url.run.app/api/`
   - Or use environment variable for API base URL

3. **Test APIs**:
   ```powershell
   curl https://your-cloudrun-url.run.app/api/chat -X POST
   ```

## Costs Estimate

Free tier includes:
- 2 million requests/month
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

After free tier (~$5-10/month for moderate traffic):
- CPU: $0.00002400 per vCPU-second
- Memory: $0.00000250 per GB-second
- Requests: $0.40 per million

## Troubleshooting

**Build fails?**
- Check Dockerfile syntax
- Ensure all dependencies in package.json
- Check pnpm-lock.yaml is committed

**Deployment fails?**
- Check environment variables are set
- Verify billing is enabled
- Check service quotas

**502 errors?**
- Check port 8080 is exposed
- Verify application starts correctly
- Check logs: `gcloud run logs read --service vizual-ai`

## Useful Commands

```powershell
# View logs
gcloud run logs tail --service vizual-ai

# Update environment variable
gcloud run services update vizual-ai --set-env-vars KEY=VALUE

# Redeploy
gcloud run deploy vizual-ai --image gcr.io/YOUR_PROJECT_ID/vizual-ai

# Delete service
gcloud run services delete vizual-ai
```
