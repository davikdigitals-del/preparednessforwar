-- ============================================
-- FIX COURSES TABLE - ADD MISSING COLUMNS AND RLS
-- ============================================

-- Add missing columns to courses table
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'course',
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add check constraint for course_type
ALTER TABLE public.courses 
  DROP CONSTRAINT IF EXISTS courses_course_type_check;

ALTER TABLE public.courses 
  ADD CONSTRAINT courses_course_type_check 
  CHECK (course_type IN ('course', 'workshop', 'masterclass', 'certification'));

-- Update existing records to have default values
UPDATE public.courses 
SET 
  course_type = COALESCE(course_type, 'course'),
  is_premium = COALESCE(is_premium, false)
WHERE course_type IS NULL OR is_premium IS NULL;

-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename='courses' AND schemaname='public'
  LOOP 
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.courses', r.policyname); 
  END LOOP; 
END $$;

-- Create comprehensive RLS policies for courses
-- Public can read published courses
CREATE POLICY "courses_public_read" ON public.courses 
  FOR SELECT TO anon, authenticated 
  USING (is_published = true);

-- Admins can do everything with courses
CREATE POLICY "courses_admin_insert" ON public.courses 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

CREATE POLICY "courses_admin_update" ON public.courses 
  FOR UPDATE TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

CREATE POLICY "courses_admin_delete" ON public.courses 
  FOR DELETE TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

CREATE POLICY "courses_admin_select" ON public.courses 
  FOR SELECT TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_courses_type_premium 
  ON public.courses(course_type, is_premium, is_published);

CREATE INDEX IF NOT EXISTS idx_courses_admin_queries 
  ON public.courses(is_published, created_at DESC);

-- ============================================
-- DONE. Courses table now has all required columns and proper RLS.
-- ============================================

-- Test the setup
SELECT 
  'Courses table' as component,
  COUNT(*)::text as count,
  'columns: ' || string_agg(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'courses'
GROUP BY component;