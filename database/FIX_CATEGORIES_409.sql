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

-- Step 2: Drop ALL unique constraints on slug (any name)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'categories'
      AND con.contype = 'u'
  LOOP
    EXECUTE 'ALTER TABLE categories DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Step 3: Add correct composite unique (slug + section_id)
ALTER TABLE categories
  ADD CONSTRAINT categories_slug_section_id_unique
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
