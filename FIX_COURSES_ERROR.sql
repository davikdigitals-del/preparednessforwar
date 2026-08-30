-- Fix courses table 400 Bad Request error
-- This ensures the table has the correct structure and permissions

-- Add missing columns to courses table if they don't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'course' CHECK (course_type IN ('course', 'episode'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Ensure all expected columns exist with correct types
DO $$
BEGIN
    -- Check and add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'course_type') THEN
        ALTER TABLE courses ADD COLUMN course_type TEXT DEFAULT 'course' CHECK (course_type IN ('course', 'episode'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_premium') THEN
        ALTER TABLE courses ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Clear any problematic RLS policies
DROP POLICY IF EXISTS "courses_columns_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_columns" ON courses;
DROP POLICY IF EXISTS "courses_select_columns" ON courses;

-- Ensure simple, working RLS policies
DO $$ 
DECLARE r RECORD;
BEGIN 
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename='courses' AND schemaname='public'
  LOOP 
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.courses', r.policyname); 
  END LOOP; 
END $$;

-- Create clean RLS policies
CREATE POLICY "courses_public_select" ON courses 
  FOR SELECT USING (true);

CREATE POLICY "courses_admin_all" ON courses 
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Grant necessary permissions
GRANT SELECT ON courses TO anon;
GRANT ALL ON courses TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Update the table to ensure it has all needed columns with defaults
UPDATE courses SET 
  course_type = COALESCE(course_type, 'course'),
  is_premium = COALESCE(is_premium, false)
WHERE course_type IS NULL OR is_premium IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(course_type);
CREATE INDEX IF NOT EXISTS idx_courses_premium ON courses(is_premium) WHERE is_premium = true;