# Google Cloud Run Deployment Script for PowerShell
# Run this script from the project root directory

param(
    [string]$ProjectId = "omi-ai-474603",
    [string]$VertexDataStoreId = "codebase-rag-datastore_1764052581651"
)

Write-Host "🚀 Google Cloud Run Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Configuration
$ServiceName = "omi-ai"
$Region = "us-central1"
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Project ID: $ProjectId"
Write-Host "  Service Name: $ServiceName"
Write-Host "  Region: $Region"
if ($VertexDataStoreId) {
    Write-Host "  Data Store ID: $VertexDataStoreId"
}
Write-Host ""

# Check if gcloud is installed
$gcloudPath = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
if (Test-Path $gcloudPath) {
    Write-Host "✅ gcloud CLI found" -ForegroundColor Green
    $gcloud = $gcloudPath
}
else {
    try {
        $null = Get-Command gcloud -ErrorAction Stop
        Write-Host "✅ gcloud CLI found in PATH" -ForegroundColor Green
        $gcloud = "gcloud"
    }
    catch {
        Write-Host "❌ Error: gcloud CLI is not installed" -ForegroundColor Red
        Write-Host "Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    }
}

# Set project
Write-Host ""
Write-Host "📦 Setting GCP project..." -ForegroundColor Yellow
& $gcloud config set project $ProjectId

# Enable required APIs
Write-Host ""
Write-Host "🔌 Enabling required Google Cloud APIs..." -ForegroundColor Yellow
& $gcloud services enable cloudbuild.googleapis.com
& $gcloud services enable run.googleapis.com
& $gcloud services enable containerregistry.googleapis.com
& $gcloud services enable aiplatform.googleapis.com
& $gcloud services enable discoveryengine.googleapis.com

# Environment variables - Add your actual values here
$NEXT_PUBLIC_SUPABASE_URL = "https://cnysdbjajxnpmrugnpme.supabase.co"
$NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueXNkYmphanhucG1ydWducG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzA4MzUsImV4cCI6MjA3NTU0NjgzNX0.H5AvV68Br-taWHCQdD1QOmKf-TXK9zlBGzUW8nOT_d4"

# Build Docker image with build arguments
Write-Host ""
Write-Host "🏗️  Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
& $gcloud builds submit --config cloudbuild.yaml `
    --substitutions="_NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL,_NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Runtime environment variables for Cloud Run
$envVars = @(
    "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAPUrVUTLGnhPOY6KFypgSqqFB3hRKLEug",
    "TAVILY_API_KEY=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",
    "GOOGLE_CLOUD_PROJECT_ID=$ProjectId",
    "GOOGLE_CLOUD_LOCATION=us-central1"
)

if ($VertexDataStoreId) {
    $envVars += "VERTEX_DATA_STORE_ID=$VertexDataStoreId"
}

# Deploy to Cloud Run
Write-Host ""
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow

$deployCmd = @(
    "run", "deploy", $ServiceName,
    "--image", $ImageName,
    "--platform", "managed",
    "--region", $Region,
    "--allow-unauthenticated",
    "--port", "8080",
    "--memory", "2Gi",
    "--cpu", "2",
    "--timeout", "300",
    "--max-instances", "10"
)

if ($envVars.Count -gt 0) {
    $deployCmd += "--set-env-vars"
    $deployCmd += ($envVars -join ",")
}

& $gcloud $deployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your service URL:" -ForegroundColor Cyan
$serviceUrl = & $gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'
Write-Host $serviceUrl -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update your frontend to use the Cloud Run URL for API calls"
Write-Host "  2. Add any additional environment variables via Cloud Run console"
Write-Host "  3. Configure custom domain if needed"
Write-Host ""
Write-Host "View logs: $gcloud run logs tail --service $ServiceName" -ForegroundColor Gray
