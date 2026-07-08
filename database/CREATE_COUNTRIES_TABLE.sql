-- ============================================
-- COUNTRIES TABLE
-- Stores country information with risk levels and descriptions
-- ============================================

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  flag TEXT NOT NULL,
  continent TEXT NOT NULL CHECK (continent IN ('Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica')),
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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on continent for faster filtering
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent);

-- Create index on risk_level for faster filtering
CREATE INDEX IF NOT EXISTS idx_countries_risk_level ON countries(risk_level);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);

-- Enable Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_countries_updated_at();

-- Seed initial countries data from mockData
-- This will be populated via API call from frontend
