-- ================================================================
-- FIX categories 409 conflict error — PERMANENT FIX
-- Run in Supabase SQL Editor
-- ================================================================

-- Step 1: Create the categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  section_id  UUID,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Drop ALL existing unique constraints on categories
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'categories' AND con.contype = 'u'
  LOOP
    EXECUTE 'ALTER TABLE categories DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Step 3: Add composite unique — slug+section_id (allows same slug in different sections)
ALTER TABLE categories
  ADD CONSTRAINT categories_slug_section_id_unique
  UNIQUE (slug, section_id);

-- Step 4: Enable RLS with open policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Auth write categories" ON categories;

CREATE POLICY "Public read categories"
  ON categories FOR SELECT TO public USING (true);

CREATE POLICY "Auth write categories"
  ON categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Step 5: Seed all navSections categories so they already exist
-- meaning future inserts will conflict-ignore not error
INSERT INTO categories (title, slug, description, section_id)
VALUES
  -- Emergency News
  ('UK Alerts',                  'uk-alerts',        NULL, NULL),
  ('NATO Updates',               'nato-updates',     NULL, NULL),
  ('Global Situation',           'global-situation', NULL, NULL),
  ('Infrastructure Disruptions', 'infrastructure',   NULL, NULL),
  -- Survival Guides
  ('Emergency Planning',         'emergency-planning',  NULL, NULL),
  ('Evacuation & Shelter',       'evacuation-shelter',  NULL, NULL),
  ('Home Preparation',           'home-preparation',    NULL, NULL),
  ('Urban Survival',             'urban-survival',      NULL, NULL),
  ('Rural Survival',             'rural-survival',      NULL, NULL),
  -- Health & Wellness
  ('Child Safety',               'child-safety',   NULL, NULL),
  ('Adult Health',               'adults',         NULL, NULL),
  ('First Aid',                  'first-aid',      NULL, NULL),
  ('Mental Health',              'mental-health',  NULL, NULL),
  -- Official Directives
  ('UK Ministry of Defence',     'uk-mod',     NULL, NULL),
  ('NATO Civil Preparedness',    'nato-civil', NULL, NULL),
  ('EU Civil Protection',        'eu-civil',   NULL, NULL),
  ('Red Cross Guidance',         'red-cross',  NULL, NULL),
  -- Resources
  ('Checklists',  'checklists',  NULL, NULL),
  ('Templates',   'templates',   NULL, NULL),
  ('Schedules',   'schedules',   NULL, NULL),
  ('Downloads',   'downloads',   NULL, NULL),
  -- Education
  ('Courses',              'courses',   NULL, NULL),
  ('Training Programmes',  'training',  NULL, NULL),
  ('Workshops',            'workshops', NULL, NULL),
  -- Media
  ('Podcasts',      'podcasts',      NULL, NULL),
  ('Videos',        'videos',        NULL, NULL),
  ('Documentaries', 'documentaries', NULL, NULL),
  ('Interviews',    'interviews',    NULL, NULL)
ON CONFLICT (slug, section_id) DO NOTHING;
