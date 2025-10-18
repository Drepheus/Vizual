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

  } catch (error) {
    console.error('Increment usage error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
