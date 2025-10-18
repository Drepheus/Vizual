-- Enhanced Schema for Subscription Management and Rate Limiting
-- Run this AFTER the main supabase-schema.sql

-- Add subscription fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('chat', 'image_gen', 'video_gen')),
  count INTEGER DEFAULT 1,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_reset_at ON public.usage_tracking(reset_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_type ON public.usage_tracking(usage_type);

-- Enable RLS for usage tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage records"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage records"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get current usage for a user
CREATE OR REPLACE FUNCTION public.get_user_usage(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS TABLE (
  current_count INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(count), 0)::INTEGER as current_count,
    MAX(usage_tracking.reset_at) as reset_at
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND usage_type = p_usage_type
    AND usage_tracking.reset_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
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
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM public.users
  WHERE id = p_user_id;

  -- Set limits based on tier and type
  IF v_subscription_tier = 'pro' THEN
    RETURN TRUE; -- Pro users have unlimited usage
  END IF;

  -- Free tier limits
  IF p_usage_type = 'chat' THEN
    v_limit := 15;
    v_reset_hours := 4;
  ELSIF p_usage_type = 'image_gen' THEN
    v_limit := 10;
    v_reset_hours := NULL; -- No reset, lifetime limit
  ELSIF p_usage_type = 'video_gen' THEN
    v_limit := 2;
    v_reset_hours := NULL; -- No reset, lifetime limit
  END IF;

  -- Get current usage
  IF v_reset_hours IS NOT NULL THEN
    -- For chat: check within reset window
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

  -- Increment usage
  INSERT INTO public.usage_tracking (user_id, usage_type, count, reset_at)
  VALUES (p_user_id, p_usage_type, 1, v_reset_at);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform action
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

  -- Set limits for free tier
  IF p_usage_type = 'chat' THEN
    v_limit := 15;
    v_reset_hours := 4;
  ELSIF p_usage_type = 'image_gen' THEN
    v_limit := 10;
    v_reset_hours := NULL;
  ELSIF p_usage_type = 'video_gen' THEN
    v_limit := 2;
    v_reset_hours := NULL;
  END IF;

  -- Get current usage
  IF v_reset_hours IS NOT NULL THEN
    SELECT COALESCE(SUM(count), 0), MAX(usage_tracking.reset_at)
    INTO v_current_count, v_reset_at
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND usage_type = p_usage_type
      AND usage_tracking.reset_at > NOW();
  ELSE
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

-- Update the handle_new_user function to set default subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, subscription_tier, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
