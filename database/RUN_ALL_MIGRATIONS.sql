-- ============================================================
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- It is safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- 1. Add course_type column
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS course_type TEXT NOT NULL DEFAULT 'course'
    CHECK (course_type IN ('course', 'episode'));

-- 2. Add images and video_url to affiliate_products
ALTER TABLE affiliate_products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';

-- 3. Enable RLS on courses tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe re-run)
DROP POLICY IF EXISTS "courses_public_read"       ON courses;
DROP POLICY IF EXISTS "courses_admin_all"         ON courses;
DROP POLICY IF EXISTS "modules_public_read"       ON course_modules;
DROP POLICY IF EXISTS "modules_admin_all"         ON course_modules;
DROP POLICY IF EXISTS "lessons_public_read"       ON course_lessons;
DROP POLICY IF EXISTS "lessons_admin_all"         ON course_lessons;
DROP POLICY IF EXISTS "enrollments_own_read"      ON course_enrollments;
DROP POLICY IF EXISTS "enrollments_own_insert"    ON course_enrollments;
DROP POLICY IF EXISTS "enrollments_own_update"    ON course_enrollments;
DROP POLICY IF EXISTS "enrollments_admin_all"     ON course_enrollments;

-- Courses: anyone can read published, admins can do everything
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "courses_admin_all" ON courses
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Modules: anyone can read published, admins can do everything
CREATE POLICY "modules_public_read" ON course_modules
  FOR SELECT USING (is_published = true);

CREATE POLICY "modules_admin_all" ON course_modules
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Lessons: anyone can read published, admins can do everything
CREATE POLICY "lessons_public_read" ON course_lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "lessons_admin_all" ON course_lessons
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Enrollments: users manage their own, admins manage all
CREATE POLICY "enrollments_own_read" ON course_enrollments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "enrollments_own_insert" ON course_enrollments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "enrollments_own_update" ON course_enrollments
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "enrollments_admin_all" ON course_enrollments
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- 4. Affiliate products RLS
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliate_products_public_read" ON affiliate_products;
DROP POLICY IF EXISTS "affiliate_products_admin_all"   ON affiliate_products;

CREATE POLICY "affiliate_products_public_read" ON affiliate_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "affiliate_products_admin_all" ON affiliate_products
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Done
SELECT 'Migrations complete' AS status;
