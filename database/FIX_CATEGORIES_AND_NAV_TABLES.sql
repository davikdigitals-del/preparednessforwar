-- ================================================================
-- FIX: Create categories, sections, nav_sections, nav_categories,
--      nav_tools tables and seed from navSections data
-- Run this in Supabase SQL Editor to fix the 409 errors
-- ================================================================

-- First, add updated_at column to existing tables if they don't have it
ALTER TABLE IF EXISTS sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS nav_sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS nav_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS nav_tools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraints if they don't exist (needed for ON CONFLICT)
DO $$ 
BEGIN
  -- nav_categories unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'nav_categories_slug_section_id_key'
  ) THEN
    ALTER TABLE nav_categories ADD CONSTRAINT nav_categories_slug_section_id_key UNIQUE (slug, section_id);
  END IF;
  
  -- nav_tools unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'nav_tools_slug_section_id_key'
  ) THEN
    ALTER TABLE nav_tools ADD CONSTRAINT nav_tools_slug_section_id_key UNIQUE (slug, section_id);
  END IF;
  
  -- categories unique constraint (if it has section_id)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'section_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'categories_slug_section_id_key'
    ) THEN
      ALTER TABLE categories ADD CONSTRAINT categories_slug_section_id_key UNIQUE (slug, section_id);
    END IF;
  END IF;
END $$;

-- 1. sections table (used by AdminCategories)
CREATE TABLE IF NOT EXISTS sections (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug  TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT 'bg-primary',
  sort_order INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. categories table (used by AdminCategories & AdminPosts old code)
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  section_id  UUID REFERENCES sections(id) ON DELETE SET NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slug, section_id)
);

-- 3. nav_sections table (used by useNavSections hook)
CREATE TABLE IF NOT EXISTS nav_sections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  color      TEXT DEFAULT 'category-emergency',
  sort_order INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. nav_categories table (used by useNavSections hook)
CREATE TABLE IF NOT EXISTS nav_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL,
  section_id UUID REFERENCES nav_sections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slug, section_id)
);

-- 5. nav_tools table (used by useNavSections hook)
CREATE TABLE IF NOT EXISTS nav_tools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL,
  section_id UUID REFERENCES nav_sections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slug, section_id)
);

-- ================================================================
-- SEED nav_sections from navSections in mockData
-- ================================================================
INSERT INTO nav_sections (title, slug, color, sort_order, is_active) VALUES
  ('Emergency News',  'emergency-news',  'category-emergency',  1, true),
  ('Survival Guides', 'survival-guides', 'category-survival',   2, true),
  ('Health & Wellness','health',         'category-health',     3, true),
  ('Official Directives','directives',   'category-directives', 4, true),
  ('Resources',       'resources',       'category-resources',  5, true),
  ('Education',       'education',       'category-education',  6, true),
  ('Podcast & Video', 'media',           'category-resources',  7, true)
ON CONFLICT (slug) DO UPDATE SET
  title      = EXCLUDED.title,
  color      = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_active  = EXCLUDED.is_active;

-- Also seed the sections table (used by AdminCategories)
-- Note: sections table uses display_order, not sort_order
INSERT INTO sections (title, slug, description, display_order, is_active)
SELECT 
  title, 
  slug, 
  '' as description,
  sort_order as display_order, 
  is_active 
FROM nav_sections
ON CONFLICT (slug) DO UPDATE SET
  title         = EXCLUDED.title,
  display_order = EXCLUDED.display_order,
  is_active     = EXCLUDED.is_active;

-- ================================================================
-- SEED nav_categories
-- ================================================================
DO $$
DECLARE
  sec_id UUID;
