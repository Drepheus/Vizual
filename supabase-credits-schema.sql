-- ============================================================
-- CREDITS SYSTEM SCHEMA
-- Add credit balance tracking to users table
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add credits columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- 2. Update subscription_tier to include new tiers
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'pro', 'ultra'));

-- 3. Function to get credits based on subscription tier
CREATE OR REPLACE FUNCTION public.get_tier_credits(tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE tier
    WHEN 'free' THEN RETURN 50;
    WHEN 'basic' THEN RETURN 1000;
    WHEN 'pro' THEN RETURN 2000;
    WHEN 'ultra' THEN RETURN 5000;
    ELSE RETURN 50;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Function to get user's current credit balance
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS TABLE (
  credits INTEGER,
  credits_used INTEGER,
  credits_remaining INTEGER,
  credits_reset_at TIMESTAMP WITH TIME ZONE,
  subscription_tier TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.credits,
    u.credits_used,
    (u.credits - u.credits_used)::INTEGER as credits_remaining,
    u.credits_reset_at,
    u.subscription_tier
  FROM public.users u
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_current_credits INTEGER;
  v_credits_used INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Get current balance
  SELECT credits, credits_used INTO v_current_credits, v_credits_used
  FROM public.users
  WHERE id = p_user_id;

  v_remaining := v_current_credits - v_credits_used;

  -- Check if user has enough credits
  IF v_remaining < p_amount THEN
    RETURN QUERY SELECT FALSE, v_remaining, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  -- Deduct credits
  UPDATE public.users
  SET credits_used = credits_used + p_amount
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, (v_remaining - p_amount)::INTEGER, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to reset credits (call monthly or on subscription renewal)
CREATE OR REPLACE FUNCTION public.reset_user_credits(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_tier TEXT;
  v_new_credits INTEGER;
BEGIN
  -- Get user's tier
  SELECT subscription_tier INTO v_tier
  FROM public.users
  WHERE id = p_user_id;

  -- Get credits for tier
  v_new_credits := public.get_tier_credits(v_tier);

  -- Reset credits
  UPDATE public.users
  SET 
    credits = v_new_credits,
    credits_used = 0,
    credits_reset_at = NOW() + INTERVAL '30 days'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to upgrade user tier and refresh credits
CREATE OR REPLACE FUNCTION public.upgrade_user_tier(
  p_user_id UUID,
  p_new_tier TEXT
)
RETURNS VOID AS $$
DECLARE
  v_new_credits INTEGER;
BEGIN
  v_new_credits := public.get_tier_credits(p_new_tier);

  UPDATE public.users
  SET 
    subscription_tier = p_new_tier,
    subscription_status = 'active',
    credits = v_new_credits,
    credits_used = 0,
    credits_reset_at = NOW() + INTERVAL '30 days'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_tier_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_credits TO service_role;
GRANT EXECUTE ON FUNCTION public.upgrade_user_tier TO service_role;

-- 9. Initialize credits for existing users based on their tier
UPDATE public.users
SET 
  credits = public.get_tier_credits(COALESCE(subscription_tier, 'free')),
  credits_used = 0,
  credits_reset_at = NOW() + INTERVAL '30 days'
WHERE credits IS NULL OR credits = 0;

-- ============================================================
-- DONE! Credits system is now ready.
-- 
-- Credit Allocations:
--   Free:  50 credits / month
--   Basic: 1,000 credits / month  
--   Pro:   2,000 credits / month
--   Ultra: 5,000 credits / month
-- ============================================================
