-- Quick fix to set andregreengp@gmail.com to ULTRA tier
-- Run this in Supabase SQL Editor

-- First, ensure 'ultra' is allowed in the constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'ultra'));

-- Update admin account to ultra tier
UPDATE public.users
SET 
  subscription_tier = 'ultra',
  subscription_status = 'active'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'andregreengp@gmail.com'
);

-- Verify the update
SELECT id, email, subscription_tier, subscription_status 
FROM public.users 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'andregreengp@gmail.com'
);
