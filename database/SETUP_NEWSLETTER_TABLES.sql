-- Run in Supabase SQL Editor to set up newsletter tables

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  preferences jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add is_active column if it doesn't exist
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Newsletter sends log
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  sent_by uuid REFERENCES auth.users(id),
  sent_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their own email)
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
ON newsletter_subscribers FOR INSERT TO public
WITH CHECK (true);

-- Admins can read/manage all subscribers
DROP POLICY IF EXISTS "Admins manage subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins manage subscribers"
ON newsletter_subscribers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admins manage sends log
DROP POLICY IF EXISTS "Admins manage sends" ON newsletter_sends;
CREATE POLICY "Admins manage sends"
ON newsletter_sends FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

SELECT 'Newsletter tables ready!' AS result;
