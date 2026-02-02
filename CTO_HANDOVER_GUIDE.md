# Vizual: CTO Technical Handover Guide

## 1. Project Overview
Vizual is an AI-powered creative studio platform allowing users to generate high-fidelity images and videos using various state-of-the-art models. It features a community feed, project management, and a premium "studio" interface.

## 2. Technology Stack

### Frontend / Application Framework
*   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) - Utilizing React Server Components (RSC) and Server Actions.
*   **Language:** TypeScript (Strict mode enabled).
*   **Styling:** Tailwind CSS + Vanilla CSS for complex animations.
*   **UI Components:** Custom components built with Lucide React icons. No heavy UI libraries (like MUI/Chakra) to maintain high performance.

### Backend & API
*   **Server:** Next.js API Routes (`app/api/*`) running on edge/serverless runtime.
*   **Database:** Supabase (PostgreSQL 15+).
*   **Authentication:** Supabase Auth (OAuth with Google + Email/Password).
*   **Storage:** Supabase Storage (for user avatars and generated media assets).

### AI Infrastructure
*   **Image Generation:** 
    *   **Provider:** Wavespeed AI (via API) & Black Forest Labs fallback.
    *   **Models:** Flux 1.1 Pro, Flux Schnell, Ideogram v2.
*   **Video Generation:**
    *   **Provider:** Wavespeed AI (via API) & Minimax/Ali-Vilab.
    *   **Models:** Seedance v1, Minimax Video-01, Wan 2.1 (Alibaba).
*   **SDKs:** Custom REST implementation in `app/api/generate-*`.

## 3. Cloud Infrastructure & Deployment

### Deployment Target
*   **Platform:** **Google Cloud Run** (Fully managed serverless container platform).
*   **Region:** `us-central1`.
*   **Containerization:** Docker (Multi-stage build optimized for Next.js standalone output).

### Deployment Pipeline
*   **Script:** `deploy-optimized.ps1` (PowerShell automation).
*   **Process:**
    1.  **Build:** Google Cloud Build compiles the Docker image remotely.
    2.  **Push:** Image stored in Google Container Registry (`gcr.io`).
    3.  **Deploy:** Cloud Run performs a rolling update (zero-downtime).
*   **Optimization:** Configured with `min-instances=1` and `cpu-boost` to eliminate cold starts and ensure instant API response.

## 4. Database Schema (Supabase)

### Core Tables
1.  **`auth.users`**: Managed by Supabase Auth.
2.  **`public.users`**: Public profiles (synced via triggers from `auth.users`).
    *   `id` (UUID, PK), `name`, `avatar_url`.
3.  **`public.generated_media`**: Stores all user creations.
    *   `id`, `user_id` (FK), `type` ('image'|'video'), `url`, `prompt`, `created_at`.
4.  **`public.drafts`**: Tracks in-progress generations (polling queue).

### Security
*   **RLS (Row Level Security):** Enabled on all tables.
*   **Policies:**
    *   Users can strict `SELECT/INSERT` their own data.
    *   **Community Feed** implementation uses **Service Role Key** (Server-side) to bypass RLS for public feed fetching, ensuring data privacy is maintained at the database level while allowing controlled public access via API.

## 5. Key Configuration Files
*   `access_token` management: `lib/supabase-server.ts`.
*   `deploy-optimized.ps1`: Main deployment orchestration.
*   `next.config.mjs`: Build configuration (standalone mode enabled, image domains whitelisted).
*   `cloudbuild.yaml`: Google Cloud Build instruction step definition.

## 6. Access & Secrets
*   **Environment Variables:** Managed via Cloud Run "Edit & Deploy" console or injected via `deploy-optimized.ps1`.
*   **Critical Secrets:**
    *   `SUPABASE_SERVICE_ROLE_KEY`: Required for saving media and fetching community feed (Admin privileges).
    *   `WAVESPEED_API_KEY`: Required for AI generation.

## 7. Development Workflow
*   **Local Dev:** `pnpm dev` (Runs at localhost:3000).
*   **Deployment:** Run `.\deploy-optimized.ps1` from root.
*   **Linting:** ESLint is enabled but configured to not block builds on non-critical warnings.