BEGIN
  -- Emergency News categories
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'emergency-news';
  INSERT INTO nav_categories (title, slug, section_id, sort_order) VALUES
    ('UK Alerts',                  'uk-alerts',       sec_id, 1),
    ('NATO Updates',               'nato-updates',    sec_id, 2),
    ('Global Situation',           'global-situation',sec_id, 3),
    ('Infrastructure Disruptions', 'infrastructure',  sec_id, 4)
  ON CONFLICT (slug, section_id) DO NOTHING;

  -- Survival Guides
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'survival-guides';
  INSERT INTO nav_categories (title, slug, section_id, sort_order) VALUES
    ('Emergency Planning',    'emergency-planning',  sec_id, 1),
    ('Evacuation & Shelter',  'evacuation-shelter',  sec_id, 2),
    ('Home Preparation',      'home-preparation',    sec_id, 3),
    ('Urban Survival',        'urban-survival',      sec_id, 4),
    ('Rural Survival',        'rural-survival',      sec_id, 5)
  ON CONFLICT (slug, section_id) DO NOTHING;

  -- Health & Wellness
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'health';
  INSERT INTO nav_categories (title, slug, section_id, sort_order) VALUES
    ('Child Safety',  'child-safety',  sec_id, 1),
    ('Adult Health',  'adults',        sec_id, 2),
    ('First Aid',     'first-aid',     sec_id, 3),
    ('Mental Health', 'mental-health', sec_id, 4)
  ON CONFLICT (slug, section_id) DO NOTHING;

  -- Official Directives
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'directives';
  INSERT INTO nav_categories (title, slug, section_id, sort_order) VALUES
    ('UK Ministry of Defence',   'uk-mod',    sec_id, 1),
    ('NATO Civil Preparedness',  'nato-civil',sec_id, 2),
    ('EU Civil Protection',      'eu-civil',  sec_id, 3),
    ('Red Cross Guidance',       'red-cross', sec_id, 4)
  ON CONFLICT (slug, section_id) DO NOTHING;

  -- Resources
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'resources';
  INSERT INTO nav_categories (title, slug, section_id, sort_order) VALUES
    ('Checklists',  'checklists',  sec_id, 1),
    ('Templates',   'templates',   sec_id, 2),
    ('Schedules',   'schedules',   sec_id, 3),
    ('Downloads',   'downloads',   sec_id, 4)
  ON CONFLICT (slug, section_id) DO NOTHING;

  -- Education
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'education';
  INSERT INTO nav_categories (title, slug, section_id, sort_order) VALUES
    ('Courses',             'courses',   sec_id, 1),
    ('Training Programmes', 'training',  sec_id, 2),
    ('Workshops',           'workshops', sec_id, 3)
  ON CONFLICT (slug, section_id) DO NOTHING;

  -- Podcast & Video
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'media';
  INSERT INTO nav_categories (title, slug, section_id, sort_order) VALUES
    ('Podcasts',       'podcasts',      sec_id, 1),
    ('Videos',         'videos',        sec_id, 2),
    ('Documentaries',  'documentaries', sec_id, 3),
    ('Interviews',     'interviews',    sec_id, 4)
  ON CONFLICT (slug, section_id) DO NOTHING;
END $$;

-- Also seed the categories table from nav_categories
-- Note: categories table uses display_order, not sort_order and doesn't have section_id reference
INSERT INTO categories (name, title, slug, description)
SELECT
  nc.title as name,
  nc.title,
  nc.slug,
  '' as description
FROM nav_categories nc
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title;

-- ================================================================
-- SEED nav_tools
-- ================================================================
DO $$
DECLARE
  sec_id UUID;
BEGIN
  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'emergency-news';
  INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
    ('Breaking News', 'breaking', sec_id, 1),
    ('Live Updates',  'live',     sec_id, 2)
  ON CONFLICT (slug, section_id) DO NOTHING;

  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'survival-guides';
  INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
    ('72-Hour Kit Builder',  'kit-builder',        sec_id, 1),
    ('Evacuation Planner',   'evacuation-planner', sec_id, 2)
  ON CONFLICT (slug, section_id) DO NOTHING;

  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'health';
  INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
    ('Vaccination Tracker', 'vaccination-tracker', sec_id, 1),
    ('First Aid Guide',     'first-aid-guide',     sec_id, 2)
  ON CONFLICT (slug, section_id) DO NOTHING;

  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'resources';
  INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
    ('All Downloads',    'all-downloads',   sec_id, 1),
    ('Printable Packs',  'printable-packs', sec_id, 2)
  ON CONFLICT (slug, section_id) DO NOTHING;

  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'education';
  INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
    ('Browse All Courses', 'all-courses', sec_id, 1),
    ('My Learning',        'my-courses',  sec_id, 2)
  ON CONFLICT (slug, section_id) DO NOTHING;

  SELECT id INTO sec_id FROM nav_sections WHERE slug = 'media';
  INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
    ('Media Hub',       'media-hub', sec_id, 1),
    ('Latest Episodes', 'latest',    sec_id, 2)
  ON CONFLICT (slug, section_id) DO NOTHING;
END $$;

-- Enable RLS
ALTER TABLE nav_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_tools      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read nav_sections" ON nav_sections;
DROP POLICY IF EXISTS "Public read nav_categories" ON nav_categories;
DROP POLICY IF EXISTS "Public read nav_tools" ON nav_tools;
DROP POLICY IF EXISTS "Public read sections" ON sections;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Auth write categories" ON categories;
DROP POLICY IF EXISTS "Auth write sections" ON sections;
DROP POLICY IF EXISTS "Auth write nav_sections" ON nav_sections;
DROP POLICY IF EXISTS "Auth write nav_categories" ON nav_categories;
DROP POLICY IF EXISTS "Auth write nav_tools" ON nav_tools;

-- Public read (needed for useNavSections hook and AdminPosts)
CREATE POLICY "Public read nav_sections" ON nav_sections FOR SELECT TO public USING (true);
CREATE POLICY "Public read nav_categories" ON nav_categories FOR SELECT TO public USING (true);
CREATE POLICY "Public read nav_tools" ON nav_tools FOR SELECT TO public USING (true);
CREATE POLICY "Public read sections" ON sections FOR SELECT TO public USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT TO public USING (true);

-- Authenticated write (admin)
CREATE POLICY "Auth write categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write sections" ON sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write nav_sections" ON nav_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write nav_categories" ON nav_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write nav_tools" ON nav_tools FOR ALL TO authenticated USING (true) WITH CHECK (true);
