-- ============================================================================
-- ADS & SPONSORSHIP SYSTEM
-- Run this in Supabase SQL Editor
-- Safe to re-run — uses DROP IF EXISTS before creating policies
-- ============================================================================

-- ── TABLES ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  dimensions TEXT,
  location TEXT NOT NULL,
  price_per_week NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_per_month NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  max_file_size_mb INTEGER DEFAULT 2,
  allowed_formats TEXT DEFAULT 'JPG, PNG, GIF',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  notes TEXT,
  placement_id UUID REFERENCES ad_placements(id),
  placement_name TEXT NOT NULL,
  placement_location TEXT NOT NULL,
  duration_type TEXT NOT NULL CHECK (duration_type IN ('week', 'month')),
  duration_value INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsorship_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  company_description TEXT,
  sponsorship_type TEXT NOT NULL CHECK (sponsorship_type IN (
    'content_sponsorship', 'section_sponsorship',
    'newsletter_sponsorship', 'podcast_sponsorship',
    'event_sponsorship', 'general'
  )),
  target_audience TEXT,
  message TEXT NOT NULL,
  preferred_start_date DATE,
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'negotiating', 'agreed', 'rejected', 'closed'
  )),
  admin_notes TEXT,
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ad_purchases_user_id ON ad_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_purchases_is_active ON ad_purchases(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_purchases_placement_id ON ad_purchases(placement_id);
CREATE INDEX IF NOT EXISTS idx_ad_purchases_start_date ON ad_purchases(start_date);
CREATE INDEX IF NOT EXISTS idx_ad_purchases_end_date ON ad_purchases(end_date);
CREATE INDEX IF NOT EXISTS idx_sponsorship_inquiries_status ON sponsorship_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_inquiries_user_id ON sponsorship_inquiries(user_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe re-run)
DROP POLICY IF EXISTS "Anyone can view active placements" ON ad_placements;
DROP POLICY IF EXISTS "Admins manage placements" ON ad_placements;
DROP POLICY IF EXISTS "Users see own purchases" ON ad_purchases;
DROP POLICY IF EXISTS "Users create purchases" ON ad_purchases;
DROP POLICY IF EXISTS "Users update own pending" ON ad_purchases;
DROP POLICY IF EXISTS "Admins manage all purchases" ON ad_purchases;
DROP POLICY IF EXISTS "Public view active ads" ON ad_purchases;
DROP POLICY IF EXISTS "Users see own inquiries" ON sponsorship_inquiries;
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON sponsorship_inquiries;
DROP POLICY IF EXISTS "Admins manage all inquiries" ON sponsorship_inquiries;

-- ad_placements policies
CREATE POLICY "Anyone can view active placements" ON ad_placements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage placements" ON ad_placements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ad_purchases policies
CREATE POLICY "Users see own purchases" ON ad_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create purchases" ON ad_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pending" ON ad_purchases
  FOR UPDATE USING (auth.uid() = user_id AND payment_status = 'pending');

CREATE POLICY "Admins manage all purchases" ON ad_purchases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Public view active ads" ON ad_purchases
  FOR SELECT USING (is_active = true AND payment_status = 'paid');

-- sponsorship_inquiries policies
CREATE POLICY "Users see own inquiries" ON sponsorship_inquiries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit inquiry" ON sponsorship_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage all inquiries" ON sponsorship_inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── TRIGGERS ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ad_purchases_updated_at ON ad_purchases;
CREATE TRIGGER trg_ad_purchases_updated_at
  BEFORE UPDATE ON ad_purchases FOR EACH ROW
  EXECUTE FUNCTION update_ads_updated_at();

DROP TRIGGER IF EXISTS trg_sponsorship_inquiries_updated_at ON sponsorship_inquiries;
CREATE TRIGGER trg_sponsorship_inquiries_updated_at
  BEFORE UPDATE ON sponsorship_inquiries FOR EACH ROW
  EXECUTE FUNCTION update_ads_updated_at();

-- ── RPC TRACKING FUNCTIONS ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_ad_impression(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ad_purchases
  SET impression_count = impression_count + 1
  WHERE id = ad_id AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_ad_click(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ad_purchases
  SET click_count = click_count + 1
  WHERE id = ad_id AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_ad_impression(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_ad_click(UUID) TO anon, authenticated;

-- ── SEED AD PLACEMENTS ────────────────────────────────────────────────────────

INSERT INTO ad_placements (name, slug, description, dimensions, location, price_per_week, price_per_month, display_order) VALUES
  ('Homepage Sidebar',      'homepage-sidebar',   'Sidebar ad shown on the homepage',            '300x250px', 'homepage',   25.00,  80.00, 1),
  ('Article Top Banner',    'article-top-banner', 'Banner at the top of all article pages',      '728x90px',  'article',    30.00, 100.00, 2),
  ('Article Sidebar',       'article-sidebar',    'Sidebar ad on article pages',                 '300x250px', 'article',    20.00,  70.00, 3),
  ('In-Article Mid Banner', 'article-mid-banner', 'Banner in the middle of article content',     '600x150px', 'article',    25.00,  85.00, 4),
  ('Member Dashboard',      'member-dashboard',   'Banner shown in the member portal dashboard', '600x150px', 'dashboard',  30.00, 100.00, 5),
  ('Newsletter Slot',       'newsletter-slot',    'Ad included in the weekly newsletter email',  '600x200px', 'newsletter', 50.00, 175.00, 6)
ON CONFLICT (slug) DO NOTHING;

-- ── PERMISSIONS ───────────────────────────────────────────────────────────────

GRANT ALL ON ad_placements TO authenticated;
GRANT ALL ON ad_purchases TO authenticated;
GRANT ALL ON sponsorship_inquiries TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
