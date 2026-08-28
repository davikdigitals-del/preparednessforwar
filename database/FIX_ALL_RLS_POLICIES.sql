-- Comprehensive RLS Policy Fix for All Tables
-- Run this in Supabase SQL Editor to enable proper access

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP ALL EXISTING POLICIES (if they exist)
-- ============================================================================

DROP POLICY IF EXISTS "courses_public_select" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_select" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_update" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_delete" ON public.courses;

DROP POLICY IF EXISTS "course_modules_select" ON public.course_modules;
DROP POLICY IF EXISTS "course_modules_admin" ON public.course_modules;

DROP POLICY IF EXISTS "course_lessons_select" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_admin" ON public.course_lessons;

DROP POLICY IF EXISTS "course_enrollments_select" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_user" ON public.course_enrollments;
DROP POLICY IF EXISTS "course_enrollments_admin" ON public.course_enrollments;

DROP POLICY IF EXISTS "course_reviews_select" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_user" ON public.course_reviews;
DROP POLICY IF EXISTS "course_reviews_admin" ON public.course_reviews;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "newsletter_subscribers_select" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribers_admin" ON public.newsletter_subscribers;

-- ============================================================================
-- COURSES TABLE POLICIES
-- ============================================================================

-- Anyone can view published courses
CREATE POLICY "courses_public_select" ON public.courses 
  FOR SELECT 
  USING (is_published = true);

-- Admins can view all courses (published or not)
CREATE POLICY "courses_admin_select" ON public.courses 
  FOR SELECT TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Admins can insert courses
CREATE POLICY "courses_admin_insert" ON public.courses 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Admins can update courses
CREATE POLICY "courses_admin_update" ON public.courses 
  FOR UPDATE TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Admins can delete courses
CREATE POLICY "courses_admin_delete" ON public.courses 
  FOR DELETE TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- ============================================================================
-- COURSE MODULES TABLE POLICIES
-- ============================================================================

-- Anyone can view published modules in published courses
CREATE POLICY "course_modules_select" ON public.course_modules 
  FOR SELECT 
  USING (
    is_published = true AND course_id::text IN (
      SELECT id::text FROM public.courses WHERE is_published = true
    )
  );

-- Admins can view/edit all modules
CREATE POLICY "course_modules_admin" ON public.course_modules 
  FOR ALL TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- ============================================================================
-- COURSE LESSONS TABLE POLICIES
-- ============================================================================

-- Anyone can view published lessons in published courses
CREATE POLICY "course_lessons_select" ON public.course_lessons 
  FOR SELECT 
  USING (
    is_published = true AND course_id::text IN (
      SELECT id::text FROM public.courses WHERE is_published = true
    )
  );

-- Admins can view/edit all lessons
CREATE POLICY "course_lessons_admin" ON public.course_lessons 
  FOR ALL TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- ============================================================================
-- COURSE ENROLLMENTS TABLE POLICIES
-- ============================================================================

-- Users can see their own enrollments
CREATE POLICY "course_enrollments_select" ON public.course_enrollments 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

-- Users can create enrollments for themselves
CREATE POLICY "course_enrollments_insert" ON public.course_enrollments 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollments
CREATE POLICY "course_enrollments_update" ON public.course_enrollments 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all enrollments
CREATE POLICY "course_enrollments_admin_select" ON public.course_enrollments 
  FOR SELECT TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Admins can manage all enrollments
CREATE POLICY "course_enrollments_admin" ON public.course_enrollments 
  FOR ALL TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- ============================================================================
-- COURSE REVIEWS TABLE POLICIES
-- ============================================================================

-- Anyone can view published reviews
CREATE POLICY "course_reviews_select" ON public.course_reviews 
  FOR SELECT 
  USING (is_published = true);

-- Users can create reviews for courses they're enrolled in
CREATE POLICY "course_reviews_insert" ON public.course_reviews 
  FOR INSERT TO authenticated 
  WITH CHECK (
    user_id = auth.uid() AND EXISTS(
      SELECT 1 FROM public.course_enrollments 
      WHERE course_id = NEW.course_id AND user_id = auth.uid()
    )
  );

-- Users can update their own reviews
CREATE POLICY "course_reviews_user_update" ON public.course_reviews 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all reviews
CREATE POLICY "course_reviews_admin_select" ON public.course_reviews 
  FOR SELECT TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Admins can manage all reviews
CREATE POLICY "course_reviews_admin" ON public.course_reviews 
  FOR ALL TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    (role = NEW.role OR role IS NULL) AND 
    (is_admin = OLD.is_admin)  -- Prevent self-promotion to admin
  );

-- Admins can view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles 
  FOR SELECT TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Admins can manage all profiles
CREATE POLICY "profiles_admin" ON public.profiles 
  FOR ALL TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- ============================================================================
-- NEWSLETTER SUBSCRIBERS TABLE POLICIES
-- ============================================================================

-- Admins can view all subscribers
CREATE POLICY "newsletter_subscribers_admin_select" ON public.newsletter_subscribers 
  FOR SELECT TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Admins can manage subscribers
CREATE POLICY "newsletter_subscribers_admin" ON public.newsletter_subscribers 
  FOR ALL TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
  ));

-- Anyone can subscribe (anon)
CREATE POLICY "newsletter_subscribers_anon_insert" ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- ============================================================================
-- VERIFY ALL POLICIES WERE CREATED
-- ============================================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('courses', 'course_modules', 'course_lessons', 'course_enrollments', 'course_reviews', 'profiles', 'newsletter_subscribers')
GROUP BY tablename
ORDER BY tablename;

-- Show all policies
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE cmd
  END as action
FROM pg_policies
WHERE tablename IN ('courses', 'course_modules', 'course_lessons', 'course_enrollments', 'course_reviews', 'profiles', 'newsletter_subscribers')
ORDER BY tablename, policyname;
