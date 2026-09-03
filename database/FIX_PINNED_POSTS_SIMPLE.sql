-- ============================================================================
-- SIMPLE FIX: Allow everyone to read pinned posts in menu
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop ALL existing SELECT policies on posts table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'posts' 
        AND cmd = 'SELECT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', pol.policyname);
    END LOOP;
END $$;

-- Step 2: Create TWO simple policies for reading posts

-- Policy A: Anonymous users (not logged in) can read published posts
CREATE POLICY "anon_read_published_posts"
ON public.posts
FOR SELECT
TO anon
USING (status = 'published');

-- Policy B: Authenticated users can read published posts + admins can read all
CREATE POLICY "auth_read_posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  status = 'published' 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);

-- Step 3: Verify policies were created
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
  END as operation
FROM pg_policies
WHERE tablename = 'posts'
AND cmd = 'SELECT'
ORDER BY policyname;

-- Step 4: Test query (what the frontend runs)
SELECT 
  id, 
  title, 
  section, 
  category, 
  status,
  is_pinned
FROM public.posts
WHERE is_pinned = true 
  AND status = 'published'
ORDER BY section, published_at DESC
LIMIT 10;

-- ============================================================================
-- SUCCESS CHECK
-- ============================================================================

DO $$
DECLARE
  pinned_count INT;
BEGIN
  SELECT COUNT(*) INTO pinned_count
  FROM public.posts
  WHERE is_pinned = true AND status = 'published';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ POLICY FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Pinned posts found: %', pinned_count;
  RAISE NOTICE '';
  RAISE NOTICE 'What changed:';
  RAISE NOTICE '  ✓ Removed old conflicting policies';
  RAISE NOTICE '  ✓ Created anon_read_published_posts';
  RAISE NOTICE '  ✓ Created auth_read_posts';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Refresh your website (Ctrl+Shift+R)';
  RAISE NOTICE '  2. Check browser console (F12)';
  RAISE NOTICE '  3. Look for: "✅ Featured map created"';
  RAISE NOTICE '  4. Hover over menu items to see Featured section';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
