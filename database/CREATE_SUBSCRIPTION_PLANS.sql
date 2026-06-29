-- ============================================================================
-- CREATE SUBSCRIPTION PLANS
-- ============================================================================
-- Run this in Supabase SQL Editor to create subscription plans
-- ============================================================================

-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT NOT NULL, -- 'month' or 'year'
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Delete existing plans (if any) to avoid duplicates
DELETE FROM subscription_plans;

-- Insert subscription plans
INSERT INTO subscription_plans (id, name, slug, price, currency, interval, features, is_active)
VALUES 
  -- Monthly Plan
  (
    '5a5dfb1a-674e-45cc-9f5a-3a029fa2469b',
    'Monthly Premium',
    'monthly-premium',
    9.99,
    'USD',
    'month',
    ARRAY['Unlimited access to premium articles', 'Ad-free experience', 'Early access to new content', 'Member-only discussions', 'Priority support'],
    true
  ),
  -- Annual Plan
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Annual Premium',
    'annual-premium',
    95.99,
    'USD',
    'year',
    ARRAY['Unlimited access to premium articles', 'Ad-free experience', 'Early access to new content', 'Member-only discussions', 'Priority support', '20% discount (save $24/year)'],
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;

-- Allow everyone to read active plans
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage subscriptions (for webhook)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (true);

-- Grant permissions
GRANT SELECT ON subscription_plans TO anon, authenticated;
GRANT SELECT ON user_subscriptions TO authenticated;
GRANT ALL ON user_subscriptions TO service_role;

-- Verify the plans were created
SELECT 
  id,
  name,
  price,
  currency,
  interval,
  is_active
FROM subscription_plans
ORDER BY price;

-- ============================================================================
-- EXPECTED RESULT:
-- ============================================================================
-- You should see 2 plans:
-- 1. Monthly Premium - $9.99/month
-- 2. Annual Premium - $95.99/year
-- ============================================================================

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now the Edge Function will be able to find the plans
-- Try subscribing again - the 400 error should be gone
-- ============================================================================
