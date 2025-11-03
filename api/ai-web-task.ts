import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Skyvern API types
interface SkyvernTaskRequest {
  prompt: string;
  url?: string;
  engine?: 'skyvern-1.0' | 'skyvern-2.0' | 'openai-cua' | 'anthropic-cua' | 'ui-tars';
  max_steps?: number;
  data_extraction_schema?: Record<string, any>;
  webhook_url?: string;
}

interface SkyvernTaskResponse {
  run_id: string;
  status: 'created' | 'queued' | 'running' | 'completed' | 'failed' | 'terminated';
  output?: Record<string, any> | string;
  downloaded_files?: Array<{
    url: string;
    filename: string;
    checksum: string;
  }>;
  screenshot_urls?: string[];
  recording_url?: string;
  failure_reason?: string;
  app_url?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      details: 'Only POST requests are allowed' 
    });
  }

  try {
    // Extract authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        details: 'Missing or invalid authorization token' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify user authentication with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ 
        error: 'Unauthorized', 
        details: 'Invalid authentication token' 
      });
    }

    // Check Skyvern API key
    const skyvernApiKey = process.env.SKYVERN_API_KEY;
    if (!skyvernApiKey) {
      console.error('SKYVERN_API_KEY environment variable not set');
      return res.status(500).json({ 
        error: 'Service not configured',
        details: 'AI Web Task service is not properly configured. Please contact support.'
      });
    }

    // Parse request body
    const { prompt, url, engine = 'skyvern-2.0', max_steps = 15 } = req.body as SkyvernTaskRequest;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: 'Prompt is required and must be a string' 
      });
    }

    // Check subscription tier and usage limits
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Subscription check error:', subError);
    }

    const tier = subscription?.tier || 'free';

    // Check usage tracking
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('period_start', new Date(new Date().setDate(1)).toISOString()) // Start of current month
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Usage tracking error:', usageError);
    }

    // Define limits per tier
    const limits = {
      free: 0, // AI Web Task not available on free tier
      pro: 10, // 10 AI Web Tasks per month for Pro
      ultra: 50 // 50 AI Web Tasks per month for Ultra
    };

    const currentUsage = usage?.web_searches || 0;
    const limit = limits[tier as keyof typeof limits] || 0;

    // Check if user has exceeded limit
    if (tier === 'free') {
      return res.status(403).json({ 
        error: 'Premium feature', 
        details: 'AI Web Task is only available for Pro and Ultra subscribers',
        upgrade_required: true,
        tier: 'free'
      });
    }

    if (currentUsage >= limit) {
      return res.status(429).json({ 
        error: 'Usage limit exceeded', 
        details: `You've used ${currentUsage}/${limit} AI Web Tasks this month. Upgrade for more!`,
        current: currentUsage,
        limit: limit,
        reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      });
    }

    console.log(`Starting Skyvern task for user ${user.id} (${tier}): "${prompt}"`);

    // Call Skyvern Cloud API
    const skyvernResponse = await fetch('https://api.skyvern.com/v1/run/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': skyvernApiKey,
      },
      body: JSON.stringify({
        prompt: prompt,
        url: url || undefined,
        engine: engine,
        max_steps: max_steps,
        title: `AI Web Task - ${user.email || user.id}`,
      }),
    });

    if (!skyvernResponse.ok) {
      const errorText = await skyvernResponse.text();
      console.error('Skyvern API error:', skyvernResponse.status, errorText);
      
      // Try to parse error as JSON
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorText;
      } catch {
        // Keep original error text
      }

      return res.status(500).json({ 
        error: 'AI Web Task failed',
        details: `Skyvern API returned ${skyvernResponse.status}: ${errorDetails.substring(0, 200)}`
      });
    }

    const taskData: SkyvernTaskResponse = await skyvernResponse.json();

    // Log API usage to api_logs table
    try {
      await supabase.from('api_logs').insert({
        user_id: user.id,
        endpoint: 'ai-web-task',
        request_data: { prompt, url, engine, max_steps },
        response_data: { run_id: taskData.run_id, status: taskData.status },
        status_code: 200,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
      // Don't fail the request if logging fails
    }

    // Increment usage counter
    if (usage) {
      // Update existing usage record
      await supabase
        .from('usage_tracking')
        .update({ 
          web_searches: currentUsage + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', usage.id);
    } else {
      // Create new usage record for this month
      await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          chats: 0,
          images: 0,
          videos: 0,
          web_searches: 1,
          period_start: new Date(new Date().setDate(1)).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
        });
    }

    // Poll for task completion if it's still running
    let finalTaskData = taskData;
    if (taskData.status === 'created' || taskData.status === 'queued' || taskData.status === 'running') {
      console.log(`Task ${taskData.run_id} is ${taskData.status}, polling for completion...`);
      
      // Poll up to 30 times with 2-second intervals (max 60 seconds)
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await fetch(`https://api.skyvern.com/v1/run/${taskData.run_id}`, {
          headers: {
            'x-api-key': skyvernApiKey,
          },
        });

        if (statusResponse.ok) {
          const statusData: SkyvernTaskResponse = await statusResponse.json();
          finalTaskData = statusData;
          
          if (statusData.status === 'completed' || statusData.status === 'failed' || statusData.status === 'terminated') {
            console.log(`Task ${taskData.run_id} finished with status: ${statusData.status}`);
            break;
          }
        }
      }
    }

    // Return task result with educational context
    return res.status(200).json({
      success: true,
      task_id: finalTaskData.run_id,
      status: finalTaskData.status,
      output: finalTaskData.output,
      screenshot_urls: finalTaskData.screenshot_urls,
      recording_url: finalTaskData.recording_url,
      app_url: finalTaskData.app_url,
      downloaded_files: finalTaskData.downloaded_files,
      failure_reason: finalTaskData.failure_reason,
      educational_tip: finalTaskData.status === 'completed' 
        ? '✨ This task was completed using AI-powered web browsing - Skyvern navigated the website like a human would!'
        : finalTaskData.status === 'running'
        ? '⏳ Your AI web task is still processing. Complex tasks may take up to 60 seconds to complete.'
        : undefined,
      usage: {
        current: currentUsage + 1,
        limit: limit,
        remaining: limit - currentUsage - 1,
      },
    });

  } catch (error) {
    console.error('AI Web Task error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error stack:', errorStack);
    
    return res.status(500).json({ 
      error: 'Failed to process AI Web Task',
      details: errorMessage
    });
  }
}
