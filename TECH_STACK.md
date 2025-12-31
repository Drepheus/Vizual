# Vizual AI - Tech Stack & Infrastructure

## 📋 Executive Summary
Full-stack AI chat application built on Next.js, deployed on Google Cloud Run, using Supabase for data/auth and Google Gemini for AI intelligence.

---

## 🏗️ Architecture Overview

### Deployment Model: **Containerized Serverless**
- **Platform**: Google Cloud Run (fully managed serverless containers)
- **Container**: Docker (Node.js 18-alpine)
- **Region**: us-central1 (recommended)
- **Scaling**: Auto-scaling 0 to N instances

### Core Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)

---

## 💻 Frontend Stack

### Core
- **Next.js**: Server-side rendering & API routes
- **React**: UI library
- **TypeScript**: Type safety

### Styling & Animation
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: React animations
- **GSAP**: Advanced animations
- **Lucide React**: Icons

---

## 🔧 Backend Stack (Next.js API Routes)

### API Endpoints (`/app/api/...`)
- **Chat**: Streaming responses with Google Gemini
- **RAG**: (Planned) Vertex AI Search / Supabase pgvector
- **Media**: Replicate API for image/video generation
- **Search**: Tavily API for web grounding

### AI Services
- **LLM**: Google Gemini 1.5 Pro / Flash
- **SDK**: `@google/generative-ai` (Migrating to Vertex AI SDK)
- **Search**: Tavily Search API
- **Media**: Replicate (Stable Diffusion, etc.)

---

## ☁️ Google Cloud Infrastructure

### Services Used
- **Cloud Run**: Hosting the Next.js application
- **Cloud Build**: CI/CD for building Docker images
- **Container Registry (GCR)**: Storing Docker images
- **Vertex AI**: (Planned) Advanced RAG and model serving

### Environment Variables
Required in Cloud Run:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY` (or Vertex AI credentials)
- `TAVILY_API_KEY`

---

## 🗄️ Database (Supabase)

### Tables
- `conversations`: User chat history
- `messages`: Individual chat messages
- `users`: User profiles and settings
- `documents`: (If using pgvector) RAG documents

---

## 📦 Deployment Workflow

1. **Build**: `gcloud builds submit --tag gcr.io/PROJECT_ID/vizual-ai`
2. **Deploy**: `gcloud run deploy vizual-ai --image gcr.io/PROJECT_ID/vizual-ai`

---

## 📞 Contact & Support
- **Repository**: GitHub
- **Infrastructure**: Google Cloud Platform
