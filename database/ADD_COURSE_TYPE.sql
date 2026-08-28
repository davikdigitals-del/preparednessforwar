-- Add course_type to distinguish standalone courses from episode series
-- Run in Supabase SQL Editor

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS course_type TEXT NOT NULL DEFAULT 'course'
    CHECK (course_type IN ('course', 'episode'));
