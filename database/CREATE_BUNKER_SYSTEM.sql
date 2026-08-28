-- ============================================================================
-- MY BUNKER SYSTEM
-- Supply inventory, bug-out plans, saved articles, order queue, readiness score
-- ============================================================================

-- Supply inventory tracker
CREATE TABLE IF NOT EXISTS supply_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('water','food','medical','fuel','documents','weapons','communication','shelter','clothing','other')),
  item_name TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'units', -- litres, days, kg, units, etc.
  target_quantity NUMERIC(10,2),
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug-out plan
CREATE TABLE IF NOT EXISTS bugout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Bug-Out Plan',
  primary_route TEXT,
  secondary_route TEXT,
  rally_point_1 TEXT,
  rally_point_1_coords TEXT,
  rally_point_2 TEXT,
  rally_point_2_coords TEXT,
  destination TEXT,
  destination_coords TEXT,
  vehicle_info TEXT,
  fuel_plan TEXT,
  communication_plan TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved/bookmarked articles
CREATE TABLE IF NOT EXISTS saved_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  post_title TEXT NOT NULL,
  post_url TEXT NOT NULL,
  post_image TEXT,
  post_section TEXT,
  post_excerpt TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Offline order queue (orders placed when offline)
CREATE TABLE IF NOT EXISTS order_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_url TEXT,
  product_image TEXT,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','submitted','failed')),
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- Emergency supplier directory (admin managed, cached offline)
CREATE TABLE IF NOT EXISTS emergency_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'UK',
  coordinates TEXT, -- "lat,lng"
  opening_hours TEXT,
  accepts_cash BOOLEAN DEFAULT TRUE,
  accepts_card BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_supply_inventory_user_id ON supply_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_inventory_category ON supply_inventory(category);
CREATE INDEX IF NOT EXISTS idx_bugout_plans_user_id ON bugout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_order_queue_user_id ON order_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_order_queue_status ON order_queue(status);
CREATE INDEX IF NOT EXISTS idx_emergency_suppliers_category ON emergency_suppliers(category);
CREATE INDEX IF NOT EXISTS idx_emergency_suppliers_is_active ON emergency_suppliers(is_active);

-- RLS
ALTER TABLE supply_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users manage own supply inventory" ON supply_inventory;
DROP POLICY IF EXISTS "Users manage own bugout plan" ON bugout_plans;
DROP POLICY IF EXISTS "Users manage own saved articles" ON saved_articles;
DROP POLICY IF EXISTS "Users manage own order queue" ON order_queue;
DROP POLICY IF EXISTS "Anyone can view suppliers" ON emergency_suppliers;
DROP POLICY IF EXISTS "Admins manage suppliers" ON emergency_suppliers;

-- Policies
CREATE POLICY "Users manage own supply inventory" ON supply_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bugout plan" ON bugout_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved articles" ON saved_articles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own order queue" ON order_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view suppliers" ON emergency_suppliers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage suppliers" ON emergency_suppliers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Triggers
CREATE OR REPLACE FUNCTION update_bugout_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bugout_updated_at ON bugout_plans;
CREATE TRIGGER trg_bugout_updated_at BEFORE UPDATE ON bugout_plans FOR EACH ROW EXECUTE FUNCTION update_bugout_updated_at();

-- Seed emergency suppliers
INSERT INTO emergency_suppliers (name, category, description, phone, address, city, postcode, opening_hours, display_order) VALUES
  ('Survival Supplies UK', 'food-water', 'Emergency food, water purification, and long-term storage supplies', '0800 123 4567', '14 Industrial Estate', 'London', 'EC1A 1BB', 'Mon-Sat 8am-6pm', 1),
  ('MedPrep UK', 'medical', 'Emergency medical kits, first aid supplies, and medications', '0800 234 5678', '22 Station Road', 'Manchester', 'M1 2AB', 'Mon-Fri 9am-5pm', 2),
  ('Bunker Equipment Ltd', 'shelter', 'Shelter equipment, sleeping bags, tents, and protective gear', '0800 345 6789', '8 Commerce Way', 'Birmingham', 'B1 1AA', 'Mon-Sat 8am-8pm', 3),
  ('PowerPrep Solutions', 'power', 'Generators, solar panels, batteries, and fuel storage', '0800 456 7890', '33 Technology Park', 'Leeds', 'LS1 1AB', 'Mon-Fri 8am-6pm', 4),
  ('CommsReady UK', 'communication', 'Radios, satellite phones, and emergency communication equipment', '0800 567 8901', '5 Business Quarter', 'Edinburgh', 'EH1 1AA', 'Mon-Fri 9am-5pm', 5),
  ('DocuSafe Vaults', 'documents', 'Fireproof document storage, waterproof cases, and secure containers', '0800 678 9012', '17 High Street', 'Bristol', 'BS1 1AA', 'Mon-Sat 9am-6pm', 6)
ON CONFLICT DO NOTHING;

GRANT ALL ON supply_inventory TO authenticated;
GRANT ALL ON bugout_plans TO authenticated;
GRANT ALL ON saved_articles TO authenticated;
GRANT ALL ON order_queue TO authenticated;
GRANT ALL ON emergency_suppliers TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
