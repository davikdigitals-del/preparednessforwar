-- Fix missing RLS policies for courses table
-- Run this in Supabase SQL Editor if courses table policies are missing

-- Enable RLS on courses table (if not already enabled)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (ignore errors if they don't)
DROP POLICY IF EXISTS "courses_admin_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_update" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_delete" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_select" ON public.courses;
DROP POLICY IF EXISTS "courses_public_select" ON public.courses;

-- Allow admins to INSERT courses
CREATE POLICY "courses_admin_insert" ON public.courses 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

-- Allow admins to UPDATE courses
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

-- Allow admins to DELETE courses
CREATE POLICY "courses_admin_delete" ON public.courses 
  FOR DELETE TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

-- Allow anyone to SELECT published courses
CREATE POLICY "courses_public_select" ON public.courses 
  FOR SELECT 
  USING (is_published = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ));

-- Allow admins to SELECT all courses (including unpublished)
CREATE POLICY "courses_admin_select" ON public.courses 
  FOR SELECT TO authenticated 
  USING (EXISTS(
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

-- Verify policies were created
SELECT 
  'Policy Details' as section,
  policyname as name,
  qual as condition
FROM pg_policies
WHERE tablename = 'courses'
ORDER BY policyname;
