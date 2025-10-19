import { tavily } from '@tavily/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: Request) {
  console.log('=== DEEPSEARCH API ROUTE CALLED ===');
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  try {
    const body = await req.json();
    const { messages } = body as { messages: Message[] };
    
    // Get the latest user message (the search query)
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const searchQuery = lastUserMessage?.content || '';
    
    console.log('DeepSearch query:', searchQuery);

    // Verify API keys
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!tavilyApiKey || !googleApiKey) {
      console.error('Missing API keys');
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Tavily client
    const tavilyClient = tavily({ apiKey: tavilyApiKey });
    
    console.log('Performing Tavily search...');
    
    // Perform deep search with Tavily
    const searchResults = await tavilyClient.search(searchQuery, {
      searchDepth: 'advanced', // Use advanced search for deeper results
      maxResults: 5,
      includeAnswer: true, // Get AI-generated answer
      includeRawContent: false,
    });
    
    console.log('Tavily search completed:', searchResults.results?.length, 'results');

    // Format search results for context
    let searchContext = '';
    
    if (searchResults.answer) {
      searchContext += `## Quick Answer\n${searchResults.answer}\n\n`;
    }
    
    if (searchResults.results && searchResults.results.length > 0) {
      searchContext += `## Sources Found\n`;
      searchResults.results.forEach((result: any, index: number) => {
        searchContext += `\n### ${index + 1}. ${result.title}\n`;
        searchContext += `**URL:** ${result.url}\n`;
        searchContext += `**Content:** ${result.content}\n`;
        if (result.score) {
          searchContext += `**Relevance:** ${(result.score * 100).toFixed(1)}%\n`;
        }
      });
    }

    // Create enhanced system prompt with search results
    const enhancedSystemPrompt = `You are Omi, a highly advanced AI assistant created by Andre Green, now in **DeepSearch Mode**.

# DeepSearch Mode
You have access to real-time web search results from Tavily. Use this information to provide comprehensive, up-to-date answers.

# Search Results Context
${searchContext}

# Instructions
- Synthesize information from the search results above
- Cite specific sources when referencing information
- Provide URLs as markdown links: [Source Title](URL)
- If the search results are insufficient, acknowledge what's available and what's missing
- Combine your knowledge with the search results for the most comprehensive answer
- Format your response clearly with headings, bullet points, and proper citations

# Communication Style
- Be precise and fact-based
- Include source citations for claims
- Use **bold** for emphasis
- Use bullet points for lists
- Provide actionable insights when possible

Remember: You're in DeepSearch mode, so leverage the web search results to give the most current and accurate information possible.`;

    console.log('Initializing Gemini with search context...');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: enhancedSystemPrompt
    });

    // Convert messages to Gemini format (exclude latest, take last 10 for context)
    const history = messages.slice(-10, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
    
    console.log('Starting chat with', history.length, 'history messages');
    const chat = model.startChat({ history });
    
    console.log('Sending message to Gemini...');
    const result = await chat.sendMessage(searchQuery);
    const response = await result.response;
    const text = response.text();
    
    console.log('DeepSearch response generated');

    return new Response(
      JSON.stringify({ 
        message: text,
        role: 'assistant',
        sources: searchResults.results?.map((r: any) => ({
          title: r.title,
          url: r.url,
          score: r.score
        }))
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('=== DEEPSEARCH API ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process DeepSearch request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
