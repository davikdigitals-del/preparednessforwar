-- ================================================================
-- FIX categories 409 conflict error
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

-- Step 2: Drop any existing unique constraint on slug alone
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_unique;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_section_id_key;

-- Step 3: Add correct composite unique (slug + section_id)
-- so same slug can exist in different sections
ALTER TABLE categories
  ADD CONSTRAINT IF NOT EXISTS categories_slug_section_id_unique
  UNIQUE (slug, section_id);

-- Step 4: Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 5: Policies
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Auth write categories" ON categories;

CREATE POLICY "Public read categories"
  ON categories FOR SELECT TO public USING (true);

CREATE POLICY "Auth write categories"
  ON categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
