-- Secure RLS Policies - NO RECURSION
-- The key: Don't put RLS on profiles table, only on data tables

-- ============================================================================
-- STEP 1: DISABLE RLS on profiles (no recursion)
-- ============================================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: ENABLE RLS on data tables only
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: DROP ALL EXISTING POLICIES ON DATA TABLES
-- ============================================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname, tablename FROM pg_policies 
    WHERE tablename IN ('courses', 'course_modules', 'course_lessons', 'course_enrollments', 'course_reviews', 'newsletter_subscribers')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- COURSES TABLE POLICIES
-- ============================================================================

-- Public: See published courses
CREATE POLICY "courses_select_public" ON public.courses 
  FOR SELECT 
  USING (is_published = true);

-- Admin: See all courses
CREATE POLICY "courses_select_admin" ON public.courses 
  FOR SELECT TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Admin: Create courses
CREATE POLICY "courses_insert_admin" ON public.courses 
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Admin: Update courses
CREATE POLICY "courses_update_admin" ON public.courses 
  FOR UPDATE TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Admin: Delete courses
CREATE POLICY "courses_delete_admin" ON public.courses 
  FOR DELETE TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- ============================================================================
-- COURSE_MODULES TABLE POLICIES
-- ============================================================================

CREATE POLICY "course_modules_select_public" ON public.course_modules 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "course_modules_select_admin" ON public.course_modules 
  FOR SELECT TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

CREATE POLICY "course_modules_all_admin" ON public.course_modules 
  FOR ALL TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- ============================================================================
-- COURSE_LESSONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "course_lessons_select_public" ON public.course_lessons 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "course_lessons_select_admin" ON public.course_lessons 
  FOR SELECT TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

CREATE POLICY "course_lessons_all_admin" ON public.course_lessons 
  FOR ALL TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- ============================================================================
-- COURSE_ENROLLMENTS TABLE POLICIES
-- ============================================================================

-- Users see their own enrollments
CREATE POLICY "course_enrollments_select_own" ON public.course_enrollments 
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin sees all enrollments
CREATE POLICY "course_enrollments_select_admin" ON public.course_enrollments 
  FOR SELECT TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Users can create own enrollments
CREATE POLICY "course_enrollments_insert_own" ON public.course_enrollments 
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can manage all enrollments
CREATE POLICY "course_enrollments_all_admin" ON public.course_enrollments 
  FOR ALL TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- ============================================================================
-- COURSE_REVIEWS TABLE POLICIES
-- ============================================================================

-- Public sees published reviews
CREATE POLICY "course_reviews_select_public" ON public.course_reviews 
  FOR SELECT 
  USING (is_published = true);

-- Users see their own reviews
CREATE POLICY "course_reviews_select_own" ON public.course_reviews 
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin sees all reviews
CREATE POLICY "course_reviews_select_admin" ON public.course_reviews 
  FOR SELECT TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Admin can manage all reviews
CREATE POLICY "course_reviews_all_admin" ON public.course_reviews 
  FOR ALL TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- ============================================================================
-- NEWSLETTER_SUBSCRIBERS TABLE POLICIES
-- ============================================================================

-- Admin sees all subscribers
CREATE POLICY "newsletter_select_admin" ON public.newsletter_subscribers 
  FOR SELECT TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Admin manages subscribers
CREATE POLICY "newsletter_all_admin" ON public.newsletter_subscribers 
  FOR ALL TO authenticated
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Anyone can subscribe
CREATE POLICY "newsletter_insert_public" ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('courses', 'course_modules', 'course_lessons', 'course_enrollments', 'course_reviews', 'newsletter_subscribers')
GROUP BY tablename
ORDER BY tablename;

SELECT 'RLS configured successfully - profiles table excluded from RLS (no recursion)' as status;
