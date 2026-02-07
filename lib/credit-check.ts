import { getServerSupabaseClient } from './supabase-server';

/**
 * Server-side credit cost configuration per model.
 * MUST match the client-side MODEL_CREDIT_COSTS in studio/page.tsx
 */
const MODEL_CREDIT_COSTS: Record<string, number | { perSecond: number }> = {
  // Image models
  'flux-schnell': 1,
  'flux-1.1-pro-ultra': 5,
  'p-image': 0.5,
  'imagen-4-fast': 2,
  'imagen-3-fast': 2.5,
  'imagen-4-ultra': 6,
  'ideogram-v3-turbo': 3,
  'seedream-4': 3,
  'seedream-4.5': 4,
  'nano-banana-pro': 15,
  // Video models (per second costs)
  'seedance-1-pro-fast': { perSecond: 1.5 },
  'seedance-1-lite': { perSecond: 1.8 },
  'seedance-1-pro': { perSecond: 3 },
  'wan-2.5-i2v': { perSecond: 5 },
  'wan-2.5-t2v': { perSecond: 5 },
  'wan-2.5-t2v-fast': { perSecond: 6.8 },
  'wan-2.1-t2v-720p': { perSecond: 24 },
  'wan-2.1-i2v-720p': { perSecond: 25 },
  'pixverse-v4.5': { perSecond: 6 },
  'kling-v2.5-turbo-pro': { perSecond: 7 },
  'hailuo-2.3-fast': 19,
  'hailuo-2.3': 28,
  'sora-2': { perSecond: 10 },
  'sora-2-own-key': 0,
  'veo-3-fast': { perSecond: 10 },
  'veo-3.1-fast': { perSecond: 10 },
  'veo-3': { perSecond: 20 },
  'veo-3.1': { perSecond: 20 },
  'veo-2': { perSecond: 50 },
};

/**
 * Calculate the credit cost for a generation.
 */
export function calculateCreditCost(modelId: string, durationSeconds?: number): number {
  const costConfig = MODEL_CREDIT_COSTS[modelId];
  if (!costConfig) return 1; // Default cost

  if (typeof costConfig === 'number') {
    return costConfig;
  } else {
    // Per-second cost for videos
    const duration = durationSeconds && durationSeconds > 0 ? durationSeconds : 5;
    return Math.ceil(costConfig.perSecond * duration);
  }
}

export interface CreditCheckResult {
  allowed: boolean;
  creditCost: number;
  creditsRemaining: number;
  message: string;
}

/**
 * Server-side credit check. Verifies the user has enough credits BEFORE generation.
 * For images: checks daily free images first, then credits.
 * For videos: checks credits directly (no daily free videos).
 * 
 * Returns { allowed, creditCost, creditsRemaining, message }
 */
export async function checkUserCredits(
  userId: string,
  type: 'image' | 'video',
  modelId: string,
  durationSeconds?: number
): Promise<CreditCheckResult> {
  const creditCost = calculateCreditCost(modelId, durationSeconds);

  // Models with 0 cost (e.g. own-key models) are always allowed
  if (creditCost <= 0) {
    return { allowed: true, creditCost: 0, creditsRemaining: 0, message: 'Free model' };
  }

  const supabase = getServerSupabaseClient();

  // For images, use the can_generate_image RPC which checks daily free images first
  if (type === 'image' && creditCost <= 1) {
    try {
      const { data, error } = await supabase.rpc('can_generate_image', {
        p_user_id: userId
      });

      if (error) {
        console.error('can_generate_image RPC error:', error);
        // Fall through to direct credit check below
      } else {
        const result = Array.isArray(data) ? data[0] : data;
        if (result) {
          if (result.can_generate) {
            return {
              allowed: true,
              creditCost: result.source === 'daily_free' ? 0 : creditCost,
              creditsRemaining: result.credits_remaining,
              message: result.source === 'daily_free' ? 'Using daily free image' : 'Using credits',
            };
          } else {
            return {
              allowed: false,
              creditCost,
              creditsRemaining: result.credits_remaining || 0,
              message: result.message || 'No credits remaining. Upgrade your plan for more!',
            };
          }
        }
      }
    } catch (e) {
      console.error('Error checking image generation:', e);
    }
  }

  // For videos, premium image models, or fallback: check credits directly
  try {
    const { data, error } = await supabase
      .from('users')
      .select('credits, credits_used, subscription_tier')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user credits:', error);
      return {
        allowed: false,
        creditCost,
        creditsRemaining: 0,
        message: 'Unable to verify credits. Please try again.',
      };
    }

    const remaining = (data.credits || 0) - (data.credits_used || 0);

    if (remaining < creditCost) {
      return {
        allowed: false,
        creditCost,
        creditsRemaining: Math.max(0, remaining),
        message: `Insufficient credits. This costs ${creditCost} credits but you only have ${Math.max(0, remaining)}. Upgrade your plan for more!`,
      };
    }

    return {
      allowed: true,
      creditCost,
      creditsRemaining: remaining,
      message: 'Credits available',
    };
  } catch (e) {
    console.error('Error checking credits:', e);
    return {
      allowed: false,
      creditCost,
      creditsRemaining: 0,
      message: 'Unable to verify credits. Please try again.',
    };
  }
}

/**
 * Server-side credit deduction. Call this BEFORE starting generation.
 * Returns true if deduction succeeded, false if insufficient credits.
 */
export async function deductCreditsServer(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amount <= 0) {
    return { success: true, newBalance: 0 };
  }

  const supabase = getServerSupabaseClient();

  try {
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: Math.ceil(amount),
    });

    if (error) {
      console.error('deduct_credits RPC error:', error);
      return { success: false, newBalance: 0, error: 'Failed to deduct credits' };
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result || !result.success) {
      return {
        success: false,
        newBalance: result?.new_balance || 0,
        error: result?.error_message || 'Insufficient credits',
      };
    }

    return { success: true, newBalance: result.new_balance };
  } catch (e: any) {
    console.error('Error deducting credits:', e);
    return { success: false, newBalance: 0, error: e.message || 'Credit deduction failed' };
  }
}
