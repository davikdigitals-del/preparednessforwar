-- Simple RLS Policy Fix - Works with mixed data types
-- Run this in Supabase SQL Editor

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP ALL EXISTING POLICIES (Safe - uses IF EXISTS)
-- ============================================================================

DROP POLICY IF EXISTS "courses_read" ON public.courses;
DROP POLICY IF EXISTS "courses_write" ON public.courses;
DROP POLICY IF EXISTS "courses_public_select" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_select" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_update" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_delete" ON public.courses;

DROP POLICY IF EXISTS "course_modules_read" ON public.course_modules;
DROP POLICY IF EXISTS "course_modules_write" ON public.course_modules;
DROP POLICY IF EXISTS "course_modules_select" ON public.course_modules;
DROP POLICY IF EXISTS "course_modules_admin" ON public.course_modules;

DROP POLICY IF EXISTS "course_lessons_read" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_write" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_select" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_admin" ON public.course_lessons;

DROP POLICY IF EXISTS "course_enrollments_read" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_write" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_select" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_insert" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_update" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_admin_select" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_admin" ON public.course_enrollments;

DROP POLICY IF EXISTS "course_reviews_read" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_write" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_select" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_insert" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_user_update" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_admin_select" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_admin" ON public.course_reviews;

DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_write" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;

DROP POLICY IF EXISTS "newsletter_subscribers_read" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_write" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_anon" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_admin_select" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_admin" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_anon_insert" ON public.newsletter_subscribers;

-- ============================================================================
-- SIMPLE PERMISSIVE POLICIES (No complex joins)
-- ============================================================================

-- COURSES: Everyone can see published, admins see all
CREATE POLICY "courses_read" ON public.courses FOR SELECT 
  USING (
    is_published = true 
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
  );

CREATE POLICY "courses_write" ON public.courses FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- COURSE_MODULES: Everyone can see published
CREATE POLICY "course_modules_read" ON public.course_modules FOR SELECT 
  USING (is_published = true OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "course_modules_write" ON public.course_modules FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- COURSE_LESSONS: Everyone can see published
CREATE POLICY "course_lessons_read" ON public.course_lessons FOR SELECT 
  USING (is_published = true OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "course_lessons_write" ON public.course_lessons FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- COURSE_ENROLLMENTS: Users see their own, admins see all
CREATE POLICY "course_enrollments_read" ON public.course_enrollments FOR SELECT TO authenticated 
  USING (
    user_id = auth.uid() 
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
  );

CREATE POLICY "course_enrollments_write" ON public.course_enrollments FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- COURSE_REVIEWS: Everyone can see published, users manage own
CREATE POLICY "course_reviews_read" ON public.course_reviews FOR SELECT 
  USING (
    is_published = true 
    OR user_id = auth.uid()
    OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
  );

CREATE POLICY "course_reviews_write" ON public.course_reviews FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- PROFILES: Users see own, admins see all
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated 
  USING (
    id = auth.uid() 
    OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin'))
  );

CREATE POLICY "profiles_write" ON public.profiles FOR ALL TO authenticated 
  USING (id = auth.uid() OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')))
  WITH CHECK (id = auth.uid() OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')));

-- NEWSLETTER_SUBSCRIBERS: Admins only, but anon can insert
CREATE POLICY "newsletter_subscribers_read" ON public.newsletter_subscribers FOR SELECT TO authenticated 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "newsletter_subscribers_write" ON public.newsletter_subscribers FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')))
  WITH CHECK (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "newsletter_subscribers_anon" ON public.newsletter_subscribers FOR INSERT 
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('courses', 'course_modules', 'course_lessons', 'course_enrollments', 'course_reviews', 'profiles', 'newsletter_subscribers')
GROUP BY tablename
ORDER BY tablename;
