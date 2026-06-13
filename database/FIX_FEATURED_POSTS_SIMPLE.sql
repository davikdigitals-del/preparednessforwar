-- ========================================
-- SIMPLE FIX FOR FEATURED POSTS IN MEGA MENU
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Check if you have any pinned posts
SELECT 
    id,
    title,
    section,
    category,
    is_pinned,
    status,
    published_at
FROM posts
WHERE is_pinned = TRUE
ORDER BY section, published_at DESC;

-- Step 2: If no results above, manually pin some posts for testing
-- Uncomment and modify the IDs below:
/*
UPDATE posts 
SET is_pinned = TRUE 
WHERE id IN (
    -- Replace with actual post IDs from your database
    'post-id-1',
    'post-id-2'
)
AND status = 'published';
*/

-- Step 3: Fix RLS policies to allow public to see is_pinned field
-- Drop old policies
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON posts;
DROP POLICY IF EXISTS "Admins have full access to posts" ON posts;
DROP POLICY IF EXISTS "Admin full access to posts" ON posts;

-- Create new correct policies
-- 1. Public can view ALL published post fields (including is_pinned)
CREATE POLICY "public_can_view_published_posts"
ON posts FOR SELECT
TO public
USING (status = 'published');

-- 2. Authenticated users can view all posts
CREATE POLICY "authenticated_can_view_all_posts"
ON posts FOR SELECT
TO authenticated
USING (true);

-- 3. Admins can do everything
CREATE POLICY "admins_full_access"
ON posts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.is_admin = true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.is_admin = true)
  )
);

-- Step 4: Verify the fix - check policies
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- Step 5: Test query that the frontend uses
SELECT 
    id, 
    title, 
    image, 
    section, 
    category, 
    standfirst, 
    is_pinned, 
    published_at
FROM posts
WHERE status = 'published'
AND is_pinned = true
ORDER BY published_at DESC;

-- Success message
SELECT '✅ Featured posts RLS policies fixed! Featured posts should now appear in mega menu.' as status;
