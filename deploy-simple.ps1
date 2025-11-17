# Simple Google Cloud Run Deployment Script
param([string]$ProjectId = "omi-ai-474603")

$ErrorActionPreference = "Stop"

# Find gcloud
$gcloud = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
if (-not (Test-Path $gcloud)) {
    Write-Error "gcloud not found. Please install Google Cloud SDK."
    exit 1
}

Write-Host "Using gcloud at: $gcloud" -ForegroundColor Green

# Environment variables
$SUPABASE_URL = "https://cnysdbjajxnpmrugnpme.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueXNkYmphanhucG1ydWducG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzA4MzUsImV4cCI6MjA3NTU0NjgzNX0.H5AvV68Br-taWHCQdD1QOmKf-TXK9zlBGzUW8nOT_d4"

# Set project
Write-Host "Setting project..." -ForegroundColor Yellow
& $gcloud config set project $ProjectId

# Enable APIs
Write-Host "Enabling APIs..." -ForegroundColor Yellow
& $gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Build with build args
Write-Host "Building Docker image..." -ForegroundColor Yellow
$substitutions = "_NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,_NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY"
& $gcloud builds submit --config cloudbuild.yaml --substitutions=$substitutions

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Deploy
Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow
$envVars = "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY,GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAPUrVUTLGnhPOY6KFypgSqqFB3hRKLEug,TAVILY_API_KEY=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"

& $gcloud run deploy omi-ai `
    --image gcr.io/$ProjectId/omi-ai `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --port 8080 `
    --memory 2Gi `
    --cpu 2 `
    --set-env-vars $envVars

Write-Host "✅ Done!" -ForegroundColor Green
