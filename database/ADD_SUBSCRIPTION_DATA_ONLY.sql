-- ============================================
-- ADD SUBSCRIPTION DATA ONLY
-- Use this if tables already exist
-- ============================================

-- Insert default subscription plans (if they don't exist)
INSERT INTO subscription_plans (name, slug, price, currency, interval, features, is_active)
VALUES
  ('Free', 'free', 0, 'GBP', 'month', 
   ARRAY['Access to all free articles', 'Just In feed', 'Emergency alerts', 'Basic library access'], 
   true),
  ('Premium Monthly', 'premium-monthly', 9.99, 'GBP', 'month', 
   ARRAY['All free features', 'Premium articles & guides', 'Exclusive videos & podcasts', 'Full library access', 'Country-specific content', 'No ads'], 
   true),
  ('Premium Annual', 'premium-annual', 89.99, 'GBP', 'year', 
   ARRAY['All Premium Monthly features', '2 months free', 'Priority support', 'Early access to new content'], 
   true)
ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUBSCRIPTION PLANS ADDED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Default plans are now available.';
  RAISE NOTICE 'Go to /admin/subscriptions to manage them.';
  RAISE NOTICE '========================================';
END $$;
