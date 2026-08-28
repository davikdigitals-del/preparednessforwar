-- ========================================
-- BASIC SECURITY HARDENING (NO ERRORS)
-- Run this in Supabase SQL Editor
-- This is a simplified version that won't fail
-- ========================================

-- ========================================
-- STEP 1: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: CREATE ADMIN CHECK FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR is_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 3: SECURE POSTS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "public_can_view_published_posts" ON posts;
DROP POLICY IF EXISTS "Admins have full access to posts" ON posts;
DROP POLICY IF EXISTS "admins_full_posts_access" ON posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON posts;
DROP POLICY IF EXISTS "authenticated_read_all_posts" ON posts;

-- Create new secure policies
CREATE POLICY "public_read_published"
ON posts FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "auth_read_all"
ON posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_full_access"
ON posts FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ========================================
-- STEP 4: SECURE PROFILES TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "admins_full_access_profiles" ON profiles;

-- Create new policies
CREATE POLICY "view_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_admin());

CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "admin_manage_profiles"
ON profiles FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ========================================
-- STEP 5: PREVENT PRIVILEGE ESCALATION
-- ========================================

CREATE OR REPLACE FUNCTION prevent_self_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from promoting themselves to admin
  IF NEW.id = auth.uid() AND (
    (OLD.is_admin = false AND NEW.is_admin = true) OR
    (OLD.role != 'admin' AND NEW.role = 'admin')
  ) THEN
    RAISE EXCEPTION 'Cannot promote yourself to admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_self_admin_promotion ON profiles;
CREATE TRIGGER prevent_self_admin_promotion
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_self_promotion();

-- ========================================
-- STEP 6: SANITIZE POST CONTENT (XSS PREVENTION)
-- ========================================

CREATE OR REPLACE FUNCTION sanitize_post_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Strip dangerous HTML tags
  NEW.content = regexp_replace(NEW.content, '<script[^>]*>.*?</script>', '', 'gi');
  NEW.content = regexp_replace(NEW.content, '<iframe[^>]*>.*?</iframe>', '', 'gi');
  NEW.content = regexp_replace(NEW.content, 'javascript:', '', 'gi');
  NEW.content = regexp_replace(NEW.content, 'on\w+\s*=', '', 'gi');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sanitize_post_before_insert ON posts;
CREATE TRIGGER sanitize_post_before_insert
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION sanitize_post_content();

-- ========================================
-- VERIFICATION
-- ========================================

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'posts')
ORDER BY tablename;

-- Check policies exist
SELECT 
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'posts')
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ BASIC SECURITY HARDENING COMPLETE!' as status,
       '🔒 Your database now has essential protection' as message,
       '📋 For full security, also set up Cloudflare' as next_step;
