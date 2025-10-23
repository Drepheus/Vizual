import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, usageType } = req.body;

    if (!userId || !usageType) {
      return res.status(400).json({ error: 'Missing userId or usageType' });
    }

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

  } catch (error) {
    console.error('Check usage error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
