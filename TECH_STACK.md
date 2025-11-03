# Omi AI - Tech Stack & Infrastructure Breakdown

## 📋 Executive Summary
Full-stack AI chat application with multi-LLM support, real-time conversations, subscription management, and advanced features including web search, image/video generation, and custom AI personas.

---

## 🏗️ Architecture Overview

### Deployment Model: **Hybrid Serverless**
- **Frontend**: Static React SPA hosted on Vercel Edge Network
- **Backend**: Vercel Serverless Functions (on-demand execution)
- **Database**: Supabase (PostgreSQL + Real-time + Auth)
- **Assets**: Vercel CDN + Static folder (`/static`)

---

## 💻 Frontend Stack

### Core Framework
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.9.2** - Type-safe development
- **Vite 7.1.7** - Ultra-fast build tool & dev server
  - Port: `5175` (strict mode)
  - Public dir: `static/` (custom assets)
  - Source maps enabled for production debugging

### UI/Animation Libraries
- **GSAP 3.13.0** - Professional-grade animations (ChromaGrid, ElectricBorder)
- **Motion 12.23.21** - Modern animation library (Dock component)
- **gl-matrix 3.4.4** - WebGL math utilities
- **OGL 1.0.11** - Lightweight WebGL library
- **Three.js 0.180.0** - 3D graphics (InfiniteMenu)

### Routing & Navigation
- **React Router DOM 7.9.5** - Client-side routing
  - Routes: `/`, `/chat`, `/media-studio`, `/custom-omis`
  - Guest mode support with route protection

### State Management
- **React Hooks** - useState, useEffect, useRef, useContext
- **Context API** - Guest mode context provider
- **Local Storage** - Conversation persistence, guest mode flags

---

## 🔧 Backend Stack

### Serverless Functions (Vercel)
Location: `/api` directory

**API Endpoints:**
1. **`/api/chat.ts`** - Main chat streaming endpoint
   - Google Gemini integration
   - Streaming responses via ReadableStream
   - Compare mode support (dual LLM queries)

2. **`/api/web-search.ts`** - AI-powered web search
   - Tavily API (web scraping & search)
   - Groq API (LLaMA 3.3 70B for summaries)
   - Search modes: Summarize, Deep Dive, Research

3. **`/api/generate-image.js`** - Image generation
   - Replicate API integration
   - Real-time image generation

4. **`/api/generate-video.js`** - Video generation
   - Replicate API integration
   - Video prompt processing

5. **`/api/stripe-webhook.ts`** - Payment processing
   - Webhook signature verification
   - Subscription lifecycle management

6. **`/api/check-usage.ts`** - Usage tracking
   - Rate limiting enforcement
   - Tier-based limits (free/pro/ultra)

7. **`/api/increment-usage.ts`** - Usage updates
   - Atomic counter increments

8. **`/api/create-checkout-session.ts`** - Payment sessions
   - Stripe Checkout integration

### Dependencies (API)
```json
{
  "groq-sdk": "^0.7.0",
  "@vercel/node": "^3.0.0"
}
```

---

## 🗄️ Database & Backend Services

### Supabase (Primary Backend)
**Database**: PostgreSQL 15+
**Features Used**:
- Authentication (Google OAuth + Magic Links)
- Row Level Security (RLS)
- Real-time subscriptions
- Storage buckets (media uploads)

**Schema Tables**:
```sql
conversations
├── id (uuid, PK)
├── user_id (uuid, FK)
├── title (text)
├── model (text)
├── created_at (timestamp)
└── updated_at (timestamp)

messages
├── id (uuid, PK)
├── conversation_id (uuid, FK)
├── role (text) - 'user' | 'assistant'
├── content (text)
├── model (text)
└── created_at (timestamp)

usage_tracking
├── user_id (uuid, PK)
├── chat_count (integer)
├── image_count (integer)
├── video_count (integer)
├── search_count (integer)
├── reset_at (timestamp)
└── tier (text) - 'free' | 'pro' | 'ultra'

user_subscriptions
├── user_id (uuid, PK, FK)
├── stripe_customer_id (text)
├── stripe_subscription_id (text)
├── subscription_tier (text)
├── subscription_status (text)
├── current_period_end (timestamp)
└── cancel_at_period_end (boolean)

generated_media
├── id (uuid, PK)
├── user_id (uuid, FK)
├── media_type (text) - 'image' | 'video'
├── url (text)
├── prompt (text)
├── status (text)
└── created_at (timestamp)
```

