-- ============================================
-- SUBSCRIPTION RENEWAL AUTOMATION SETUP
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Add renewal tracking columns to user_subscriptions
ALTER TABLE public.user_subscriptions 
  ADD COLUMN IF NOT EXISTS auto_renew boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS renewal_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_renewal_attempt timestamptz,
  ADD COLUMN IF NOT EXISTS next_billing_date timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS email_reminders_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_reminder_sent timestamptz;

-- 2. Create subscription renewal log table
CREATE TABLE IF NOT EXISTS public.subscription_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  renewal_date timestamptz NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'GBP',
  status text NOT NULL DEFAULT 'pending', -- pending | successful | failed | cancelled | reminder_expires_in_7_days | reminder_expires_in_3_days | reminder_expires_tomorrow | notification_success | notification_failure
  payment_intent_id text,
  stripe_charge_id text,
  failure_reason text,
  email_sent boolean DEFAULT false,
  email_type text, -- reminder_7d | reminder_3d | reminder_1d | success | failure
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- 3. Create email preferences table
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  renewal_reminders boolean DEFAULT true,
  payment_confirmations boolean DEFAULT true,
  payment_failures boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. Create index for efficient renewal queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date 
  ON public.user_subscriptions(next_billing_date, status) 
  WHERE status = 'active' AND auto_renew = true;

CREATE INDEX IF NOT EXISTS idx_renewal_logs_date 
  ON public.subscription_renewals(renewal_date, status);

CREATE INDEX IF NOT EXISTS idx_email_reminders
  ON public.user_subscriptions(expires_at, email_reminders_enabled, status)
  WHERE status = 'active' AND email_reminders_enabled = true;

-- 5. Function to calculate next billing date
CREATE OR REPLACE FUNCTION calculate_next_billing_date(
  current_expires_at timestamptz,
  interval_type text
) RETURNS timestamptz AS $$
BEGIN
  CASE interval_type
    WHEN 'month' THEN
      RETURN current_expires_at + INTERVAL '1 month';
    WHEN 'year' THEN
      RETURN current_expires_at + INTERVAL '1 year';
    ELSE
      RETURN current_expires_at + INTERVAL '1 month';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to update subscription billing dates
CREATE OR REPLACE FUNCTION update_subscription_billing_dates()
RETURNS void AS $$
BEGIN
  -- Update next_billing_date for all active subscriptions that don't have it set
  UPDATE public.user_subscriptions 
  SET next_billing_date = calculate_next_billing_date(expires_at, (
    SELECT sp.interval 
    FROM public.subscription_plans sp 
    WHERE sp.id = user_subscriptions.plan_id
  ))
  WHERE status = 'active' 
    AND next_billing_date IS NULL 
    AND expires_at IS NOT NULL;
    
  RAISE NOTICE 'Updated billing dates for active subscriptions';
END;
$$ LANGUAGE plpgsql;

-- 7. Function to create default email preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default email preferences
DROP TRIGGER IF EXISTS trigger_create_email_preferences ON auth.users;
CREATE TRIGGER trigger_create_email_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_email_preferences();

