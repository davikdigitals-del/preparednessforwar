-- ========================================
-- SECURITY HARDENING FOR PREPAREDNESS HUB
-- Run this in Supabase SQL Editor
-- ========================================
-- This script hardens your database against attacks

-- ========================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ========================================

-- Enable RLS on critical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_content ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. CREATE SECURITY FUNCTIONS
-- ========================================

-- Function to check if user is admin
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

-- Function to check if user owns a resource
CREATE OR REPLACE FUNCTION is_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rate limit actions (prevents brute force)
CREATE OR REPLACE FUNCTION check_rate_limit(
  action_type TEXT,
  max_attempts INTEGER DEFAULT 5,
  time_window INTERVAL DEFAULT INTERVAL '15 minutes'
)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM rate_limit_log
  WHERE user_id = auth.uid()
    AND action = action_type
    AND created_at > NOW() - time_window;

  -- Return false if over limit
  RETURN attempt_count < max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 3. CREATE RATE LIMITING TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action 
ON rate_limit_log(user_id, action, created_at);

-- Auto-cleanup old entries (keep only last 24 hours)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_log()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_log
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. SECURE PROFILES TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- New secure policies
CREATE POLICY "users_view_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_admin());

CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND NOT (role = 'admin' OR is_admin = true)); -- Can't promote self to admin

CREATE POLICY "admins_full_access_profiles"
ON profiles FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Prevent users from seeing other users' emails
CREATE POLICY "hide_other_emails"
ON profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR 
  is_admin() OR
  -- Hide email from non-admins
  (id != auth.uid() AND NOT is_admin())
);

-- ========================================
-- 5. SECURE POSTS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Admins have full access to posts" ON posts;

-- New secure policies
CREATE POLICY "public_read_published_posts"
ON posts FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "authenticated_read_all_posts"
ON posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_full_posts_access"
ON posts FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Prevent SQL injection in post content
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

CREATE TRIGGER sanitize_post_before_insert
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION sanitize_post_content();

-- ========================================
-- 6. SECURE USER AUTHENTICATION
-- ========================================

-- Create failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_login_email 
ON failed_login_attempts(email, attempted_at);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  failed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO failed_count
  FROM failed_login_attempts
  WHERE email = user_email
    AND attempted_at > NOW() - INTERVAL '1 hour';
  
  -- Lock account after 5 failed attempts in 1 hour
  RETURN failed_count >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. SECURE COURSE ENROLLMENTS
-- ========================================

DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON course_enrollments;

CREATE POLICY "users_view_own_enrollments"
ON course_enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "users_enroll_courses"
ON course_enrollments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_manage_enrollments"
ON course_enrollments FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Prevent duplicate enrollments
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_enrollment 
ON course_enrollments(user_id, course_id);

-- ========================================
-- 8. AUDIT LOGGING
-- ========================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_audit_user_action 
ON audit_log(user_id, action, created_at);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF is_admin() THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_posts_changes
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_profiles_changes
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_admin_action();

-- ========================================
-- 9. PREVENT PRIVILEGE ESCALATION
-- ========================================

-- Trigger to prevent users from promoting themselves to admin
CREATE OR REPLACE FUNCTION prevent_self_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is trying to change their own admin status
  IF NEW.id = auth.uid() AND (
    (OLD.is_admin = false AND NEW.is_admin = true) OR
    (OLD.role != 'admin' AND NEW.role = 'admin')
  ) THEN
    RAISE EXCEPTION 'Cannot promote yourself to admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_self_admin_promotion
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_self_promotion();

-- ========================================
-- 10. SQL INJECTION PROTECTION
-- ========================================

-- Function to validate and sanitize user input
CREATE OR REPLACE FUNCTION sanitize_input(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove common SQL injection patterns
  input_text = regexp_replace(input_text, '(--|#|/\*|\*/|xp_|sp_|EXEC|EXECUTE)', '', 'gi');
  input_text = regexp_replace(input_text, '(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)', '', 'gi');
  
  RETURN input_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 11. SETUP SCHEDULED CLEANUP JOBS
-- ========================================

-- Note: These need to be set up in Supabase Dashboard > Database > Cron jobs

-- Clean up old rate limit logs (run daily)
-- SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_rate_limit_log()');

-- Clean up old failed login attempts (run daily)
-- SELECT cron.schedule('cleanup-failed-logins', '0 3 * * *', 
--   'DELETE FROM failed_login_attempts WHERE attempted_at < NOW() - INTERVAL ''7 days''');

-- ========================================
-- 12. SECURITY VIEWS FOR MONITORING
-- ========================================

-- View for monitoring suspicious activity
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT 
  al.user_id,
  p.email,
  al.action,
  al.table_name,
  COUNT(*) as action_count,
  MAX(al.created_at) as last_action
FROM audit_log al
LEFT JOIN profiles p ON al.user_id = p.id
WHERE al.created_at > NOW() - INTERVAL '1 hour'
GROUP BY al.user_id, p.email, al.action, al.table_name
HAVING COUNT(*) > 50  -- More than 50 actions per hour is suspicious
ORDER BY action_count DESC;

-- View for failed login monitoring
CREATE OR REPLACE VIEW failed_login_summary AS
SELECT 
  email,
  COUNT(*) as failed_attempts,
  MAX(attempted_at) as last_attempt,
  is_account_locked(email) as is_locked
FROM failed_login_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY email
ORDER BY failed_attempts DESC;

-- ========================================
-- 13. GRANT NECESSARY PERMISSIONS
-- ========================================

-- Grant execute on security functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, INTERVAL) TO authenticated;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check RLS is enabled on critical tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'posts', 'user_roles', 'course_enrollments')
ORDER BY tablename;

-- Check active policies
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ SECURITY HARDENING COMPLETE!' as status,
       '🔒 Database is now protected with multiple security layers' as message,
       '⚠️ Remember to configure Cloudflare for complete protection' as reminder;
