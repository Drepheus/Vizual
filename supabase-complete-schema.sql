-- =====================================================
-- VIZUAL COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE (extends auth.users with additional data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    credits_used INTEGER DEFAULT 0,
    credits_limit INTEGER DEFAULT 50,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. GENERATED MEDIA TABLE (stores completed images and videos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generated_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    model TEXT,
    aspect_ratio TEXT DEFAULT '16:9',
    title TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for generated_media
CREATE INDEX IF NOT EXISTS idx_generated_media_user_id ON public.generated_media(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_media_created_at ON public.generated_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_media_type ON public.generated_media(type);

-- Enable RLS
ALTER TABLE public.generated_media ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view their own generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Users can insert their own generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Users can delete their own generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Users can update their own generated media" ON public.generated_media;

CREATE POLICY "Users can view their own generated media"
ON public.generated_media FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated media"
ON public.generated_media FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated media"
ON public.generated_media FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated media"
ON public.generated_media FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_media TO authenticated;

-- 3. DRAFTS TABLE (stores incomplete/failed generations)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    prompt TEXT NOT NULL,
    model TEXT,
    aspect_ratio TEXT DEFAULT '16:9',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'failed', 'cancelled')),
    error_message TEXT,
    partial_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for drafts
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON public.drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON public.drafts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON public.drafts(status);

-- Enable RLS
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Drafts policies
DROP POLICY IF EXISTS "Users can view their own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can insert their own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can update their own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can delete their own drafts" ON public.drafts;

CREATE POLICY "Users can view their own drafts"
ON public.drafts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts"
ON public.drafts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
ON public.drafts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
ON public.drafts FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drafts TO authenticated;

-- 4. Add comments
-- =====================================================
COMMENT ON TABLE public.profiles IS 'User profile data extending auth.users';
COMMENT ON TABLE public.generated_media IS 'Completed AI-generated images and videos';
COMMENT ON TABLE public.drafts IS 'Incomplete or failed generation attempts';

-- Done!
SELECT 'Schema created successfully!' AS status;
