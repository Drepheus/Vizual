import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, usageType } = req.body;

    if (!userId || !usageType) {
      return res.status(400).json({ error: 'Missing userId or usageType' });
    }

    // Route to appropriate handler based on action
    switch (action) {
      case 'check':
        return handleCheckUsage(req, res, userId, usageType);
      case 'increment':
        return handleIncrementUsage(req, res, userId, usageType);
      default:
        return res.status(400).json({ 
          error: 'Invalid action. Use ?action=check or ?action=increment' 
        });
    }
  } catch (error) {
    console.error('Usage API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Check usage limits
async function handleCheckUsage(
  req: VercelRequest, 
  res: VercelResponse, 
  userId: string, 
  usageType: string
) {
  // Get user's subscription info
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }

  // Pro users have unlimited usage
  if (user?.subscription_tier === 'pro') {
    return res.status(200).json({
      canPerform: true,
      isPro: true,
      currentUsage: 0,
      usageLimit: 999999,
      resetAt: null
    });
  }

  // Check usage limits for free tier
  const { data, error } = await supabase
    .rpc('can_user_perform_action', {
      p_user_id: userId,
      p_usage_type: usageType
    });

  if (error) {
    console.error('Error checking usage:', error);
    return res.status(500).json({ error: 'Failed to check usage limits' });
  }

  if (!data || data.length === 0) {
    console.error('No data returned from can_user_perform_action');
    return res.status(500).json({ error: 'No usage data found' });
  }

  const result = data[0];

  return res.status(200).json({
    canPerform: result.can_perform,
    isPro: false,
    currentUsage: result.current_usage,
    usageLimit: result.usage_limit,
    resetAt: result.reset_at
  });
}

// Increment usage
async function handleIncrementUsage(
  req: VercelRequest, 
  res: VercelResponse, 
  userId: string, 
  usageType: string
) {
  // Increment usage
  const { data, error } = await supabase
    .rpc('increment_usage', {
      p_user_id: userId,
      p_usage_type: usageType
    });

  if (error) {
    console.error('Error incrementing usage:', error);
    return res.status(500).json({ error: 'Failed to increment usage' });
  }

  // data will be true if successful, false if limit exceeded
  if (!data) {
    return res.status(403).json({ 
      success: false, 
      error: 'Usage limit exceeded',
      limitReached: true
    });
  }

  return res.status(200).json({ success: true });
}
