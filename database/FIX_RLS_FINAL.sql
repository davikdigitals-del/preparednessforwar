-- Final RLS Fix - No recursion, simple and clean
-- Run this in Supabase SQL Editor

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP ALL POLICIES
-- ============================================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname, tablename FROM pg_policies 
    WHERE tablename IN ('courses', 'course_modules', 'course_lessons', 'course_enrollments', 'course_reviews', 'profiles', 'newsletter_subscribers')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- COURSES TABLE - Simple policies
-- ============================================================================

-- Everyone sees published courses
CREATE POLICY "courses_select_published" ON public.courses 
  FOR SELECT USING (is_published = true);

-- Authenticated users who are admin can see all
CREATE POLICY "courses_select_admin" ON public.courses 
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- Authenticated admin can insert
CREATE POLICY "courses_insert_admin" ON public.courses 
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- Authenticated admin can update
CREATE POLICY "courses_update_admin" ON public.courses 
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- Authenticated admin can delete
CREATE POLICY "courses_delete_admin" ON public.courses 
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- ============================================================================
-- COURSE_MODULES - Simple policies
-- ============================================================================

CREATE POLICY "course_modules_select_published" ON public.course_modules 
  FOR SELECT USING (is_published = true);

CREATE POLICY "course_modules_select_admin" ON public.course_modules 
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "course_modules_all_admin" ON public.course_modules 
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- ============================================================================
-- COURSE_LESSONS - Simple policies
-- ============================================================================

CREATE POLICY "course_lessons_select_published" ON public.course_lessons 
  FOR SELECT USING (is_published = true);

CREATE POLICY "course_lessons_select_admin" ON public.course_lessons 
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "course_lessons_all_admin" ON public.course_lessons 
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- ============================================================================
-- COURSE_ENROLLMENTS - User sees own, admin sees all
-- ============================================================================

CREATE POLICY "course_enrollments_select_own" ON public.course_enrollments 
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "course_enrollments_select_admin" ON public.course_enrollments 
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "course_enrollments_insert_own" ON public.course_enrollments 
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "course_enrollments_all_admin" ON public.course_enrollments 
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- ============================================================================
-- COURSE_REVIEWS - Published visible to all, admin sees all
-- ============================================================================

CREATE POLICY "course_reviews_select_published" ON public.course_reviews 
  FOR SELECT USING (is_published = true);

CREATE POLICY "course_reviews_select_own" ON public.course_reviews 
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "course_reviews_select_admin" ON public.course_reviews 
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "course_reviews_all_admin" ON public.course_reviews 
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- ============================================================================
-- PROFILES - User sees own, admin sees all
-- ============================================================================

CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admin" ON public.profiles 
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_all_admin" ON public.profiles 
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

-- ============================================================================
-- NEWSLETTER_SUBSCRIBERS - Anon can insert, admin can view/edit
-- ============================================================================

CREATE POLICY "newsletter_select_admin" ON public.newsletter_subscribers 
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "newsletter_all_admin" ON public.newsletter_subscribers 
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "newsletter_insert_anon" ON public.newsletter_subscribers 
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- Verify
-- ============================================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('courses', 'course_modules', 'course_lessons', 'course_enrollments', 'course_reviews', 'profiles', 'newsletter_subscribers')
GROUP BY tablename
ORDER BY tablename;
