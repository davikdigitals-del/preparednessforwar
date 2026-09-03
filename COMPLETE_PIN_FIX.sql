-- ============================================================================
-- COMPLETE PIN FIX - Sync frontend and database
-- ============================================================================

-- Step 1: Reset all pins (start fresh)
UPDATE posts SET is_pinned = false;

-- Step 2: Check UPDATE policies exist
SELECT 'Current UPDATE policies:' as step, policyname, roles::text
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- Step 3: Drop and recreate admin UPDATE policy
DROP POLICY IF EXISTS "posts_admin_full_update" ON posts;
DROP POLICY IF EXISTS "admins_can_update_posts" ON posts;
DROP POLICY IF EXISTS "posts_admin_update" ON posts;

CREATE POLICY "admins_can_update_posts"
ON posts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);

-- Step 4: Verify no posts are pinned now
SELECT 'After reset:' as step, COUNT(*) as pinned_count
FROM posts
WHERE is_pinned = true;

-- Step 5: Show all published posts (these are the ones you can pin)
SELECT 'Published posts you can pin:' as step, id, title, section, status
FROM posts
WHERE status = 'published'
ORDER BY section, created_at DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ PIN SYSTEM RESET COMPLETE';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your admin panel (Ctrl+Shift+R)';
  RAISE NOTICE '2. All posts should show as unpinned';
  RAISE NOTICE '3. Click pin button on a PUBLISHED post';
  RAISE NOTICE '4. It should now save to database correctly';
  RAISE NOTICE '';
END $$;
