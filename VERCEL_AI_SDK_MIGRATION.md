# Vercel AI SDK Migration

## Changes Made

1. **Installed Vercel AI SDK packages**
   - `ai@^4.0.0` - Core AI SDK with React hooks
   - `@ai-sdk/google@^2.0.23` - Google Gemini provider

2. **Created API Route** (`api/chat/route.ts`)
   - Serverless Edge function for chat endpoints
   - API key secured server-side via environment variable
   - Implements streaming with `streamText`
   - Full Omi system message included

3. **Refactored SplashPage.tsx**
   - Replaced manual `fetch` calls with `useChat` hook
   - Automatic message state management
   - Built-in streaming support
   - Cleaner code with less boilerplate

4. **Security Improvements**
   - API key moved from frontend to `.env.local`
   - Only accessible server-side in API routes
   - No longer exposed in browser

## Required: Vercel Environment Variable

**IMPORTANT:** Before deploying, add this environment variable in Vercel dashboard:

```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAPUrVUTLGnhPOY6KFypgSqqFB3hRKLEug
```

### How to add in Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project (omi-ai-01)
3. Go to Settings → Environment Variables
4. Add: `GOOGLE_GENERATIVE_AI_API_KEY`
5. Value: `AIzaSyAPUrVUTLGnhPOY6KFypgSqqFB3hRKLEug`
6. Check all environments (Production, Preview, Development)
7. Save

## Benefits

- ✅ **Streaming**: Real-time token-by-token responses
- ✅ **Security**: API key hidden from frontend
- ✅ **Simplicity**: Less code, automatic state management
- ✅ **Flexibility**: Easy to add more AI providers (OpenAI, Anthropic, etc.)
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Error Handling**: Built-in retry and error management

## Testing

Run locally:
```bash
npm run dev
```

The app should work exactly as before, but now with:
- Proper streaming (you'll see words appear as they're generated)
- Secure API key (not visible in Network tab)
- Better performance (optimized SDK)
