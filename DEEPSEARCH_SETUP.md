# 🔍 DeepSearch with Tavily - Setup Complete!

## ✅ What Was Added

1. **Installed Tavily SDK** (`@tavily/core`)
2. **Created DeepSearch API** (`api/deep-search.ts`)
3. **Integrated with SplashPage** - Now uses DeepSearch API when mode is active

---

## 🔑 Add Your Tavily API Key

### Option 1: You Already Have the Key! ✅

Your code snippet included the API key:
```
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
```

### Steps to Add It:

#### For Local Development (.env.local):

1. Open (or create) `.env.local` in your project root
2. Add this line:
   ```
   TAVILY_API_KEY=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
   ```
3. Save the file
4. Restart your dev server (if running)

#### For Vercel Production:

1. Go to **https://vercel.com**
2. Open your project
3. Click **Settings** → **Environment Variables**
4. Add new variable:
   ```
   Name: TAVILY_API_KEY
   Value: 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
   ```
5. Check all environments (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your app

---

## 🧪 How to Test DeepSearch

1. **Go to your Vizual website**
2. **Click the "DeepSearch" button** (◎ icon)
   - You should see the laser animation background activate
3. **Type a search query**, for example:
   - "What are the latest updates about AI in 2025?"
   - "What's happening with SpaceX right now?"
   - "Latest news about electric vehicles"
4. **Submit the query**
5. **Watch the magic happen!** 🎉

### What You'll See:

- ✅ Tavily searches the web in real-time
- ✅ Finds 5 most relevant sources
- ✅ Vizual synthesizes the information
- ✅ Provides answer with **source citations**
- ✅ Includes clickable links to sources
- ✅ Shows relevance scores

---

## 🎯 How DeepSearch Works

```
User Query → Tavily Web Search → 5 Best Sources → Vizual AI Analysis → Comprehensive Answer
```

1. **User asks a question** in DeepSearch mode
2. **Tavily searches the web** with advanced depth
3. **Returns top 5 results** with:
   - Title
   - URL
   - Content snippet
   - Relevance score
   - Quick AI-generated answer
4. **Vizual synthesizes** all sources into one comprehensive response
5. **Cites sources** with clickable links

---

## 🌟 DeepSearch Features

- ✅ **Real-time web search** - Get current information
- ✅ **Advanced search depth** - Goes beyond surface results
- ✅ **Source citations** - Every claim is backed by sources
- ✅ **Relevance scoring** - See how relevant each source is
- ✅ **AI synthesis** - Vizual combines multiple sources intelligently
- ✅ **Clickable URLs** - Direct links to original sources
- ✅ **Beautiful laser animation** - Visual indicator you're in DeepSearch mode

---

## 🔧 Custvizualzation Options

Want to change how DeepSearch works? Edit `api/deep-search.ts`:

### Change number of results:
```typescript
maxResults: 5, // Change to 3, 10, etc.
```

### Change search depth:
```typescript
searchDepth: 'advanced', // Options: 'basic' or 'advanced'
```

### Add more search options:
```typescript
const searchResults = await tavilyClient.search(searchQuery, {
  searchDepth: 'advanced',
  maxResults: 5,
  includeAnswer: true,
  includeImages: true, // Add image results
  includeDomains: ['specific-site.com'], // Only search specific sites
  excludeDomains: ['exclude-site.com'], // Exclude certain sites
});
```

---

## 📊 Usage Tracking

DeepSearch uses the same chat usage limits:
- **Free tier**: 15 searches every 4 hours
- **Pro tier**: Unlimited searches

The paywall will automatically show when limits are hit!

---

## 🆘 Troubleshooting

### "API keys not configured"
- Make sure `TAVILY_API_KEY` is in `.env.local` (local) or Vercel (production)
- Restart your dev server after adding env variables

### DeepSearch button doesn't do anything
- Check browser console (F12) for errors
- Make sure the laser animation activates when clicked

### No search results
- Check if Tavily API key is valid
- Look at Vercel function logs for errors
- Verify your Tavily account has credits

### Sources not showing in response
- Check browser console for Tavily API errors
- Verify the query isn't too vague
- Try a more specific search query

---

## 🚀 Next Steps

1. **Add the API key** to `.env.local` and Vercel
2. **Test DeepSearch** with real queries
3. **Watch usage tracking** work with the paywall
4. **Enjoy real-time web search** in your AI assistant!

---

## 💡 Pro Tips

- Use **specific queries** for best results ("latest SpaceX launch 2025" vs "SpaceX")
- **DeepSearch is perfect for**:
  - Current events and news
  - Recent tech updates
  - Real-time information
  - Fact-checking
  - Research with citations
- **Regular chat is better for**:
  - General knowledge
  - Creative writing
  - Code generation
  - Mathematical problems

---

Your DeepSearch feature is now fully integrated! Just add the API key and start searching! 🔍✨
