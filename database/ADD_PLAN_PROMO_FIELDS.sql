-- Add promo fields to subscription_plans table
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS promo_text text,
ADD COLUMN IF NOT EXISTS promo_ends_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS promo_discount_pct integer,
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false;

-- Example: Set a promo on a plan
-- UPDATE subscription_plans SET promo_text = 'Summer Sale', promo_ends_at = '2026-07-27', promo_discount_pct = 55, is_popular = true WHERE slug = 'premium-monthly';
