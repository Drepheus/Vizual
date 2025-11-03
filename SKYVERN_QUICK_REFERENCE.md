# Skyvern AI Web Task - Quick Reference Card

## 🚀 Quick Start (30 seconds)

### 1. Get Skyvern API Key
```bash
1. Go to app.skyvern.com
2. Sign up/login
3. Settings → API Keys → Create new key
4. Copy: sk_live_xxxxxxxxxxxxxxxx
```

### 2. Add to Vercel
```bash
Vercel Dashboard → Your Project → Settings → Environment Variables
Name: SKYVERN_API_KEY
Value: sk_live_xxxxxxxxxxxxxxxx
Environments: ✓ Production ✓ Preview ✓ Development
```

### 3. Run Database Migration
```sql
-- Supabase SQL Editor: Execute supabase-ai-web-task-schema.sql
-- Creates: api_logs table + web_searches column
```

### 4. Deploy
```bash
git add .
git commit -m "feat: Add Skyvern AI Web Task"
git push origin main
```

---

## 📝 Usage Limits

| Tier  | Tasks/Month | Accessible? |
|-------|-------------|-------------|
| Free  | 0           | ❌ Upgrade Required |
| Pro   | 10          | ✅ Full Access |
| Ultra | 50          | ✅ Full Access |

---

## 🎯 Example Prompts

```
✅ "Search Amazon for wireless headphones under $100"
✅ "Find job openings for Software Engineers on LinkedIn"
✅ "Navigate to Airbnb and find 3-bedroom rentals in Paris"
✅ "Go to GitHub and search for trending Python repositories"
✅ "Visit Booking.com and find hotels in Tokyo with 8+ rating"
```

---

## 🔧 API Endpoint

```bash
POST /api/ai-web-task
Authorization: Bearer <supabase-jwt>

{
  "prompt": "Your task description",
  "url": "https://optional-starting-url.com",
  "engine": "skyvern-2.0",
  "max_steps": 15
}
```

---

## 🐛 Troubleshooting (1 minute)

### "SKYVERN_API_KEY not configured"
→ Add to Vercel env vars → Redeploy

### "Premium feature required"
→ User is on Free tier → Upgrade to Pro

### "Usage limit exceeded"
→ Monthly quota reached → Wait or upgrade

### Task stuck "running"
→ Normal for complex tasks (up to 60s)

---

## 📊 Monitor Usage

```sql
-- Check user usage
SELECT email, web_searches, tier
FROM usage_tracking ut
JOIN auth.users u ON u.id = ut.user_id
JOIN user_subscriptions us ON us.user_id = ut.user_id
WHERE period_start >= date_trunc('month', CURRENT_DATE);
```

---

## 🎨 UI Components

**Files Added:**
- `api/ai-web-task.ts` - Serverless function
- `src/WebTaskModal.tsx` - Modal component
- `src/WebTaskModal.css` - Styling
- `src/types/skyvern.ts` - TypeScript types

**Files Updated:**
- `src/WebSearch.tsx` - Added modal trigger
- `api/package.json` - Added @supabase/supabase-js

---

## 🔗 Resources

- **Setup Guide:** `SKYVERN_SETUP_GUIDE.md`
- **Full Summary:** `SKYVERN_INTEGRATION_SUMMARY.md`
- **Skyvern Docs:** skyvern.com/docs
- **API Reference:** skyvern.com/docs/api-reference

---

## ✅ Verification Steps

1. Set SKYVERN_API_KEY in Vercel ✓
2. Run database migration in Supabase ✓
3. Deploy to production ✓
4. Test as Pro user ✓
5. Verify free user sees upgrade prompt ✓
6. Check usage tracking increments ✓

---

**Last Updated:** Nov 2, 2025 | **Version:** 1.0.0 | **By:** Drepheus (Omi AI)
