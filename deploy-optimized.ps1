# Optimized Google Cloud Run Deployment Script
# Eliminates cold starts with min-instances=1 and CPU always allocated
param([string]$ProjectId = "omi-ai-474603")

$ErrorActionPreference = "Stop"

# Use gcloud from PATH
$gcloud = "gcloud"

Write-Host "=== OPTIMIZED DEPLOYMENT ===" -ForegroundColor Cyan
Write-Host "This deployment eliminates cold starts!" -ForegroundColor Cyan
Write-Host ""

# Environment variables
$SUPABASE_URL = "https://cnysdbjajxnpmrugnpme.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueXNkYmphanhucG1ydWducG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzA4MzUsImV4cCI6MjA3NTU0NjgzNX0.H5AvV68Br-taWHCQdD1QOmKf-TXK9zlBGzUW8nOT_d4"

# Set project
Write-Host "[1/4] Setting project..." -ForegroundColor Yellow
& $gcloud config set project $ProjectId

# Enable APIs
Write-Host "[2/4] Enabling APIs..." -ForegroundColor Yellow
& $gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Build with build args
Write-Host "[3/4] Building Docker image (standalone mode - smaller & faster)..." -ForegroundColor Yellow
$substitutions = "_NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,_NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY"
& $gcloud builds submit --config cloudbuild.yaml --substitutions="$substitutions"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Deploy with optimizations for ZERO cold starts
Write-Host "[4/4] Deploying to Cloud Run with cold start elimination..." -ForegroundColor Yellow
$envVars = "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY,GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAPUrVUTLGnhPOY6KFypgSqqFB3hRKLEug,TAVILY_API_KEY=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,WAVESPEED_API_KEY=df9e4793f513cc159f9ba7f1007b38c6f1204a22aa2fb7e9d8c444d300e54c85"

& $gcloud run deploy omi-ai `
    --image gcr.io/$ProjectId/omi-ai `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --port 8080 `
    --memory 2Gi `
    --cpu 2 `
    --min-instances 1 `
    --max-instances 10 `
    --cpu-boost `
    --execution-environment gen2 `
    --set-env-vars "$envVars"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Optimizations applied:" -ForegroundColor Cyan
Write-Host "  - Standalone output (smaller container)" -ForegroundColor White
Write-Host "  - Min instances = 1 (no cold starts)" -ForegroundColor White
Write-Host "  - CPU boost enabled (faster startup)" -ForegroundColor White
Write-Host "  - Gen2 execution (improved performance)" -ForegroundColor White
Write-Host ""
