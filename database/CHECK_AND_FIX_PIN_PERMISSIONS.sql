-- ========================================
-- CHECK AND FIX PERMISSIONS FOR PIN FEATURE
-- ========================================

-- 1. Check current RLS policies on posts table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- 2. Check if is_pinned column exists and is accessible
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'is_pinned';

-- 3. Check current pinned posts
SELECT 
    id,
    title,
    section,
    is_pinned,
    status
FROM posts
WHERE is_pinned = TRUE
ORDER BY section, published_at DESC;

-- 4. Enable RLS on posts if not already enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to recreate them properly)
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Admins can do everything with posts" ON posts;
DROP POLICY IF EXISTS "Admin full access to posts" ON posts;

-- 6. Create proper RLS policies
-- Allow public to read published posts
CREATE POLICY "Public can view published posts"
ON posts FOR SELECT
TO public
USING (status = 'published');

-- Allow authenticated users to read all posts
CREATE POLICY "Authenticated users can view all posts"
ON posts FOR SELECT
TO authenticated
USING (true);

-- Allow admins full access
CREATE POLICY "Admins have full access to posts"
ON posts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 7. Test: Try to update a post's is_pinned status (will fail if permissions are wrong)
-- This is a dry run - commented out to avoid actual changes
-- UPDATE posts SET is_pinned = true WHERE id = (SELECT id FROM posts LIMIT 1);

-- 8. Show final RLS policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

SELECT '✅ Permissions check and fix completed!' as status;
