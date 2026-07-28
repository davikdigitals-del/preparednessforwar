-- ============================================================================
-- EDUCATION PROGRAMMES TABLE
-- Stores Scouts & Guides and Home Schooling content managed by admin
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.education_programmes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  programme_type text NOT NULL CHECK (programme_type IN ('scouts', 'homeschool')),
  age_group text, -- e.g. "5-7", "8-10", "10-14", "14-18"
  age_label text, -- e.g. "Beavers/Rainbows", "Cubs/Brownies"
  level text DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  badge_name text, -- e.g. "Emergency Response Badge"
  badge_icon text, -- emoji or icon name
  content text, -- rich text / HTML content
  resources jsonb DEFAULT '[]'::jsonb, -- downloadable resources [{title, url}]
  is_published boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL, -- link to existing course
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.education_programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "education_public_read" ON public.education_programmes
  FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "education_admin_all" ON public.education_programmes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Sample data for Scouts & Guides
INSERT INTO public.education_programmes (title, description, programme_type, age_group, age_label, level, badge_name, badge_icon, is_published, sort_order)
VALUES
  ('Stay Safe at Home', 'Learn basic home safety and what to do in an emergency', 'scouts', '4-7', 'Squirrels & Beavers / Rainbows', 'beginner', 'Home Safety Badge', '🏠', true, 1),
  ('Build Your Emergency Kit', 'Discover what goes into a 72-hour emergency kit', 'scouts', '8-10', 'Cubs / Brownies', 'beginner', 'Emergency Kit Badge', '🎒', true, 2),
  ('Navigation & Evacuation', 'Learn to read maps and plan evacuation routes', 'scouts', '10-14', 'Scouts / Guides', 'intermediate', 'Navigator Badge', '🗺️', true, 3),
  ('Field Intelligence & Threat Assessment', 'Understand how to assess threats and communicate in a crisis', 'scouts', '14-17', 'Explorers / Rangers', 'advanced', 'Field Intelligence Badge', '🔍', true, 4);

-- Sample data for Home Schooling
INSERT INTO public.education_programmes (title, description, programme_type, age_group, age_label, level, badge_name, badge_icon, is_published, sort_order)
VALUES
  ('Why We Prepare — KS1', 'Simple introduction to why families prepare for emergencies', 'homeschool', '5-7', 'Key Stage 1', 'beginner', NULL, '📚', true, 1),
  ('Natural Disasters & Emergency Services — KS2', 'Learn about floods, fires and the people who help us', 'homeschool', '7-11', 'Key Stage 2', 'beginner', NULL, '📚', true, 2),
  ('Geopolitics & Civil Defence — KS3', 'Introduction to global security, NATO and civil defence history', 'homeschool', '11-14', 'Key Stage 3', 'intermediate', NULL, '📚', true, 3),
  ('Global Security & Survival Science — KS4', 'Advanced study of threats, first responder skills and resilience', 'homeschool', '14-16', 'Key Stage 4', 'advanced', NULL, '📚', true, 4);
