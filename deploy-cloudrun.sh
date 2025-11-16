#!/bin/bash

# Google Cloud Run Deployment Script
# Make sure you have gcloud CLI installed: https://cloud.google.com/sdk/docs/install

set -e

echo "🚀 Google Cloud Run Deployment Script"
echo "======================================"

# Configuration
PROJECT_ID="your-gcp-project-id"  # Replace with your GCP project ID
SERVICE_NAME="omi-ai"
REGION="us-central1"  # Change region if needed
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo ""
echo "📋 Configuration:"
echo "  Project ID: ${PROJECT_ID}"
echo "  Service Name: ${SERVICE_NAME}"
echo "  Region: ${REGION}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI found"

# Authenticate (if not already)
echo ""
echo "🔐 Checking authentication..."
gcloud auth list

# Set project
echo ""
echo "📦 Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo ""
echo "🔌 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build Docker image
echo ""
echo "🏗️  Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME}

# Deploy to Cloud Run
echo ""
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
  --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
  --set-env-vars GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY} \
  --set-env-vars TAVILY_API_KEY=${TAVILY_API_KEY}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
echo ""
echo "📝 Next steps:"
echo "  1. Update your frontend to use the Cloud Run URL for API calls"
echo "  2. Add any additional environment variables via Cloud Run console"
echo "  3. Configure custom domain if needed"
