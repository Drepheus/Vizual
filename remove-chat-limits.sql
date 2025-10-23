-- ========================================
-- REMOVE CHAT USAGE LIMITS
-- ========================================
-- Only track image_gen and video_gen, chat is now unlimited

-- Update the usage_type constraint to only allow image_gen and video_gen
ALTER TABLE public.usage_tracking
DROP CONSTRAINT IF EXISTS usage_tracking_usage_type_check;

ALTER TABLE public.usage_tracking
ADD CONSTRAINT usage_tracking_usage_type_check
CHECK (usage_type IN ('image_gen', 'video_gen'));

-- Clean up any existing chat usage records
DELETE FROM public.usage_tracking WHERE usage_type = 'chat';

-- Update the can_user_perform_action function to only handle image/video
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

  -- Chat has no limits anymore - always allow
  IF p_usage_type = 'chat' THEN
    RETURN QUERY SELECT TRUE, 0, 999999, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  -- Set limits for free tier based on usage type
  IF p_usage_type = 'image_gen' THEN
    v_limit := 10;
  ELSIF p_usage_type = 'video_gen' THEN
    v_limit := 2;
  ELSE
    -- Unknown usage type, deny
    RETURN QUERY SELECT FALSE, 0, 0, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  -- Get current lifetime usage (no reset for image/video)
  SELECT COALESCE(SUM(count), 0) INTO v_current_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND usage_type = p_usage_type;

  -- Return result (no reset for image/video)
  RETURN QUERY SELECT 
    (v_current_count < v_limit),
    v_current_count,
    v_limit,
    NULL::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the increment_usage function to only handle image/video
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_limit INTEGER;
  v_subscription_tier TEXT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM public.users
  WHERE id = p_user_id;

  -- Pro users have unlimited usage, don't track
  IF v_subscription_tier = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- Chat has no limits anymore - don't track
  IF p_usage_type = 'chat' THEN
    RETURN TRUE;
  END IF;

  -- Set limits based on type
  IF p_usage_type = 'image_gen' THEN
    v_limit := 10;
  ELSIF p_usage_type = 'video_gen' THEN
    v_limit := 2;
  ELSE
    RETURN FALSE; -- Unknown usage type
  END IF;

  -- Get current lifetime usage
  SELECT COALESCE(SUM(count), 0) INTO v_current_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND usage_type = p_usage_type;

  -- Check if limit exceeded
  IF v_current_count >= v_limit THEN
    RETURN FALSE;
  END IF;

  -- Insert new usage record (no expiry for image/video)
  INSERT INTO public.usage_tracking (user_id, usage_type, count, reset_at)
  VALUES (p_user_id, p_usage_type, 1, NOW() + INTERVAL '100 years');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMPLETE
-- ========================================
-- Chat is now unlimited for all users!
-- Only image_gen and video_gen have limits
