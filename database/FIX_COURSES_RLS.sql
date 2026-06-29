-- ============================================================
-- FIX: RLS policies for courses and related tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all courses-related tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (safe to re-run)
DROP POLICY IF EXISTS "courses_public_read"        ON courses;
DROP POLICY IF EXISTS "courses_admin_all"          ON courses;
DROP POLICY IF EXISTS "modules_public_read"        ON course_modules;
DROP POLICY IF EXISTS "modules_admin_all"          ON course_modules;
DROP POLICY IF EXISTS "lessons_public_read"        ON course_lessons;
DROP POLICY IF EXISTS "lessons_admin_all"          ON course_lessons;
DROP POLICY IF EXISTS "enrollments_own_read"       ON course_enrollments;
DROP POLICY IF EXISTS "enrollments_admin_all"      ON course_enrollments;

-- ── courses ──────────────────────────────────────────────────
-- Anyone can read published courses
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (is_published = true);

-- Admins (users with role = 'admin' in profiles) can do everything
CREATE POLICY "courses_admin_all" ON courses
  FOR ALL TO authenticated
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

-- ── course_modules ────────────────────────────────────────────
CREATE POLICY "modules_public_read" ON course_modules
  FOR SELECT USING (is_published = true);

CREATE POLICY "modules_admin_all" ON course_modules
  FOR ALL TO authenticated
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

-- ── course_lessons ────────────────────────────────────────────
CREATE POLICY "lessons_public_read" ON course_lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "lessons_admin_all" ON course_lessons
  FOR ALL TO authenticated
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

-- ── course_enrollments ────────────────────────────────────────
-- Users can read/manage their own enrollments
CREATE POLICY "enrollments_own_read" ON course_enrollments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "enrollments_admin_all" ON course_enrollments
  FOR ALL TO authenticated
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

-- Also ensure affiliate_products has admin write access
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliate_products_public_read" ON affiliate_products;
DROP POLICY IF EXISTS "affiliate_products_admin_all"   ON affiliate_products;

CREATE POLICY "affiliate_products_public_read" ON affiliate_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "affiliate_products_admin_all" ON affiliate_products
  FOR ALL TO authenticated
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
