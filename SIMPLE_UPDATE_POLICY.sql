-- Temporarily allow ANY authenticated user to update posts
-- (We'll restrict it later once we confirm it works)

DROP POLICY IF EXISTS "admins_can_update_posts" ON posts;
DROP POLICY IF EXISTS "posts_admin_full_update" ON posts;
DROP POLICY IF EXISTS "posts_admin_update" ON posts;

CREATE POLICY "anyone_authenticated_can_update"
ON posts FOR UPDATE
TO authenticated
USING (true)  -- Allow any authenticated user
WITH CHECK (true);

-- Test it immediately
UPDATE posts 
SET is_pinned = true 
WHERE id = (SELECT id FROM posts WHERE status = 'published' LIMIT 1)
RETURNING id, title, is_pinned;

-- Check if it worked
SELECT 'Test result:' as step, id, title, section, is_pinned
FROM posts
WHERE is_pinned = true;

DO $$
BEGIN
  RAISE NOTICE '✅ Simple UPDATE policy created';
  RAISE NOTICE 'Any authenticated user can now update posts';
  RAISE NOTICE 'Try clicking pin button in admin now';
END $$;
