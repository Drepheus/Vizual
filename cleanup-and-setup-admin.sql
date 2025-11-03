-- ========================================
-- ADMIN DASHBOARD CLEANUP & FRESH SETUP
-- ========================================
-- This script removes all duplicate/conflicting admin setup
-- Then does a clean install
-- Run this ONCE in Supabase SQL Editor

-- ========================================
-- STEP 1: CLEANUP - Remove all existing admin setup
-- ========================================

-- Drop all existing admin functions (including duplicates)
DROP FUNCTION IF EXISTS is_admin_user() CASCADE;
DROP FUNCTION IF EXISTS get_admin_user_stats() CASCADE;

-- Drop all admin-related policies on usage_tracking
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Admin can view all usage" ON usage_tracking;
DROP POLICY IF EXISTS "Admin can manage all usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can create their own usage records" ON usage_tracking;
DROP POLICY IF EXISTS "Users can update their own usage records" ON usage_tracking;

-- Drop all admin-related policies on users table
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- Drop all admin-related policies on api_logs
DROP POLICY IF EXISTS "Users can view own api logs" ON api_logs;
DROP POLICY IF EXISTS "Admin can view all api logs" ON api_logs;

-- ========================================
-- STEP 2: FIX SUBSCRIPTION TIER CONSTRAINT
-- ========================================

-- Remove old constraint and create new one with 'ultra' support
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'ultra'));

-- ========================================
-- STEP 3: FRESH INSTALL - Admin Functions
-- ========================================

-- Create admin check function
CREATE FUNCTION is_admin_user()
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

-- Create admin stats function
CREATE FUNCTION get_admin_user_stats()
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
  IF NOT is_admin_user() THEN
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

-- ========================================
-- STEP 4: FRESH INSTALL - RLS Policies
-- ========================================

-- Policies for usage_tracking
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all usage"
  ON usage_tracking FOR ALL
  USING (is_admin_user());

-- Policies for public.users
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR is_admin_user());

CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can update all users"
  ON public.users FOR UPDATE
  USING (is_admin_user());

-- Policies for api_logs
CREATE POLICY "Users can view own api logs"
  ON api_logs FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

-- ========================================
-- STEP 5: SET ADMIN ACCOUNT TO ULTRA TIER
-- ========================================

UPDATE public.users
SET 
  subscription_tier = 'ultra',
  subscription_status = 'active'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'andregreengp@gmail.com'
);

-- ========================================
-- STEP 6: VERIFICATION
-- ========================================

-- Show admin account details
SELECT 
  'Admin Account Details' as check_type,
  id, 
  email, 
  subscription_tier, 
  subscription_status 
FROM public.users 
WHERE id = (SELECT id FROM auth.users WHERE email = 'andregreengp@gmail.com');

-- Test admin function
SELECT 'Admin Function Test' as check_type, is_admin_user() as result;

-- Show all policies on tables
SELECT 
  'RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('users', 'usage_tracking', 'api_logs')
ORDER BY tablename, policyname;

-- ========================================
-- DONE! Your admin dashboard should now work correctly.
-- ========================================
