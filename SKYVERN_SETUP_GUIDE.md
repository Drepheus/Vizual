# Skyvern AI Web Task Integration - Setup Guide

## Overview

This guide explains how to set up and deploy the Skyvern AI Web Task feature in your Omi AI application. Skyvern enables AI-powered web browsing that can navigate websites, fill forms, extract data, and complete tasks like a human would.

---

## What is Skyvern?

**Skyvern** is an AI-powered web automation tool that uses:
- **LLMs (GPT-4o, Claude, etc.)** for understanding and reasoning
- **Computer Vision** for visual element recognition
- **Browser automation** for human-like interactions

Unlike traditional web scrapers that rely on brittle XPath selectors, Skyvern adapts to website changes and handles complex multi-step workflows.

### Key Features
- ✅ Navigate websites without pre-defined selectors
- ✅ Fill forms intelligently based on context
- ✅ Extract structured data with custom schemas
- ✅ Handle 2FA/TOTP authentication
- ✅ Download files and capture screenshots
- ✅ Record full session playback

---

## Prerequisites

1. **Skyvern Cloud Account**
   - Sign up at [app.skyvern.com](https://app.skyvern.com/)
   - Navigate to Settings → API Keys
   - Generate a new API key

2. **Vercel Project**
   - Your Omi AI app should be deployed on Vercel
   - Access to Vercel environment variables

3. **Supabase Database**
   - Existing Supabase project with authentication
   - `SUPABASE_SERVICE_ROLE_KEY` configured

---

## Environment Variables Setup

### 1. Add to Vercel Dashboard

Navigate to your Vercel project → Settings → Environment Variables and add:

```bash
# Skyvern API Key (REQUIRED)
SKYVERN_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx

# Existing variables (verify these are set)
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
GROQ_API_KEY=gsk_...your-groq-key
TAVILY_API_KEY=tvly-...your-tavily-key
```

**Important:** Set these for all environments (Production, Preview, Development)

### 2. Add to Local `.env.local` (for development)

```bash
# Add to your existing .env.local file
SKYVERN_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
```

---

## Database Schema Updates

### 1. Run SQL Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Add api_logs table for tracking API usage
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own logs
CREATE POLICY "Users can view own api logs"
  ON api_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Add web_searches column to usage_tracking
ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS web_searches INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN usage_tracking.web_searches IS 'AI Web Task usage count. Limits: Free=0, Pro=10, Ultra=50 per month';
```

### 2. Verify Schema

Check that your `user_subscriptions` table has these columns:
- `user_id` (UUID)
- `tier` (TEXT: 'free', 'pro', or 'ultra')
- `stripe_customer_id`
- `stripe_subscription_id`
- `created_at` / `updated_at`

---

## File Structure Overview

```
Omi-AI-1/
├── api/
│   ├── ai-web-task.ts              # NEW: Skyvern API endpoint
│   └── package.json                # UPDATED: Added @supabase/supabase-js
├── src/
│   ├── WebTaskModal.tsx            # NEW: AI Web Task modal component
│   ├── WebTaskModal.css            # NEW: Modal styling
│   ├── WebSearch.tsx               # UPDATED: Added modal integration
│   └── types/
│       └── skyvern.ts              # NEW: TypeScript type definitions
├── supabase-ai-web-task-schema.sql # NEW: Database migration
└── SKYVERN_SETUP_GUIDE.md          # This file
```

---

## Deployment Steps

### Step 1: Install Dependencies

```bash
cd api
npm install @supabase/supabase-js
cd ..
```

### Step 2: Commit and Push Changes

```bash
git add .
git commit -m "Add Skyvern AI Web Task integration"
git push origin main
```

### Step 3: Verify Vercel Deployment

1. Go to Vercel dashboard → Your project
2. Wait for deployment to complete
3. Check deployment logs for errors
4. Verify new API route exists: `https://your-app.vercel.app/api/ai-web-task`

### Step 4: Test the Integration

1. Navigate to Web Search mode in your app
2. Click "AI Web Task" mode (should have PRO badge)
3. Try example prompt: "Search Amazon for wireless headphones under $100"
4. Verify modal opens and task processes

---

## Usage Limits by Tier

| Tier  | Monthly Limit | Cost per Task | Notes                      |
|-------|---------------|---------------|----------------------------|
| Free  | 0             | N/A           | Not available              |
| Pro   | 10            | ~$0.50        | Recommended for testing    |
| Ultra | 50            | ~$0.40        | Volume discount            |

**Note:** Skyvern charges per step (max_steps = 15 by default). Complex tasks may use multiple steps.

---

## How It Works

### 1. User Flow

```
User clicks "AI Web Task" 
  → WebTaskModal opens
  → User enters prompt + optional URL
  → Frontend calls /api/ai-web-task
  → API checks auth + usage limits
  → API calls Skyvern Cloud API
  → API polls for completion (up to 60s)
  → Results displayed in modal
```

### 2. Backend Flow

```typescript
// /api/ai-web-task.ts
1. Verify Supabase auth token
2. Check subscription tier (free/pro/ultra)
3. Check usage_tracking.web_searches count
4. If limit exceeded → return 429 error
5. Call Skyvern API with prompt
6. Poll for task completion (max 30 attempts × 2s)
7. Log to api_logs table
8. Increment usage_tracking.web_searches
9. Return result with educational tip
```

### 3. Security Measures

- ✅ Authentication required (Supabase JWT)
- ✅ Row-level security on api_logs
- ✅ Rate limiting by subscription tier
- ✅ Service role key never exposed to frontend
- ✅ CORS headers configured

---

## API Endpoint Reference

### POST `/api/ai-web-task`

**Headers:**
```json
{
  "Authorization": "Bearer <supabase-jwt-token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "prompt": "Search Amazon for laptops under $1000 and summarize top 3",
  "url": "https://amazon.com",  // Optional
  "engine": "skyvern-2.0",      // Optional (default: skyvern-2.0)
  "max_steps": 15                // Optional (default: 15)
}
```

**Response (Success):**
```json
{
  "success": true,
  "task_id": "tsk_abc123xyz",
  "status": "completed",
  "output": "Found 3 laptops: ...",
  "screenshot_urls": ["https://..."],
  "recording_url": "https://...",
  "app_url": "https://app.skyvern.com/tasks/tsk_abc123xyz",
  "educational_tip": "✨ This task was completed using AI-powered web browsing...",
  "usage": {
    "current": 3,
    "limit": 10,
    "remaining": 7
  }
}
```

**Response (Error - Rate Limit):**
```json
{
  "error": "Usage limit exceeded",
  "details": "You've used 10/10 AI Web Tasks this month. Upgrade for more!",
  "current": 10,
  "limit": 10,
  "reset_at": "2025-12-01T00:00:00Z"
}
```

**Response (Error - Free Tier):**
```json
{
  "error": "Premium feature",
  "details": "AI Web Task is only available for Pro and Ultra subscribers",
  "upgrade_required": true,
  "tier": "free"
}
```

---

## Troubleshooting

### Issue: "SKYVERN_API_KEY not configured"

**Solution:**
1. Verify API key is set in Vercel environment variables
2. Redeploy after adding the variable
3. Check Vercel logs: `Deployment Logs` → Search for "SKYVERN_API_KEY"

### Issue: "Invalid authentication token"

**Solution:**
1. Check if user is logged in (not guest mode)
2. Verify Supabase session is valid
3. Clear browser cookies and re-login

### Issue: "Usage limit exceeded" (but user has remaining)

**Solution:**
1. Check `usage_tracking` table for correct `web_searches` count
2. Verify `period_start` and `period_end` are current month
3. Run SQL to reset (if needed):
```sql
UPDATE usage_tracking 
SET web_searches = 0 
WHERE user_id = '<user-uuid>' 
  AND period_start >= date_trunc('month', CURRENT_DATE);
```

### Issue: Task stuck in "running" status

**Solution:**
1. This is normal for complex tasks (up to 60s)
2. Check Skyvern dashboard for task details
3. If timeout occurs, reduce `max_steps` parameter
4. Ensure prompt is clear and specific

### Issue: "Skyvern API returned 402: Payment Required"

**Solution:**
1. Check Skyvern account billing at [app.skyvern.com/billing](https://app.skyvern.com/billing)
2. Verify payment method is valid
3. Top up account balance

---

## Cost Optimization Tips

1. **Use Skyvern 1.0 for simple tasks** (cheaper than 2.0)
2. **Set lower max_steps** (default 15, try 10 for simple tasks)
3. **Cache common results** (implement Redis caching)
4. **Batch similar tasks** (use workflows for repetitive tasks)
5. **Monitor usage** via `api_logs` table

---

## Advanced Configuration

### Custom Data Extraction Schema

You can specify a JSON schema to extract structured data:

```typescript
const result = await fetch('/api/ai-web-task', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    prompt: 'Find laptop prices on Best Buy',
    url: 'https://bestbuy.com',
    data_extraction_schema: {
      type: 'object',
      properties: {
        laptops: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price: { type: 'number' },
              rating: { type: 'number' }
            }
          }
        }
      }
    }
  })
});
```

### Webhook Notifications

For long-running tasks, set a webhook URL:

```typescript
{
  prompt: 'Download all invoices from portal',
  webhook_url: 'https://your-app.com/api/skyvern-webhook',
  max_steps: 30
}
```

### Proxy Locations (Skyvern Cloud)

For geo-specific content:

```typescript
{
  prompt: 'Search for UK-specific deals',
  url: 'https://amazon.co.uk',
  proxy_location: 'RESIDENTIAL_GB'  // UK residential proxy
}
```

---

## Self-Hosting Alternative (Optional)

If Skyvern Cloud is not feasible, you can self-host Skyvern on Render.com or similar platforms:

### Prerequisites
- Docker installed locally
- Render.com account (free tier available)

### Steps

1. **Clone Skyvern Repository**
```bash
git clone https://github.com/Skyvern-AI/skyvern.git
cd skyvern
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your OpenAI/Anthropic API keys
```

3. **Build Docker Image**
```bash
docker build -t skyvern-app .
```

4. **Deploy to Render.com**
- Create new "Web Service" on Render
- Connect to your GitHub repository
- Set Docker image: `skyvern-app`
- Expose port: 8000
- Add environment variables from `.env`

5. **Update Omi AI Configuration**
```typescript
// In /api/ai-web-task.ts, change:
const skyvernApiUrl = process.env.SKYVERN_BASE_URL || 'https://your-render-app.onrender.com';

// Call endpoint:
await fetch(`${skyvernApiUrl}/v1/run/tasks`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.SKYVERN_API_KEY,
  },
  body: JSON.stringify(taskRequest)
});
```

**Note:** Self-hosting requires significant resources (2GB+ RAM, GPU optional but recommended).

---

## Monitoring and Analytics

### View Usage Stats

```sql
-- Check total AI Web Task usage per user
SELECT 
  u.email,
  ut.web_searches,
  ut.period_start,
  ut.period_end,
  us.tier
FROM usage_tracking ut
JOIN auth.users u ON u.id = ut.user_id
LEFT JOIN user_subscriptions us ON us.user_id = ut.user_id
WHERE ut.period_start >= date_trunc('month', CURRENT_DATE)
ORDER BY ut.web_searches DESC;
```

### View API Logs

```sql
-- Check recent AI Web Task API calls
SELECT 
  u.email,
  al.endpoint,
  al.request_data->>'prompt' as prompt,
  al.response_data->>'task_id' as task_id,
  al.response_data->>'status' as status,
  al.status_code,
  al.created_at
FROM api_logs al
JOIN auth.users u ON u.id = al.user_id
WHERE al.endpoint = 'ai-web-task'
ORDER BY al.created_at DESC
LIMIT 50;
```

---

## Support and Resources

- **Skyvern Docs:** [skyvern.com/docs](https://www.skyvern.com/docs)
- **API Reference:** [skyvern.com/docs/api-reference](https://www.skyvern.com/docs/api-reference/api-reference/agent/run-task/)
- **GitHub:** [github.com/Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern)
- **Discord:** [discord.gg/fG2XXEuQX3](https://discord.gg/fG2XXEuQX3)
- **Email:** founders@skyvern.com

---

## Next Steps

1. ✅ Verify Skyvern API key is working
2. ✅ Test with simple prompt in production
3. ✅ Monitor usage and costs
4. ✅ Add more example prompts to WebTaskModal
5. ✅ Implement result caching (optional)
6. ✅ Add analytics dashboard (optional)

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Maintainer:** Drepheus (Omi AI)
