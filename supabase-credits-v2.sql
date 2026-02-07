-- ============================================================
-- CREDITS SYSTEM V2 - With Daily Free Images for Free Users
-- New users start with 10 credits
-- Free users get 3 free image generations per day (separate counter)
-- ============================================================

-- 1. Add/Update credits columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS daily_free_images_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_free_images_reset_at DATE DEFAULT CURRENT_DATE;

-- 2. Update subscription_tier constraints
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
    WHEN 'free' THEN RETURN 10;     -- Free users start with 10 credits
    WHEN 'basic' THEN RETURN 500;   -- Basic tier
    WHEN 'pro' THEN RETURN 2000;    -- Pro tier
    WHEN 'ultra' THEN RETURN 5000;  -- Ultra tier
    ELSE RETURN 10;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Function to get daily free images limit based on tier
CREATE OR REPLACE FUNCTION public.get_tier_daily_free_images(tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE tier
    WHEN 'free' THEN RETURN 3;       -- 3 free images per day for free users
    WHEN 'basic' THEN RETURN 10;     -- 10 free images per day for basic
    WHEN 'pro' THEN RETURN 50;       -- 50 free images per day for pro
    WHEN 'ultra' THEN RETURN 9999;   -- Unlimited for ultra
    ELSE RETURN 3;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Function to get user's complete usage status
CREATE OR REPLACE FUNCTION public.get_user_credits_and_usage(p_user_id UUID)
RETURNS TABLE (
  credits INTEGER,
  credits_used INTEGER,
  credits_remaining INTEGER,
  credits_reset_at TIMESTAMP WITH TIME ZONE,
  subscription_tier TEXT,
  daily_free_images_limit INTEGER,
  daily_free_images_used INTEGER,
  daily_free_images_remaining INTEGER,
  daily_free_images_reset_at DATE,
  is_paid_user BOOLEAN
) AS $$
DECLARE
  v_tier TEXT;
  v_daily_limit INTEGER;
BEGIN
  -- Get user tier
  SELECT u.subscription_tier INTO v_tier
  FROM public.users u
  WHERE u.id = p_user_id;
  
  v_daily_limit := public.get_tier_daily_free_images(v_tier);

  -- Reset daily free images if it's a new day
  UPDATE public.users
  SET 
    daily_free_images_used = 0,
    daily_free_images_reset_at = CURRENT_DATE
  WHERE id = p_user_id
    AND daily_free_images_reset_at < CURRENT_DATE;

  RETURN QUERY
  SELECT 
    u.credits,
    u.credits_used,
    GREATEST(0, u.credits - u.credits_used)::INTEGER as credits_remaining,
    u.credits_reset_at,
    u.subscription_tier,
    v_daily_limit as daily_free_images_limit,
    u.daily_free_images_used,
    GREATEST(0, v_daily_limit - u.daily_free_images_used)::INTEGER as daily_free_images_remaining,
    u.daily_free_images_reset_at,
    (u.subscription_tier != 'free')::BOOLEAN as is_paid_user
  FROM public.users u
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to check if user can generate an image (uses daily free first, then credits)
CREATE OR REPLACE FUNCTION public.can_generate_image(p_user_id UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  source TEXT,  -- 'daily_free' or 'credits' or 'none'
  daily_free_remaining INTEGER,
  credits_remaining INTEGER,
  message TEXT
) AS $$
DECLARE
  v_tier TEXT;
  v_credits INTEGER;
  v_credits_used INTEGER;
  v_daily_limit INTEGER;
  v_daily_used INTEGER;
  v_daily_reset DATE;
BEGIN
  -- Get user data
  SELECT 
    u.subscription_tier, 
    u.credits, 
    u.credits_used,
    u.daily_free_images_used,
    u.daily_free_images_reset_at
  INTO v_tier, v_credits, v_credits_used, v_daily_used, v_daily_reset
  FROM public.users u
  WHERE u.id = p_user_id;
  
  -- Get daily limit
  v_daily_limit := public.get_tier_daily_free_images(v_tier);
  
  -- Reset daily counter if new day
  IF v_daily_reset < CURRENT_DATE THEN
    v_daily_used := 0;
    UPDATE public.users
    SET 
      daily_free_images_used = 0,
      daily_free_images_reset_at = CURRENT_DATE
    WHERE id = p_user_id;
  END IF;
  
  -- Check daily free images first
  IF v_daily_used < v_daily_limit THEN
    RETURN QUERY SELECT 
      TRUE,
      'daily_free'::TEXT,
      (v_daily_limit - v_daily_used)::INTEGER,
      GREATEST(0, v_credits - v_credits_used)::INTEGER,
      NULL::TEXT;
    RETURN;
  END IF;
  
  -- Check credits
  IF v_credits > v_credits_used THEN
    RETURN QUERY SELECT 
      TRUE,
      'credits'::TEXT,
      0::INTEGER,
      (v_credits - v_credits_used)::INTEGER,
      'Using credits (daily free images exhausted)'::TEXT;
    RETURN;
  END IF;
  
  -- No resources left
  RETURN QUERY SELECT 
    FALSE,
    'none'::TEXT,
    0::INTEGER,
    0::INTEGER,
    'No daily free images or credits remaining. Upgrade for more!'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to consume an image generation (uses daily free first, then credits)
CREATE OR REPLACE FUNCTION public.consume_image_generation(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  source TEXT,
  daily_free_remaining INTEGER,
  credits_remaining INTEGER,
  message TEXT
) AS $$
DECLARE
  v_check RECORD;
BEGIN
  -- First check if user can generate
  SELECT * INTO v_check FROM public.can_generate_image(p_user_id);
  
  IF NOT v_check.can_generate THEN
    RETURN QUERY SELECT v_check.*;
    RETURN;
  END IF;
  
  -- Consume based on source
  IF v_check.source = 'daily_free' THEN
    UPDATE public.users
    SET daily_free_images_used = daily_free_images_used + 1
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT 
      TRUE,
      'daily_free'::TEXT,
      (v_check.daily_free_remaining - 1)::INTEGER,
      v_check.credits_remaining,
      'Used 1 daily free image'::TEXT;
  ELSE
    -- Use credits
    UPDATE public.users
    SET credits_used = credits_used + 1
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT 
      TRUE,
      'credits'::TEXT,
      0::INTEGER,
      (v_check.credits_remaining - 1)::INTEGER,
      'Used 1 credit'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to deduct credits directly (for video gen, etc.)
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

-- 9. Function to reset credits (monthly or on subscription renewal)
CREATE OR REPLACE FUNCTION public.reset_user_credits(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_tier TEXT;
  v_new_credits INTEGER;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM public.users
  WHERE id = p_user_id;

  v_new_credits := public.get_tier_credits(v_tier);

  UPDATE public.users
  SET 
    credits = v_new_credits,
    credits_used = 0,
    credits_reset_at = NOW() + INTERVAL '30 days'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to upgrade user tier and refresh credits
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
    credits_reset_at = NOW() + INTERVAL '30 days',
    daily_free_images_used = 0,
    daily_free_images_reset_at = CURRENT_DATE
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Update handle_new_user to set correct initial credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    avatar_url, 
    subscription_tier, 
    subscription_status,
    credits,
    credits_used,
    credits_reset_at,
    daily_free_images_used,
    daily_free_images_reset_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    'active',
    10, -- New users start with 10 credits
    0,
    NOW() + INTERVAL '30 days',
    0,
    CURRENT_DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_tier_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tier_daily_free_images TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credits_and_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_generate_image TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_image_generation TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_credits TO service_role;
GRANT EXECUTE ON FUNCTION public.upgrade_user_tier TO service_role;

-- 13. Initialize existing users with new defaults if they don't have values
UPDATE public.users
SET 
  credits = CASE 
    WHEN subscription_tier = 'free' THEN 10
    ELSE public.get_tier_credits(COALESCE(subscription_tier, 'free'))
  END,
  credits_used = COALESCE(credits_used, 0),
  credits_reset_at = COALESCE(credits_reset_at, NOW() + INTERVAL '30 days'),
  daily_free_images_used = COALESCE(daily_free_images_used, 0),
  daily_free_images_reset_at = COALESCE(daily_free_images_reset_at, CURRENT_DATE)
WHERE credits IS NULL 
   OR daily_free_images_used IS NULL;

-- ============================================================
-- DONE! Credits System V2 is now ready.
-- 
-- Credit Allocations:
--   Free:  10 credits + 3 daily free images
--   Basic: 500 credits + 10 daily free images
--   Pro:   2,000 credits + 50 daily free images
--   Ultra: 5,000 credits + unlimited daily images
-- ============================================================
