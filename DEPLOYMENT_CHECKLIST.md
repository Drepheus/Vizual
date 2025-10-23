# Deployment Checklist - Usage Tracking Fix

## ✅ Completed Steps

### 1. Database Functions Deployed to Supabase
- ✅ Ran `deploy-usage-tracking.sql` in Supabase SQL Editor
- ✅ Created `usage_tracking` table
- ✅ Created `can_user_perform_action` function
- ✅ Created `increment_usage` function
- ✅ Set up RLS policies

### 2. Environment Variables (Verify in Vercel Dashboard)
Required environment variables that must be set in Vercel:
- `VITE_SUPABASE_URL` = https://cnysdbjajxnpmrugnpme.supabase.co
- `VITE_SUPABASE_ANON_KEY` = eyJhbGci...
- `GOOGLE_GENERATIVE_AI_API_KEY` = AIzaSyAPU...
- `TAVILY_API_KEY` = tvly-dev-fQ...

### 3. Code Structure Verified
- ✅ `/api/chat.ts` - Working, uses Gemini 2.0 Flash
- ✅ `/api/check-usage.ts` - Calls `can_user_perform_action`
- ✅ `/api/increment-usage.ts` - Calls `increment_usage`
- ✅ `src/usageTracking.ts` - Frontend helpers
- ✅ `src/SplashPage.tsx` - Usage flow implemented

## 🔄 Chat Flow (How it Works)

1. **User Types Message** → `handleSubmit()` in SplashPage.tsx
2. **Check Usage Limit** → `checkAndShowPaywall('chat')` 
   - Calls `/api/check-usage` 
   - Which calls Supabase function `can_user_perform_action`
   - If limit reached → Show paywall modal
   - If OK → Continue
3. **Send Message** → Fetch `/api/chat`
   - Sends messages array to Gemini API
   - Returns AI response
4. **Increment Usage** → `incrementUsage(user.id, 'chat')`
   - Calls `/api/increment-usage`
   - Which calls Supabase function `increment_usage`
5. **Display Response** → Update messages state

## 🚀 Final Steps to Test

### After Supabase SQL Deployment:
1. Go to https://omi-ai-01.vercel.app
2. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
3. Sign in with your account
4. Send a test message: "Hello"
5. Check browser console for any errors

### Expected Behavior:
- ✅ No 500 errors from `/api/check-usage`
- ✅ AI responds to your message
- ✅ Usage counter increments (visible in Supabase usage_tracking table)
- ✅ After 15 messages, paywall should appear

## 🐛 If Issues Persist:

### Check Supabase Functions:
1. Go to Supabase Dashboard → Database → Functions
2. Verify `can_user_perform_action` exists
3. Verify `increment_usage` exists

### Check Vercel Environment Variables:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Ensure all 4 variables are set for Production, Preview, and Development

### Check Browser Console:
- Look for specific error messages
- Check Network tab for API response details

## 📊 Usage Limits (Free Tier)
- **Chat**: 15 messages every 4 hours (resets)
- **Image Gen**: 10 total (no reset)
- **Video Gen**: 2 total (no reset)

## 🎯 Pro Tier
- Unlimited everything
- Managed through Stripe subscriptions
