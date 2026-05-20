-- ============================================================================
-- FIX RLS POLICIES
-- Run this in Supabase SQL Editor to fix 403 errors
-- ============================================================================

-- ── COUNTRIES TABLE ──────────────────────────────────────────────────────────

-- Enable RLS if not already
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view countries" ON countries;
DROP POLICY IF EXISTS "Admins can manage countries" ON countries;
DROP POLICY IF EXISTS "Public can view countries" ON countries;
DROP POLICY IF EXISTS "Admins manage countries" ON countries;

-- Anyone can read countries
CREATE POLICY "Anyone can view countries" ON countries
  FOR SELECT USING (true);

-- Admins can insert, update, delete
CREATE POLICY "Admins can manage countries" ON countries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ── PROFILES TABLE ────────────────────────────────────────────────────────────

-- Make sure admins can read all profiles (needed for admin pages)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- ── COURSE ENROLLMENTS ────────────────────────────────────────────────────────

-- Admins can view all enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;

CREATE POLICY "Admins can view all enrollments" ON course_enrollments
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ── GRANT PERMISSIONS ─────────────────────────────────────────────────────────

GRANT ALL ON countries TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON course_enrollments TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
