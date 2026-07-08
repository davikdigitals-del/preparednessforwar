-- ============================================
-- COUNTRIES TABLE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS countries CASCADE;

-- Create countries table
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  flag TEXT NOT NULL,
  continent TEXT NOT NULL CHECK (continent IN ('Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania')),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'moderate', 'high', 'extreme')),
  description TEXT,
  capital TEXT,
  population BIGINT,
  area_km2 BIGINT,
  languages TEXT[],
  currencies TEXT[],
  emergency_numbers JSONB,
  travel_advisory TEXT,
  security_notes TEXT,
  is_spotlight BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_countries_continent ON countries(continent);
CREATE INDEX idx_countries_risk_level ON countries(risk_level);
CREATE INDEX idx_countries_code ON countries(code);

-- Enable Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Countries are viewable by everyone" ON countries;
DROP POLICY IF EXISTS "Admins can insert countries" ON countries;
DROP POLICY IF EXISTS "Admins can update countries" ON countries;
DROP POLICY IF EXISTS "Admins can delete countries" ON countries;

-- Public read access (everyone can view countries)
CREATE POLICY "Countries are viewable by everyone"
  ON countries
  FOR SELECT
  USING (true);

-- Admin write access (only admins can insert, update, delete)
CREATE POLICY "Admins can insert countries"
  ON countries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update countries"
  ON countries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete countries"
  ON countries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_countries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS countries_updated_at ON countries;

CREATE TRIGGER countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_countries_updated_at();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Countries table created successfully! Now you can use the "Sync All Countries" button in Admin Countries page.';
END $$;

-- ============================================
-- MIGRATION: Add is_spotlight column
-- Run this if the countries table already exists
-- ============================================
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN DEFAULT FALSE;

-- Ensure only one spotlight at a time (optional constraint via partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_countries_single_spotlight
  ON countries (is_spotlight)
  WHERE is_spotlight = TRUE;
