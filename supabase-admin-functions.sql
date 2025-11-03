-- Function to get comprehensive user stats for admin dashboard
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

-- Grant execute permission to authenticated users (function will verify admin status)
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;

-- Create admin check function for RLS policies
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Update api_logs policy to allow admin to view all logs
DROP POLICY IF EXISTS "Users can view own api logs" ON api_logs;
DROP POLICY IF EXISTS "Admin can view all api logs" ON api_logs;

CREATE POLICY "Users can view own api logs"
  ON api_logs FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

-- Update usage_tracking policy to allow admin to view all usage
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Admin can view all usage" ON usage_tracking;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

-- Update users table policy to allow admin to modify subscriptions
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;

CREATE POLICY "Admin can update all users"
  ON public.users FOR ALL
  USING (is_admin_user());

-- Add comment for documentation
COMMENT ON FUNCTION get_admin_user_stats() IS 'Returns comprehensive user statistics for admin dashboard. Only accessible by andregreengp@gmail.com';
COMMENT ON FUNCTION is_admin_user() IS 'Returns true if the current user is the admin (andregreengp@gmail.com)';
