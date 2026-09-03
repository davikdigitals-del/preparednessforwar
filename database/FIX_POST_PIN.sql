-- ============================================================================
-- FIX POST PIN FUNCTIONALITY
-- Run this in Supabase SQL Editor to fix pinning/unpinning posts
-- ============================================================================

-- 1. Ensure is_pinned column exists
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 2. Create index for faster pinned post queries
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned 
ON public.posts(is_pinned) 
WHERE is_pinned = true;

CREATE INDEX IF NOT EXISTS idx_posts_section_pinned 
ON public.posts(section, is_pinned) 
WHERE is_pinned = true;

-- 3. Drop existing policies that might be blocking updates
DROP POLICY IF EXISTS "posts_admin_update" ON public.posts;
DROP POLICY IF EXISTS "posts_update_admin" ON public.posts;
DROP POLICY IF EXISTS "Admin can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "posts_admin_full_update" ON public.posts;

-- 4. Create comprehensive admin update policy
CREATE POLICY "posts_admin_full_update"
ON public.posts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);

-- 5. Ensure EVERYONE can select published posts (including pinned ones)
DROP POLICY IF EXISTS "posts_admin_select" ON public.posts;
DROP POLICY IF EXISTS "posts_select_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_public_select" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;

-- Policy for ANONYMOUS users (not logged in)
CREATE POLICY "posts_anon_select_published"
ON public.posts
FOR SELECT
TO anon
USING (status = 'published');

-- Policy for AUTHENTICATED users
CREATE POLICY "posts_auth_select"
ON public.posts
FOR SELECT
TO authenticated
USING (
  -- Admins can see all posts
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
  OR
  -- Everyone else can see published posts
  status = 'published'
);

-- 6. Test the pin functionality
DO $$
DECLARE
  test_post_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get an admin user
  SELECT id INTO admin_user_id 
  FROM public.profiles 
  WHERE is_admin = true OR role = 'admin' 
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE NOTICE '⚠️ No admin user found. Make sure you have at least one admin user.';
    RETURN;
  END IF;

  -- Get a test post
  SELECT id INTO test_post_id 
  FROM public.posts 
  WHERE status = 'published' 
  LIMIT 1;

  IF test_post_id IS NULL THEN
    RAISE NOTICE '⚠️ No published posts found. Create a post first.';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Test setup complete:';
  RAISE NOTICE '   Admin User: %', admin_user_id;
  RAISE NOTICE '   Test Post: %', test_post_id;
  RAISE NOTICE '';
  RAISE NOTICE '📌 Pin functionality should now work!';
END $$;

-- 7. Show current pinned posts
SELECT 
  id,
  title,
  section,
  is_pinned,
  status,
  created_at
FROM public.posts
WHERE is_pinned = true
ORDER BY section, created_at DESC;

-- 8. Show RLS policies for posts table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    WHEN cmd = 'ALL' THEN 'All Operations'
    ELSE cmd
  END as operation
FROM pg_policies
WHERE tablename = 'posts'
AND policyname LIKE '%admin%'
ORDER BY cmd, policyname;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if is_pinned column exists
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'posts'
AND column_name = 'is_pinned';

-- Show pinned post counts by section
SELECT 
  section,
  COUNT(*) as pinned_count,
  STRING_AGG(title, ', ') as pinned_posts
FROM public.posts
WHERE is_pinned = true
AND status = 'published'
GROUP BY section
ORDER BY section;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ POST PIN FIX COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '  1. ✅ is_pinned column exists';
  RAISE NOTICE '  2. ✅ Indexes created for performance';
  RAISE NOTICE '  3. ✅ Admin update policy created';
  RAISE NOTICE '  4. ✅ Admin select policy created';
  RAISE NOTICE '';
  RAISE NOTICE 'How to use:';
  RAISE NOTICE '  1. Go to Admin → Posts';
  RAISE NOTICE '  2. Click the 📌 button next to any post';
  RAISE NOTICE '  3. Post will be pinned (shows as Featured in menu)';
  RAISE NOTICE '  4. Max 2 pinned posts per section';
  RAISE NOTICE '';
  RAISE NOTICE 'Troubleshooting:';
  RAISE NOTICE '  - Check browser console (F12) for errors';
  RAISE NOTICE '  - Make sure you are logged in as admin';
  RAISE NOTICE '  - Refresh the page after pinning';
  RAISE NOTICE '';
END $$;
