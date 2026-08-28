-- Run this in Supabase SQL Editor to fully set up the countries table

-- Step 1: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS countries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  flag text,
  continent text,
  risk_level text DEFAULT 'low',
  description text,
  capital text,
  population bigint,
  travel_advisory text,
  security_notes text,
  is_active boolean DEFAULT true,
  is_spotlight boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Add missing columns if table already exists
ALTER TABLE countries ADD COLUMN IF NOT EXISTS flag text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS continent text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'low';
ALTER TABLE countries ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS capital text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS population bigint;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS travel_advisory text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS security_notes text;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_spotlight boolean DEFAULT false;

-- Step 3: Enable RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop old policies if they exist
DROP POLICY IF EXISTS "Countries are publicly readable" ON countries;
DROP POLICY IF EXISTS "Admins can manage countries" ON countries;
DROP POLICY IF EXISTS "Allow public read" ON countries;
DROP POLICY IF EXISTS "Allow admin write" ON countries;

-- Step 5: Create proper RLS policies
-- Anyone can read countries
CREATE POLICY "Countries are publicly readable"
ON countries FOR SELECT
TO public
USING (true);

-- Authenticated users with admin role can insert/update/delete
CREATE POLICY "Admins can manage countries"
ON countries FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Step 6: Insert all 35 countries
INSERT INTO countries (code, name, flag, continent, risk_level, is_active) VALUES
  ('AL', 'Albania',         '🇦🇱', 'Europe',        'low', true),
  ('BE', 'Belgium',         '🇧🇪', 'Europe',        'low', true),
  ('BG', 'Bulgaria',        '🇧🇬', 'Europe',        'low', true),
  ('CA', 'Canada',          '🇨🇦', 'North America', 'low', true),
  ('HR', 'Croatia',         '🇭🇷', 'Europe',        'low', true),
  ('CZ', 'Czech Republic',  '🇨🇿', 'Europe',        'low', true),
  ('DK', 'Denmark',         '🇩🇰', 'Europe',        'low', true),
  ('EE', 'Estonia',         '🇪🇪', 'Europe',        'low', true),
  ('FI', 'Finland',         '🇫🇮', 'Europe',        'low', true),
  ('FR', 'France',          '🇫🇷', 'Europe',        'low', true),
  ('DE', 'Germany',         '🇩🇪', 'Europe',        'low', true),
  ('GR', 'Greece',          '🇬🇷', 'Europe',        'low', true),
  ('HU', 'Hungary',         '🇭🇺', 'Europe',        'low', true),
  ('IS', 'Iceland',         '🇮🇸', 'Europe',        'low', true),
  ('IT', 'Italy',           '🇮🇹', 'Europe',        'low', true),
  ('LV', 'Latvia',          '🇱🇻', 'Europe',        'low', true),
  ('LT', 'Lithuania',       '🇱🇹', 'Europe',        'low', true),
  ('LU', 'Luxembourg',      '🇱🇺', 'Europe',        'low', true),
  ('ME', 'Montenegro',      '🇲🇪', 'Europe',        'low', true),
  ('NL', 'Netherlands',     '🇳🇱', 'Europe',        'low', true),
  ('MK', 'North Macedonia', '🇲🇰', 'Europe',        'low', true),
  ('NO', 'Norway',          '🇳🇴', 'Europe',        'low', true),
  ('PL', 'Poland',          '🇵🇱', 'Europe',        'low', true),
  ('PT', 'Portugal',        '🇵🇹', 'Europe',        'low', true),
  ('RO', 'Romania',         '🇷🇴', 'Europe',        'low', true),
  ('SK', 'Slovakia',        '🇸🇰', 'Europe',        'low', true),
  ('SI', 'Slovenia',        '🇸🇮', 'Europe',        'low', true),
  ('ES', 'Spain',           '🇪🇸', 'Europe',        'low', true),
  ('SE', 'Sweden',          '🇸🇪', 'Europe',        'low', true),
  ('TR', 'Türkiye',         '🇹🇷', 'Europe',        'low', true),
  ('GB', 'United Kingdom',  '🇬🇧', 'Europe',        'low', true),
  ('US', 'United States',   '🇺🇸', 'North America', 'low', true),
  ('IE', 'Ireland',         '🇮🇪', 'Europe',        'low', true),
  ('AU', 'Australia',       '🇦🇺', 'Oceania',       'low', true),
  ('CH', 'Switzerland',     '🇨🇭', 'Europe',        'low', true)
ON CONFLICT (code) DO UPDATE SET
  name      = EXCLUDED.name,
  flag      = EXCLUDED.flag,
  continent = EXCLUDED.continent,
  is_active = EXCLUDED.is_active;

-- Done!
SELECT 'Countries table set up with ' || COUNT(*) || ' countries' AS result FROM countries;