---

## 🤖 AI/ML Service Integrations

### 1. Google Gemini (Primary LLM)
- **Model**: `gemini-1.5-flash` (default)
- **Use Case**: Main chat conversations
- **Library**: `@google/generative-ai` v0.24.1
- **Features**: Streaming responses, context management

### 2. Groq (Fast Inference)
- **Model**: `llama-3.3-70b-versatile`
- **Use Case**: Web search summarization
- **Library**: `groq-sdk` v0.7.0
- **Speed**: Ultra-fast inference for real-time summaries

### 3. Tavily (Web Search)
- **API**: REST API
- **Use Case**: Web scraping, search results aggregation
- **Features**: Deep search, citations, published dates

### 4. Replicate (Media Generation)
- **Library**: `replicate` v1.3.0
- **Models**:
  - Image: Various Stable Diffusion models
  - Video: AI video generation models
- **Features**: Webhook notifications, status polling

---

## 💳 Payment Infrastructure

### Stripe Integration
- **Library**: `stripe` v19.1.0
- **Mode**: Live & Test environments
- **Features**:
  - Checkout Sessions (embedded flow)
  - Customer Portal
  - Webhook Events (`customer.subscription.*`)
  - Usage-based billing tracking

**Plans**:
- **Free**: Limited usage (10 chats, 3 images, 1 video/month)
- **Pro**: $4.99/month (100 chats, 25 images, 10 videos/month)
- **Ultra**: $20/month (Direct Stripe link, unlimited)

---

## 🔐 Authentication & Security

### Auth Stack
- **Provider**: Supabase Auth
- **Methods**:
  - Google OAuth (primary)
  - Magic Link (email)
  - Guest Mode (localStorage-based)

### Security Features
- **Row Level Security (RLS)**: All database access restricted by user_id
- **CORS**: Configured for Vercel origins
- **Environment Variables**: Secrets stored in Vercel
- **Rate Limiting**: Usage tracking per tier
- **Webhook Verification**: Stripe signature validation

### Environment Variables Required
```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Google AI
VITE_GOOGLE_API_KEY=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AI Services (Backend)
GROQ_API_KEY=
TAVILY_API_KEY=
REPLICATE_API_TOKEN=
```

---

## 📦 Build & Deployment

### Build Process
```bash
# Development
npm run dev          # Starts Vite dev server on :5175

# Production Build
npm run build        # Outputs to /dist
vite build
├── index.html
├── assets/
│   ├── [hash].js    # Bundled JS (code-split)
│   └── [hash].css   # Bundled CSS
└── static/          # Copied as-is
```

### Deployment Flow (Vercel)
1. **Trigger**: Git push to `main` branch
2. **Build Command**: `vite build`
3. **Output Directory**: `dist/`
4. **API Functions**: Auto-deployed from `/api`
5. **Environment**: Injected from Vercel dashboard
6. **CDN**: Automatic edge caching

### Vercel Configuration (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
- API routes preserved
- SPA fallback to index.html

---

## 🎨 Key Features & Components

### Core Features
1. **Multi-LLM Chat** - Compare mode with side-by-side models
2. **AI Personas** - 6 preset personalities (Teacher, Critic, Explorer, etc.)
3. **Web Search** - AI-powered with Tavily + Groq summarization
4. **Image Generation** - Real-time via Replicate
5. **Video Generation** - AI video creation
6. **Media Gallery** - User-generated content archive
7. **Create Mode** - Infinite menu with creative tools
8. **Subscription Management** - Stripe-powered tiers

### Major Components
```
src/
├── SplashPage.tsx        # Main chat interface
├── Auth.tsx              # Authentication wrapper
├── LoginPage.tsx         # Login/signup UI
├── PaywallModal.tsx      # Subscription upgrade
├── WebSearch.tsx         # Web search interface
├── MediaGallery.tsx      # User media archive
├── MediaStudio.tsx       # Media generation UI
├── ChromaGrid.tsx        # Personas overlay (GSAP)
├── InfiniteMenu.tsx      # 3D menu (Three.js/OGL)
├── Dock.tsx              # Bottom navigation (Motion)
├── ConversationSidebar.tsx  # Chat history
└── CommandHub.tsx        # MagicBento command center
```