-- 8. Trigger to automatically set next_billing_date when subscription is created/updated
CREATE OR REPLACE FUNCTION set_next_billing_date_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if expires_at changed and status is active
  IF (TG_OP = 'INSERT' OR NEW.expires_at != OLD.expires_at) AND NEW.status = 'active' THEN
    NEW.next_billing_date := calculate_next_billing_date(
      NEW.expires_at,
      (SELECT interval FROM public.subscription_plans WHERE id = NEW.plan_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_next_billing_date ON public.user_subscriptions;
CREATE TRIGGER trigger_set_next_billing_date
  BEFORE INSERT OR UPDATE OF expires_at, status ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_next_billing_date_trigger();

-- 9. Enable RLS on new tables
ALTER TABLE public.subscription_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- 10. Policies for renewal logs
CREATE POLICY "Users can read own renewal logs"
  ON public.subscription_renewals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service manages renewal logs"
  ON public.subscription_renewals FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 11. Policies for email preferences
CREATE POLICY "Users can manage own email preferences"
  ON public.email_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service can read email preferences"
  ON public.email_preferences FOR SELECT
  TO service_role USING (true);

-- 12. Run initial billing date update
SELECT update_subscription_billing_dates();

-- 13. Create view for upcoming renewals (next 7 days)
CREATE OR REPLACE VIEW upcoming_renewals AS
SELECT 
  us.id,
  us.user_id,
  us.plan_id,
  us.status,
  us.expires_at,
  us.next_billing_date,
  us.auto_renew,
  us.renewal_attempts,
  us.email_reminders_enabled,
  us.last_reminder_sent,
  sp.name as plan_name,
  sp.price,
  sp.currency,
  sp.interval,
  p.email as user_email,
  p.name as user_name,
  ep.renewal_reminders,
  ep.payment_confirmations,
  ep.payment_failures
FROM public.user_subscriptions us
JOIN public.subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN public.profiles p ON us.user_id = p.id
LEFT JOIN public.email_preferences ep ON us.user_id = ep.user_id
WHERE us.status = 'active'
  AND us.auto_renew = true
  AND us.next_billing_date <= (CURRENT_DATE + INTERVAL '7 days')
  AND us.next_billing_date >= CURRENT_DATE
ORDER BY us.next_billing_date ASC;

-- 14. Create view for subscriptions needing email reminders
CREATE OR REPLACE VIEW subscriptions_needing_reminders AS
SELECT 
  us.id,
  us.user_id,
  us.plan_id,
  us.status,
  us.expires_at,
  us.last_reminder_sent,
  sp.name as plan_name,
  sp.price,
  sp.currency,
  sp.interval,
  p.email as user_email,
  p.name as user_name,
  EXTRACT(DAYS FROM (us.expires_at - CURRENT_TIMESTAMP)) as days_until_expiry
FROM public.user_subscriptions us
JOIN public.subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN public.profiles p ON us.user_id = p.id
LEFT JOIN public.email_preferences ep ON us.user_id = ep.user_id
WHERE us.status = 'active'
  AND us.auto_renew = true
  AND us.email_reminders_enabled = true
  AND COALESCE(ep.renewal_reminders, true) = true
  AND us.expires_at > CURRENT_TIMESTAMP
  AND us.expires_at <= (CURRENT_TIMESTAMP + INTERVAL '7 days')
  AND (
    us.last_reminder_sent IS NULL 
    OR us.last_reminder_sent < (CURRENT_TIMESTAMP - INTERVAL '24 hours')
  )
ORDER BY us.expires_at ASC;

-- 15. Create function to get subscription renewal statistics
CREATE OR REPLACE FUNCTION get_renewal_stats(days_back integer DEFAULT 30)
RETURNS TABLE(
  total_renewals bigint,
  successful_renewals bigint,
  failed_renewals bigint,
  success_rate numeric,
  total_revenue numeric,
  emails_sent bigint,
  reminders_sent bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE sr.status IN ('successful', 'failed')) as total_renewals,
    COUNT(*) FILTER (WHERE sr.status = 'successful') as successful_renewals,
    COUNT(*) FILTER (WHERE sr.status = 'failed') as failed_renewals,
    ROUND(
      (COUNT(*) FILTER (WHERE sr.status = 'successful')::numeric / 
       NULLIF(COUNT(*) FILTER (WHERE sr.status IN ('successful', 'failed')), 0)::numeric) * 100, 2
    ) as success_rate,
    COALESCE(SUM(sr.amount) FILTER (WHERE sr.status = 'successful'), 0) as total_revenue,
    COUNT(*) FILTER (WHERE sr.email_sent = true) as emails_sent,
    COUNT(*) FILTER (WHERE sr.status LIKE 'reminder_%') as reminders_sent
  FROM public.subscription_renewals sr
  WHERE sr.renewal_date >= (CURRENT_DATE - INTERVAL '1 day' * days_back);
END;
$$ LANGUAGE plpgsql;

-- 16. Function to schedule email reminders (called by cron)
CREATE OR REPLACE FUNCTION schedule_renewal_reminders()
RETURNS TABLE(
  reminders_needed bigint,
  reminder_details jsonb
) AS $$
DECLARE
  reminder_count bigint;
  details jsonb;
BEGIN
  -- Count subscriptions needing reminders
  SELECT COUNT(*) INTO reminder_count
  FROM subscriptions_needing_reminders;
  
  -- Get details for logging
  SELECT jsonb_agg(
    jsonb_build_object(
      'subscription_id', id,
      'user_email', user_email,
      'plan_name', plan_name,
      'days_until_expiry', days_until_expiry,
      'expires_at', expires_at
    )
  ) INTO details
  FROM subscriptions_needing_reminders;
  
  RETURN QUERY SELECT reminder_count, COALESCE(details, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CRON JOB SETUP EXAMPLES
-- ============================================

-- Example 1: Daily renewal processing at 2 AM UTC
/*
SELECT cron.schedule(
  'process-renewals',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-subscription-renewals',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
*/

-- Example 2: Email reminders twice daily at 9 AM and 6 PM UTC  
/*
SELECT cron.schedule(
  'send-renewal-reminders',
  '0 9,18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-renewal-reminders',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
*/

-- ============================================
-- DONE. Enhanced subscription renewal system ready.
-- 
-- Features include:
-- 1. Automated renewal processing with Stripe integration
-- 2. Email reminder system (7 days, 3 days, 1 day before expiry)
-- 3. Payment success/failure notifications  
-- 4. User email preferences management
-- 5. Comprehensive logging and analytics
-- 6. Cron job scheduling for automation
-- ============================================

-- Show current upcoming renewals
SELECT * FROM upcoming_renewals LIMIT 10;

-- Show subscriptions needing reminders
SELECT * FROM subscriptions_needing_reminders LIMIT 10;

-- Show renewal stats for last 30 days
SELECT * FROM get_renewal_stats(30);

-- Show scheduled reminders
SELECT * FROM schedule_renewal_reminders();