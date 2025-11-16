# Google Cloud Run Deployment Script for PowerShell
# Run this script from the project root directory

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
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
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
    Write-Host "✅ gcloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Set project
Write-Host ""
Write-Host "📦 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host ""
Write-Host "🔌 Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build Docker image
Write-Host ""
Write-Host "🏗️  Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
gcloud builds submit --tag $ImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Get environment variables from current session
$envVars = @()
if ($env:NEXT_PUBLIC_SUPABASE_URL) {
    $envVars += "NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL"
}
if ($env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    $envVars += "NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY"
}
if ($env:GOOGLE_GENERATIVE_AI_API_KEY) {
    $envVars += "GOOGLE_GENERATIVE_AI_API_KEY=$env:GOOGLE_GENERATIVE_AI_API_KEY"
}
if ($env:TAVILY_API_KEY) {
    $envVars += "TAVILY_API_KEY=$env:TAVILY_API_KEY"
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

& gcloud $deployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your service URL:" -ForegroundColor Cyan
$serviceUrl = gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'
Write-Host $serviceUrl -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update your frontend to use the Cloud Run URL for API calls"
Write-Host "  2. Add any additional environment variables via Cloud Run console"
Write-Host "  3. Configure custom domain if needed"
Write-Host ""
Write-Host "View logs: gcloud run logs tail --service $ServiceName" -ForegroundColor Gray
