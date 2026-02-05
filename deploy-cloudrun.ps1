# Google Cloud Run Deployment Script for PowerShell
# Run this script from the project root directory

param(
    [string]$ProjectId = "omi-ai-474603",
    [string]$VertexDataStoreId = "codebase-rag-datastore_1764052581651"
)

Write-Host " Google Cloud Run Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Configuration
$ServiceName = "omi-ai"
$Region = "us-central1"
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host ""
Write-Host " Configuration:" -ForegroundColor Yellow
Write-Host "  Project ID: $ProjectId"
Write-Host "  Service Name: $ServiceName"
Write-Host "  Region: $Region"
if ($VertexDataStoreId) {
    Write-Host "  Data Store ID: $VertexDataStoreId"
}
Write-Host ""

# Check if gcloud is installed
if (Get-Command gcloud -ErrorAction SilentlyContinue) {
    Write-Host " gcloud CLI found" -ForegroundColor Green
} else {
    Write-Host " Error: gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Set project
Write-Host ""
Write-Host " Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host ""
Write-Host " Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable discoveryengine.googleapis.com

# Environment variables - Add your actual values here
$NEXT_PUBLIC_SUPABASE_URL = "https://cnysdbjajxnpmrugnpme.supabase.co"
$NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueXNkYmphanhucG1ydWducG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzA4MzUsImV4cCI6MjA3NTU0NjgzNX0.H5AvV68Br-taWHCQdD1QOmKf-TXK9zlBGzUW8nOT_d4"

# Build Docker image with build arguments
Write-Host ""
Write-Host "  Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
gcloud builds submit --config cloudbuild.yaml `
    --substitutions="_NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL,_NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY"

if ($LASTEXITCODE -ne 0) {
    Write-Host " Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host " Build successful!" -ForegroundColor Green

# Runtime environment variables for Cloud Run - loaded from .env.local
# NOTE: This script reads secrets from .env.local file (not committed to git)
# Make sure .env.local exists with all required API keys before deploying

Write-Host ""
Write-Host " Loading environment variables from .env.local for deployment..." -ForegroundColor Yellow

# Load .env.local file
$envFile = ".\.env.local"
if (-not (Test-Path $envFile)) {
    Write-Host " Error: .env.local file not found! Create it with all required API keys." -ForegroundColor Red
    exit 1
}

$envVarsFromFile = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVarsFromFile[$key] = $value
    }
}

# Build env vars array from .env.local
$envVars = @(
    "NEXT_PUBLIC_SUPABASE_URL=$($envVarsFromFile['NEXT_PUBLIC_SUPABASE_URL'])",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=$($envVarsFromFile['NEXT_PUBLIC_SUPABASE_ANON_KEY'])",
    "GOOGLE_GENERATIVE_AI_API_KEY=$($envVarsFromFile['GOOGLE_GENERATIVE_AI_API_KEY'])",
    "TAVILY_API_KEY=$($envVarsFromFile['TAVILY_API_KEY'])",
    "REPLICATE_API_TOKEN=$($envVarsFromFile['REPLICATE_API_TOKEN'])",
    "OPENAI_API_KEY=$($envVarsFromFile['OPENAI_API_KEY'])",
    "GROQ_API_KEY=$($envVarsFromFile['GROQ_API_KEY'])",
    "GOOGLE_CLOUD_PROJECT_ID=$ProjectId",
    "GOOGLE_CLOUD_LOCATION=us-central1",
    "WAVESPEED_API_KEY=$($envVarsFromFile['WAVESPEED_API_KEY'])",
    "SUPABASE_SERVICE_ROLE_KEY=$($envVarsFromFile['SUPABASE_SERVICE_ROLE_KEY'])",
    "DECART_API_KEY=$($envVarsFromFile['DECART_API_KEY'])",
    "STRIPE_SECRET_KEY=$($envVarsFromFile['STRIPE_SECRET_KEY'])",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$($envVarsFromFile['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'])",
    "STRIPE_WEBHOOK_SECRET=$($envVarsFromFile['STRIPE_WEBHOOK_SECRET'])"
)

if ($VertexDataStoreId) {
    $envVars += "VERTEX_DATA_STORE_ID=$VertexDataStoreId"
}

# Deploy to Cloud Run
Write-Host ""
Write-Host " Deploying to Cloud Run..." -ForegroundColor Yellow

$cmd = "gcloud run deploy $ServiceName --image $ImageName --platform managed --region $Region --allow-unauthenticated --port 8080 --memory 2Gi --cpu 2 --timeout 300 --max-instances 10"

if ($envVars.Count -gt 0) {
    $vars = $envVars -join ","
    # Use update-env-vars to preserve other variables (like OPENAI_API_KEY) added via Console
    $cmd += " --update-env-vars ""$vars"""
}

Write-Host "Executing deployment command..." -ForegroundColor Gray
Invoke-Expression $cmd

if ($LASTEXITCODE -ne 0) {
    Write-Host " Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host " Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host " Your service URL:" -ForegroundColor Cyan
$serviceUrl = gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'
Write-Host $serviceUrl -ForegroundColor White
Write-Host ""
Write-Host " Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update your frontend to use the Cloud Run URL for API calls"
Write-Host "  2. Add any additional environment variables via Cloud Run console"
Write-Host "  3. Configure custom domain if needed"
Write-Host ""
Write-Host "View logs: gcloud run logs tail --service $ServiceName" -ForegroundColor Gray
