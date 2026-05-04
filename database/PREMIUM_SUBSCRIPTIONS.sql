-- ============================================
-- PREMIUM & SUBSCRIPTIONS SETUP
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Add premium flag to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- 2. Add premium flag to media_items
ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- 3. Add premium flag to library_items
ALTER TABLE public.library_items
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- 4. Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  price       numeric(10,2) NOT NULL DEFAULT 0,
  currency    text NOT NULL DEFAULT 'GBP',
  interval    text NOT NULL DEFAULT 'month', -- month | year
  features    text[] DEFAULT '{}',
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 5. User subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id         uuid NOT NULL REFERENCES public.subscription_plans(id),
  status          text NOT NULL DEFAULT 'active', -- active | cancelled | expired | trial
  started_at      timestamptz DEFAULT now(),
  expires_at      timestamptz,
  cancelled_at    timestamptz,
  payment_ref     text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 6. Site settings table (for editing any site text/config)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  value       text,
  label       text,
  group_name  text DEFAULT 'general',
  updated_at  timestamptz DEFAULT now()
);

-- 7. Enable RLS
ALTER TABLE public.subscription_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings         ENABLE ROW LEVEL SECURITY;

-- 8. Policies
CREATE POLICY "Anyone can read plans"
  ON public.subscription_plans FOR SELECT USING (true);

CREATE POLICY "Users can read own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service manages subscriptions"
  ON public.user_subscriptions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Service manages site settings"
  ON public.site_settings FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 9. Default subscription plans
INSERT INTO public.subscription_plans (name, slug, price, currency, interval, features, is_active)
VALUES
  ('Free', 'free', 0, 'GBP', 'month',
   ARRAY['Access to all free articles', 'Just In feed', 'Emergency alerts', 'Basic library access'], true),
  ('Premium Monthly', 'premium-monthly', 9.99, 'GBP', 'month',
   ARRAY['All free features', 'Premium articles & guides', 'Exclusive videos & podcasts', 'Full library access', 'Country-specific content', 'No ads'], true),
  ('Premium Annual', 'premium-annual', 89.99, 'GBP', 'year',
   ARRAY['All Premium Monthly features', '2 months free', 'Priority support', 'Early access to new content'], true)
ON CONFLICT (slug) DO NOTHING;

-- 10. Default site settings
INSERT INTO public.site_settings (key, value, label, group_name) VALUES
  ('site_name',        'Sentinel Network',                    'Site Name',           'branding'),
  ('site_tagline',     'Your preparedness intelligence hub',  'Site Tagline',        'branding'),
  ('site_description', 'Comprehensive preparedness intelligence for NATO nations and beyond.', 'Site Description', 'branding'),
  ('contact_email',    'contact@sentinelnetwork.com',         'Contact Email',       'contact'),
  ('twitter_url',      '',                                    'Twitter / X URL',     'social'),
  ('facebook_url',     '',                                    'Facebook URL',        'social'),
  ('youtube_url',      '',                                    'YouTube URL',         'social'),
  ('footer_text',      'Providing preparedness intelligence to NATO nations and beyond.', 'Footer Text', 'branding'),
  ('premium_headline', 'Unlock Premium Access',               'Premium Headline',    'premium'),
  ('premium_subtext',  'Get unlimited access to all premium articles, exclusive videos, and in-depth guides.', 'Premium Subtext', 'premium'),
  ('about_text',       'Sentinel Network is a comprehensive platform dedicated to empowering individuals, families, and communities across the UK and NATO member countries.', 'About Page Text', 'pages')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- DONE. Premium and subscription tables ready.
-- ============================================
