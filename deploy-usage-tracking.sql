-- ========================================
-- USAGE TRACKING FIX - Deploy to Supabase
-- ========================================
-- Run this entire script in Supabase SQL Editor
-- This will create/update all necessary functions and tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. ENSURE USERS TABLE HAS SUBSCRIPTION FIELDS
-- ========================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Update existing users to have 'free' tier if NULL
UPDATE public.users 
SET subscription_tier = 'free', subscription_status = 'active'
WHERE subscription_tier IS NULL;

-- ========================================
-- 2. CREATE USAGE_TRACKING TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('chat', 'image_gen', 'video_gen')),
  count INTEGER DEFAULT 1,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_reset_at ON public.usage_tracking(reset_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_type ON public.usage_tracking(usage_type);

-- ========================================
-- 3. ENABLE RLS FOR USAGE_TRACKING
-- ========================================
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can create their own usage records" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update their own usage records" ON public.usage_tracking;

-- Create RLS Policies
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage records"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage records"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- 4. CREATE FUNCTION: can_user_perform_action
-- ========================================
-- This function checks if a user can perform an action based on their usage limits
DROP FUNCTION IF EXISTS public.can_user_perform_action(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.can_user_perform_action(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS TABLE (
  can_perform BOOLEAN,
  current_usage INTEGER,
  usage_limit INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_subscription_tier TEXT;
  v_current_count INTEGER;
  v_limit INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_reset_hours INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM public.users
  WHERE id = p_user_id;

  -- Pro users have unlimited usage
  IF v_subscription_tier = 'pro' THEN
    RETURN QUERY SELECT TRUE, 0, 999999, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  -- Set limits for free tier based on usage type
  IF p_usage_type = 'chat' THEN
    v_limit := 15;
    v_reset_hours := 4;
  ELSIF p_usage_type = 'image_gen' THEN
    v_limit := 10;
    v_reset_hours := NULL; -- No reset for images (lifetime limit)
  ELSIF p_usage_type = 'video_gen' THEN
    v_limit := 2;
    v_reset_hours := NULL; -- No reset for videos (lifetime limit)
  ELSE
    -- Unknown usage type, deny
    RETURN QUERY SELECT FALSE, 0, 0, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  -- Get current usage
  IF v_reset_hours IS NOT NULL THEN
    -- For chat: check within reset window (4 hours)
    -- First clean up expired records
    DELETE FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type
      AND reset_at < NOW();
    
    -- Get current count and reset time
    SELECT 
      COALESCE(SUM(count), 0),
      MAX(usage_tracking.reset_at)
    INTO v_current_count, v_reset_at
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type
      AND usage_tracking.reset_at > NOW();
      
    -- If no active tracking, set next reset time
    IF v_reset_at IS NULL THEN
      v_reset_at := NOW() + (v_reset_hours || ' hours')::INTERVAL;
    END IF;
  ELSE
    -- For image/video: check lifetime usage (no reset)
    SELECT COALESCE(SUM(count), 0), NULL
    INTO v_current_count, v_reset_at
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type;
  END IF;

  -- Return result
  RETURN QUERY SELECT 
    (v_current_count < v_limit),
    v_current_count,
    v_limit,
    v_reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. CREATE FUNCTION: increment_usage
-- ========================================
-- This function increments usage count for a user
DROP FUNCTION IF EXISTS public.increment_usage(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_limit INTEGER;
  v_reset_hours INTEGER;
  v_subscription_tier TEXT;
  v_existing_record RECORD;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM public.users
  WHERE id = p_user_id;

  -- Pro users have unlimited usage, don't track
  IF v_subscription_tier = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- Set limits based on tier and type
  IF p_usage_type = 'chat' THEN
    v_limit := 15;
    v_reset_hours := 4;
  ELSIF p_usage_type = 'image_gen' THEN
    v_limit := 10;
    v_reset_hours := NULL; -- No reset, lifetime limit
  ELSIF p_usage_type = 'video_gen' THEN
    v_limit := 2;
    v_reset_hours := NULL; -- No reset, lifetime limit
  ELSE
    RETURN FALSE; -- Unknown usage type
  END IF;

  -- Get current usage
  IF v_reset_hours IS NOT NULL THEN
    -- For chat: clean up expired records first
    DELETE FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type
      AND reset_at < NOW();
    
    -- Check within reset window
    SELECT COALESCE(SUM(count), 0) INTO v_current_count
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type
      AND reset_at > NOW();
      
    -- Calculate reset time
    v_reset_at := NOW() + (v_reset_hours || ' hours')::INTERVAL;
  ELSE
    -- For image/video: check lifetime usage
    SELECT COALESCE(SUM(count), 0) INTO v_current_count
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type;
      
    v_reset_at := NOW() + INTERVAL '100 years'; -- Effectively never resets
  END IF;

  -- Check if limit exceeded
  IF v_current_count >= v_limit THEN
    RETURN FALSE;
  END IF;

  -- Try to find existing active record to update
  IF v_reset_hours IS NOT NULL THEN
    SELECT * INTO v_existing_record
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type
      AND reset_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF FOUND THEN
      -- Update existing record
      UPDATE public.usage_tracking
      SET count = count + 1
      WHERE id = v_existing_record.id;
      RETURN TRUE;
    END IF;
  END IF;

  -- Insert new usage record
  INSERT INTO public.usage_tracking (user_id, usage_type, count, reset_at)
  VALUES (p_user_id, p_usage_type, 1, v_reset_at);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. GRANT PERMISSIONS
-- ========================================
GRANT EXECUTE ON FUNCTION public.can_user_perform_action(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(UUID, TEXT) TO authenticated;

-- ========================================
-- 7. TEST THE FUNCTIONS (Optional - uncomment to test)
-- ========================================
-- Replace 'YOUR_USER_ID' with an actual user ID from your users table
/*
SELECT * FROM public.can_user_perform_action(
  'YOUR_USER_ID'::UUID,
  'chat'
);

SELECT public.increment_usage(
  'YOUR_USER_ID'::UUID,
  'chat'
);
*/

-- ========================================
-- DEPLOYMENT COMPLETE
-- ========================================
-- After running this, your usage tracking should work!
-- The API endpoints will now be able to call these functions.
