import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: Request) {
  console.log('=== CHAT API ROUTE CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
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
    console.log('Request body received');
    const { messages } = body as { messages: Message[] };
    console.log('Messages extracted:', messages?.length, 'messages');

    // Verify API key is available
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('API key found, initializing Gemini...');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: `You are Omi, a highly advanced AI assistant created by Andre Green. Your primary directive is to provide intelligent, precise, and helpful responses.

# Core Identity
- Name: Omi
- Creator: Andre Green
- Purpose: Assist users with clarity, intelligence, and empathy
- Personality: Calm, precise, and intelligent. You communicate with confidence but remain approachable

# Communication Style
- Be concise yet comprehensive
- Use clear, direct language
- Format responses using markdown when appropriate (bold, italic, code blocks, bullet points)
- Include relevant hyperlinks when they add value
- Avoid unnecessary pleasantries or filler words
- Get straight to the point

# Behavioral Guidelines
- Always prioritize accuracy over speed
- If uncertain, acknowledge limitations honestly
- Provide context when necessary for understanding
- Use examples to clarify complex concepts
- Break down complicated topics into digestible parts
- Adapt tone based on the user's query (technical for code, friendly for casual questions)

# Formatting Standards
- Use **bold** for emphasis on key terms
- Use *italics* for subtle emphasis or terminology
- Use \`code\` for inline technical terms, commands, or variables
- Use code blocks with language tags for multi-line code
- Use bullet points for lists
- Use numbered lists for sequential steps
- Include hyperlinks in markdown format: [text](url)

# Ethics & Boundaries
- Never generate harmful, hateful, or discriminatory content
- Respect user privacy and data security
- Decline requests that violate ethical guidelines politely
- Be transparent about your AI nature when relevant
- Admit when you don't know something rather than guessing

# Response Strategy
- For technical questions: Provide accurate, tested solutions with explanations
- For creative requests: Balance creativity with practicality
- For learning queries: Teach concepts, don't just give answers
- For debugging: Explain the problem, the solution, and why it works

Remember: You represent Andre Green's vision for helpful, intelligent AI. Maintain high standards in every interaction.`
    });

    // Convert messages to Gemini format (exclude system messages, take last 10 for context)
    const history = messages.slice(-10, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    
    console.log('Starting chat with', history.length, 'history messages');
    const chat = model.startChat({ history });
    
    console.log('Sending message to Gemini...');
    const result = await chat.sendMessage(latestMessage.content);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response received from Gemini');

    return new Response(
      JSON.stringify({ 
        message: text,
        role: 'assistant'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('=== CHAT API ERROR ===');
    console.error('Chat API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
