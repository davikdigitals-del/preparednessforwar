-- Add missing columns to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS failed_payment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Index for fast stripe subscription lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id 
ON public.user_subscriptions(stripe_subscription_id);

-- RLS for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='user_subscriptions' AND schemaname='public'
LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_subscriptions',r.policyname); END LOOP; END $$;

CREATE POLICY "user_subscriptions_read_own" ON public.user_subscriptions 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_admin_all" ON public.user_subscriptions 
  FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
