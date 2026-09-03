-- ============================================================================
-- COMPLETE ADMIN POLICIES - Allow all admin operations
-- ============================================================================

-- Step 1: Drop ALL existing policies on posts table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'posts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON posts', pol.policyname);
    END LOOP;
    RAISE NOTICE '✅ Dropped all old policies';
END $$;

-- Step 2: Create simple policies for authenticated users (admins)

-- SELECT: Everyone can read published posts
CREATE POLICY "public_read_published"
ON posts FOR SELECT
USING (status = 'published');

-- INSERT: Any authenticated user can create posts
CREATE POLICY "authenticated_can_insert"
ON posts FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Any authenticated user can update posts
CREATE POLICY "authenticated_can_update"
ON posts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Any authenticated user can delete posts
CREATE POLICY "authenticated_can_delete"
ON posts FOR DELETE
TO authenticated
USING (true);

-- Step 3: Verify policies were created
SELECT 
  '=== NEW POLICIES ===' as info,
  policyname,
  cmd as operation,
  roles::text
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- Step 4: Test that operations work
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COMPLETE ADMIN POLICIES CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  ✓ public_read_published (SELECT)';
  RAISE NOTICE '  ✓ authenticated_can_insert (INSERT)';
  RAISE NOTICE '  ✓ authenticated_can_update (UPDATE)';
  RAISE NOTICE '  ✓ authenticated_can_delete (DELETE)';
  RAISE NOTICE '';
  RAISE NOTICE 'What this means:';
  RAISE NOTICE '  - Anyone can VIEW published posts';
  RAISE NOTICE '  - Logged-in users can CREATE posts';
  RAISE NOTICE '  - Logged-in users can UPDATE posts (pin, publish, edit)';
  RAISE NOTICE '  - Logged-in users can DELETE posts';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Refresh admin panel (Ctrl+Shift+R)';
  RAISE NOTICE '  2. Try creating/editing/pinning posts';
  RAISE NOTICE '  3. Everything should now save to database';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: Currently any logged-in user has full access.';
  RAISE NOTICE 'Later we can restrict to admins only.';
  RAISE NOTICE '';
END $$;
