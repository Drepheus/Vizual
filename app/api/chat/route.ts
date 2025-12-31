import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { trackUsage, logApiCall } from '@/lib/usage-tracking';

// Force Node.js runtime
export const runtime = "nodejs"; 

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `You are Vizual, a highly advanced AI assistant created by Drepheus. Your primary directive is to provide intelligent, precise, and helpful responses.

# Core Identity
- Name: Vizual
- Creator: Drepheus
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

Remember: You represent Drepheus's vision for helpful, intelligent AI. Maintain high standards in every interaction.`;

export async function POST(req: Request) {
  console.log('=== CHAT API ROUTE CALLED ===');
  const startTime = Date.now();
  let user = null;

  try {
    // 1. Safe Auth Check
    try {
      const cookieStore = cookies(); 
      // In Next.js 15+, cookies() is async. We await it if it's a prvizualse, or use it directly.
      // @ts-ignore - Handling potential Prvizualse return from cookies()
      const resolvedCookies = typeof cookieStore.then === 'function' ? await cookieStore : cookieStore;
      
      const supabase = createRouteHandlerClient({ cookies: () => resolvedCookies });
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user;
      if (user) console.log('User authenticated:', user.id);
      else console.log('Guest user');
    } catch (authError) {
      console.warn('Auth check failed (continuing as guest):', authError);
    }

    // 2. Parse Request
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse JSON body:', e);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { messages, model = 'Gemini' } = body as { messages: Message[], model?: string };
    console.log('Messages extracted:', messages?.length, 'messages');
    console.log('Selected Model:', model);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    let responseText = '';

    // 3. Model Selection & Execution
    if (model === 'OpenAI') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('Missing OPENAI_API_KEY');
        throw new Error('OpenAI API key is not configured');
      }

      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
      });
      responseText = completion.choices[0].message.content || '';

    } else if (model === 'Groq') {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.error('Missing GROQ_API_KEY');
        throw new Error('Groq API key is not configured');
      }

      const groq = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      const completion = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
      });
      responseText = completion.choices[0].message.content || '';

    } else {
      // Default to Gemini
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
        throw new Error('Gemini API key is not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Try Gemini 3 first, fallback to 2.0 Flash Exp if it fails
      try {
        console.log('Attempting to use gemini-3-flash-preview...');
        const geminiModel = genAI.getGenerativeModel({ 
          model: 'gemini-3-flash-preview',
          systemInstruction: SYSTEM_INSTRUCTION
        });

        const history = messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const latestMessage = messages[messages.length - 1];
        const chat = geminiModel.startChat({ history });
        const result = await chat.sendMessage(latestMessage.content);
        const response = await result.response;
        responseText = response.text();
      } catch (geminiError) {
        console.warn('Gemini 3 failed, falling back to gemini-2.0-flash-exp:', geminiError);
        
        const geminiModel = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          systemInstruction: SYSTEM_INSTRUCTION
        });

        const history = messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const latestMessage = messages[messages.length - 1];
        const chat = geminiModel.startChat({ history });
        const result = await chat.sendMessage(latestMessage.content);
        const response = await result.response;
        responseText = response.text();
      }
    }
    
    console.log('Response received from', model);

    // 4. Track Usage (Fire and Forget)
    if (user) {
      (async () => {
        try {
          await trackUsage(user.id, 'chat');
          await logApiCall({
            user_id: user.id,
            email: user.email,
            endpoint: '/api/chat',
            status_code: 200,
            duration_ms: Date.now() - startTime,
            request_data: { message_count: messages.length, model },
            response_data: { success: true }
          });
        } catch (trackingError) {
          console.error('BACKGROUND TRACKING ERROR (Non-fatal):', trackingError);
        }
      })();
    }

    return NextResponse.json({ 
      message: responseText,
      role: 'assistant'
    });

  } catch (error) {
    console.error('=== CHAT API CRITICAL ERROR ===');
    console.error('Error details:', error);
    
    // Log error
    if (user) {
      logApiCall({
        user_id: user.id,
        email: user.email,
        endpoint: '/api/chat',
        status_code: 500,
        duration_ms: Date.now() - startTime,
        request_data: { error: error instanceof Error ? error.message : 'Unknown' }
      }).catch(err => console.error('API logging error:', err));
    }

    return NextResponse.json({ 
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