---

## 📊 Performance Considerations

### Frontend Optimization
- **Code Splitting**: React.lazy() for routes
- **Tree Shaking**: Vite automatic optimization
- **Asset Optimization**: Static folder for media
- **Source Maps**: Enabled for debugging

### Backend Optimization
- **Serverless Cold Starts**: ~200-500ms initial
- **Streaming Responses**: Chat uses ReadableStream
- **Edge Caching**: Static assets on CDN
- **Database Queries**: Indexed by user_id

### Monitoring & Logs
- **Vercel Analytics**: Runtime metrics
- **Vercel Logs**: Real-time function logs
- **Console Debugging**: Extensive client-side logging

---

## 🚀 Scaling Considerations

### Current Bottlenecks
1. **Serverless Function Limits**:
   - 10s timeout on Hobby plan
   - 50s on Pro plan
   - May need streaming for long tasks

2. **Database Connections**:
   - Supabase pooler handles connections
   - Consider Prisma for connection pooling at scale

3. **API Rate Limits**:
   - Replicate: Per-model limits
   - Groq: Token-based
   - Tavily: Request-based

### Recommended Upgrades for Scale
1. **Vercel Pro Plan** - Longer function timeouts, more bandwidth
2. **Supabase Pro** - Higher connection limits, better performance
3. **Redis Cache** - Store frequently accessed data
4. **CDN for Media** - Cloudflare R2 or Vercel Blob for user-generated content
5. **Message Queue** - BullMQ for video generation jobs
6. **Monitoring** - Sentry for error tracking, Datadog/New Relic for APM

---

## 🐛 Known Issues & Limitations

### Current State
- ✅ **Search + Summarize** - Working with Groq + Tavily
- 🚧 **Compare Mode** - Functional but needs UX polish
- 🚧 **Video Generation** - Long processing times (30-60s)
- 🚧 **Guest Mode** - Limited persistence (localStorage only)
- ❌ **Mobile UX** - Needs responsive design improvements
- ❌ **Offline Mode** - No PWA support yet

---

## 📝 Future Architecture Recommendations

### Short-term (1-3 months)
1. **Add Redis** for session management and caching
2. **Implement WebSockets** for real-time features (Supabase Realtime)
3. **Add Error Boundary** components for better error handling
4. **Set up Sentry** for production error tracking
5. **Add E2E Tests** with Playwright or Cypress

### Mid-term (3-6 months)
1. **Migrate to Turborepo** for monorepo management
2. **Add GraphQL Layer** (Hasura) for complex queries
3. **Implement Background Jobs** with BullMQ + Redis
4. **Add Vector Database** (Pinecone/Weaviate) for RAG
5. **Implement AI Model Router** for intelligent model selection

### Long-term (6-12 months)
1. **Kubernetes/Docker** for self-hosted option
2. **Multi-region Deployment** for global CDN
3. **Real-time Collaboration** features
4. **Custom Model Training** pipeline
5. **Enterprise Features** (SSO, audit logs, team workspaces)

---

## 🔗 Repository Structure
```
Omi-AI-1/
├── api/                  # Vercel serverless functions
│   ├── chat.ts
│   ├── web-search.ts
│   ├── generate-*.js
│   └── package.json      # API dependencies
├── src/                  # React frontend
│   ├── components/
│   ├── services/
│   └── assets/
├── static/               # Static assets (images, videos)
│   ├── images/
│   └── videos/
├── dist/                 # Build output (gitignored)
├── package.json          # Frontend dependencies
├── vite.config.ts        # Build configuration
├── vercel.json           # Deployment config
└── tsconfig.json         # TypeScript config
```

---

## 📞 Contact & Support
- **Repository**: https://github.com/Drepheus/Omi-AI
- **Deployment**: Vercel (omi-ai-01.vercel.app)
- **Environment**: Production

---

**Last Updated**: November 2, 2025  
**Stack Version**: v1.0.0  
**Node Version**: 18.x (Vercel runtime)
