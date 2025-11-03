-- ========================================
-- Admin Dashboard Setup for Existing Schema
-- ========================================
-- This script works with your existing users and usage_tracking tables
-- Run this in Supabase SQL Editor

-- Step 1: Create admin check function
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'andregreengp@gmail.com'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Step 2: Create function to get all user stats (admin only)
CREATE OR REPLACE FUNCTION get_admin_user_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  tier TEXT,
  total_chats INTEGER,
  total_images INTEGER,
  total_videos INTEGER,
  total_web_searches INTEGER,
  last_active TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the calling user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'andregreengp@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access only';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    au.created_at,
    COALESCE(u.subscription_tier, 'free')::TEXT as tier,
    COALESCE(
      (SELECT SUM(count) FROM usage_tracking 
       WHERE user_id = au.id AND usage_type = 'chat'), 0
    )::INTEGER as total_chats,
    COALESCE(
      (SELECT SUM(count) FROM usage_tracking 
       WHERE user_id = au.id AND usage_type = 'image_gen'), 0
    )::INTEGER as total_images,
    COALESCE(
      (SELECT SUM(count) FROM usage_tracking 
       WHERE user_id = au.id AND usage_type = 'video_gen'), 0
    )::INTEGER as total_videos,
    COALESCE(
      (SELECT web_searches FROM usage_tracking 
       WHERE user_id = au.id 
       ORDER BY created_at DESC LIMIT 1), 0
    )::INTEGER as total_web_searches,
    COALESCE(
      (SELECT MAX(created_at) FROM usage_tracking WHERE user_id = au.id),
      au.created_at
    ) as last_active,
    u.stripe_customer_id::TEXT
  FROM auth.users au
  LEFT JOIN public.users u ON au.id = u.id
  ORDER BY au.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;

-- Step 3: Update RLS policies to allow admin access

-- Allow admin to view all usage_tracking records
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

-- Allow admin to modify all usage_tracking records
DROP POLICY IF EXISTS "Admin can manage all usage" ON usage_tracking;
CREATE POLICY "Admin can manage all usage"
  ON usage_tracking FOR ALL
  USING (is_admin_user());

-- Allow admin to view and modify all user records
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR is_admin_user());

DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
CREATE POLICY "Admin can update all users"
  ON public.users FOR UPDATE
  USING (is_admin_user());

-- Allow admin to view all api_logs
DROP POLICY IF EXISTS "Users can view own api logs" ON api_logs;
CREATE POLICY "Users can view own api logs"
  ON api_logs FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

-- Step 4: Set your account to Ultra tier (highest plan)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find admin user
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'andregreengp@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- First, add 'ultra' to the CHECK constraint if it doesn't exist
    BEGIN
      ALTER TABLE public.users 
      DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
      
      ALTER TABLE public.users 
      ADD CONSTRAINT users_subscription_tier_check 
      CHECK (subscription_tier IN ('free', 'pro', 'ultra'));
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Constraint already exists or error: %', SQLERRM;
    END;
    
    -- Update to ultra tier
    UPDATE public.users
    SET 
      subscription_tier = 'ultra',
      subscription_status = 'active'
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Admin account set to ULTRA tier successfully';
  ELSE
    RAISE NOTICE 'Admin account not found - make sure you are logged in';
  END IF;
END $$;

-- ========================================
-- Verification Queries (optional - run these to test)
-- ========================================

-- Check if admin function works
-- SELECT is_admin_user();

-- Get user stats (will only work if you're admin)
-- SELECT * FROM get_admin_user_stats();

-- View your account details
-- SELECT id, email, subscription_tier, subscription_status 
-- FROM public.users 
-- WHERE email = 'andregreengp@gmail.com';
