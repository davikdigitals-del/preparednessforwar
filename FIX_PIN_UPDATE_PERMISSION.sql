-- Check if UPDATE policies exist for posts
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE tablename = 'posts'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- Create admin UPDATE policy if it doesn't exist
DO $$
BEGIN
  -- Drop old policies
  DROP POLICY IF EXISTS "posts_admin_full_update" ON posts;
  DROP POLICY IF EXISTS "admins_can_update_posts" ON posts;
  
  -- Create new admin update policy
  CREATE POLICY "admins_can_update_posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );
  
  RAISE NOTICE '✅ Admin UPDATE policy created';
END $$;

-- Test: Try to update a post (this will show if permission works)
-- Replace the ID with one of your actual post IDs
UPDATE posts 
SET is_pinned = true 
WHERE id = (SELECT id FROM posts LIMIT 1)
RETURNING id, title, is_pinned;
