import { getBrowserSupabaseClient } from './supabase-browser';

// Use the browser client that maintains user session
// This ensures RPC calls are made as the authenticated user
const getSupabaseClient = () => getBrowserSupabaseClient();

// Types for credit and usage tracking
export interface UserCreditsAndUsage {
  credits: number;
  credits_used: number;
  credits_remaining: number;
  credits_reset_at: string;
  subscription_tier: string;
  daily_free_images_limit: number;
  daily_free_images_used: number;
  daily_free_images_remaining: number;
  daily_free_images_reset_at: string;
  is_paid_user: boolean;
}

export interface ImageGenerationCheck {
  can_generate: boolean;
  source: 'daily_free' | 'credits' | 'none';
  daily_free_remaining: number;
  credits_remaining: number;
  message: string | null;
}

// Result from consume_image_generation RPC (different from check)
export interface ConsumeImageResult {
  success: boolean;
  source: 'daily_free' | 'credits' | 'none';
  daily_free_remaining: number;
  credits_remaining: number;
  message: string | null;
}

export interface CreditDeductionResult {
  success: boolean;
  new_balance: number;
  error_message: string | null;
}

/**
 * Get user's complete credits and usage status
 * Shows credits remaining, daily free images remaining, and subscription info
 */
export async function getUserCreditsAndUsage(userId: string): Promise<UserCreditsAndUsage | null> {
  if (!userId) return null;
  
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_user_credits_and_usage', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error getting user credits:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (e) {
    console.error('Exception getting user credits:', e);
    return null;
  }
}

/**
 * Check if user can generate an image
 * Returns info about whether they have daily free images or credits available
 */
export async function canGenerateImage(userId: string): Promise<ImageGenerationCheck | null> {
  if (!userId) return null;
  
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('can_generate_image', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error checking image generation:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (e) {
    console.error('Exception checking image generation:', e);
    return null;
  }
}

/**
 * Consume an image generation
 * Uses daily free images first, then credits
 * Returns result with updated balances
 */
export async function consumeImageGeneration(userId: string): Promise<ConsumeImageResult | null> {
  if (!userId) return null;
  
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('consume_image_generation', {
      p_user_id: userId
    });
    
    console.log('consume_image_generation response:', { data, error });
    
    if (error) {
      console.error('Error consuming image generation:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (e) {
    console.error('Exception consuming image generation:', e);
    return null;
  }
}

/**
 * Deduct credits directly (for video generation, etc.)
 * @param amount - Number of credits to deduct
 */
export async function deductCredits(userId: string, amount: number): Promise<CreditDeductionResult | null> {
  if (!userId) return null;
  
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: amount
    });
    
    if (error) {
      console.error('Error deducting credits:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (e) {
    console.error('Exception deducting credits:', e);
    return null;
  }
}

/**
 * Legacy function - now routes to consume_image_generation for images
 */
export async function trackUsage(userId: string, usageType: 'chat' | 'image_gen' | 'video_gen') {
  if (!userId) return;
  
  try {
    // For image generation, use the new credit system
    if (usageType === 'image_gen') {
      await consumeImageGeneration(userId);
      return;
    }
    
    // For video generation, deduct credits (e.g., 5 credits per video)
    if (usageType === 'video_gen') {
      await deductCredits(userId, 5);
      return;
    }
    
    // For chat, use the original usage tracking
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_usage_type: usageType
    });
    
    if (error) {
      console.error('Error tracking usage:', error);
    }
  } catch (e) {
    console.error('Exception tracking usage:', e);
  }
}

export async function logApiCall(data: {
  user_id?: string;
  email?: string;
  endpoint: string;
  request_data?: any;
  response_data?: any;
  status_code: number;
  duration_ms: number;
}) {
  try {
    // We use a separate client or just the same one. 
    // Ensure 'api_logs' table has RLS policy allowing insert.
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('api_logs').insert({
      ...data,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error logging API call:', error);
    }
  } catch (e) {
    console.error('Exception logging API call:', e);
  }
}
