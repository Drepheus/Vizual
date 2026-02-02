-- ============================================================
-- FIX: Add is_public column and community visibility policy
-- Run this in Supabase SQL Editor to fix community page
-- ============================================================

-- 1. Add is_public column to generated_media (if not exists)
ALTER TABLE public.generated_media 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- 2. Add missing columns from complete schema (if not exists)
ALTER TABLE public.generated_media 
ADD COLUMN IF NOT EXISTS model TEXT;

ALTER TABLE public.generated_media 
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '16:9';

ALTER TABLE public.generated_media 
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.generated_media 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- 3. Update existing records to be public (for community)
UPDATE public.generated_media SET is_public = TRUE WHERE is_public IS NULL;

-- 4. Drop old policies
DROP POLICY IF EXISTS "Users can view their own generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Users can insert their own generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Users can update their own generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Users can delete their own generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Anyone can view public generated media" ON public.generated_media;
DROP POLICY IF EXISTS "Public media readable by all" ON public.generated_media;

-- 5. Create new policies

-- Policy: Users can view their OWN media (private or public)
CREATE POLICY "Users can view their own generated media"
ON public.generated_media 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: ANYONE can view PUBLIC media (for community page)
CREATE POLICY "Anyone can view public generated media"
ON public.generated_media 
FOR SELECT 
USING (is_public = TRUE);

-- Policy: Users can insert their own media
CREATE POLICY "Users can insert their own generated media"
ON public.generated_media 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own media
CREATE POLICY "Users can update their own generated media"
ON public.generated_media 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own media
CREATE POLICY "Users can delete their own generated media"
ON public.generated_media 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Grant permissions
GRANT SELECT ON public.generated_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_media TO authenticated;

-- 7. Create index for public queries (performance)
CREATE INDEX IF NOT EXISTS idx_generated_media_is_public ON public.generated_media(is_public);

-- ============================================================
-- VERIFY: Check the table structure
-- ============================================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'generated_media';

-- ============================================================
-- DONE! Community page should now work.
-- ============================================================
