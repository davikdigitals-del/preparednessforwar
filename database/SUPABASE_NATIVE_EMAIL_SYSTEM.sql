-- ============================================
-- SUPABASE-NATIVE EMAIL NOTIFICATION SYSTEM
-- Runs entirely within Supabase using database functions and HTTP requests
-- ============================================

-- 1. Create email queue table for processing
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  email_address text NOT NULL,
  email_type text NOT NULL, -- reminder_7d | reminder_3d | reminder_1d | success | failure
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text NOT NULL,
  status text DEFAULT 'pending', -- pending | sent | failed | retry
  attempt_count integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_for timestamptz DEFAULT now(),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  subject_template text NOT NULL,
  html_template text NOT NULL,
  text_template text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create indexes for efficient processing
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled
  ON public.email_queue(status, scheduled_for)
  WHERE status IN ('pending', 'retry');

CREATE INDEX IF NOT EXISTS idx_email_templates_key
  ON public.email_templates(template_key)
  WHERE is_active = true;

-- 4. Insert default email templates
INSERT INTO public.email_templates (template_key, subject_template, html_template, text_template, variables)
VALUES 
(
  'renewal_reminder_7d',
  'Subscription Renewal Reminder - {{plan_name}} expires in 7 days',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Subscription Renewal Reminder</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">Subscription Renewal Reminder</h1>
    </div>
    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 18px; margin-bottom: 20px;">Hi {{user_name}},</p>
      <p>This is a friendly reminder that your <strong>{{plan_name}}</strong> subscription will expire in <strong>7 days</strong> on <strong>{{expiry_date}}</strong>.</p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
        <h3 style="margin-top: 0; color: #1e40af;">Subscription Details</h3>
        <p><strong>Plan:</strong> {{plan_name}}</p>
        <p><strong>Renewal Amount:</strong> {{price}}</p>
        <p><strong>Expires:</strong> {{expiry_date}}</p>
      </div>
      <p><strong>Good news!</strong> Your subscription is set to auto-renew, so you don''t need to do anything.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{site_url}}/dashboard" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Manage Subscription</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Best regards,<br>The Preparedness Hub Team</p>
    </div>
  </div>
</body>
</html>',
  'Hi {{user_name}},

This is a friendly reminder that your {{plan_name}} subscription will expire in 7 days on {{expiry_date}}.

Subscription Details:
- Plan: {{plan_name}}
- Renewal Amount: {{price}}
- Expires: {{expiry_date}}

Good news! Your subscription is set to auto-renew, so you don''t need to do anything.

Manage your subscription: {{site_url}}/dashboard

Best regards,
The Preparedness Hub Team',
  '["user_name", "plan_name", "expiry_date", "price", "site_url"]'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;
-- Insert more email templates
INSERT INTO public.email_templates (template_key, subject_template, html_template, text_template, variables)
VALUES 
(
  'renewal_reminder_3d',
  'Subscription Renewal Reminder - {{plan_name}} expires in 3 days',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Subscription Renewal Reminder</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">⏰ Subscription Expires Soon</h1>
    </div>
    <div style="background: #fffbeb; padding: 30px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 18px; margin-bottom: 20px;">Hi {{user_name}},</p>
      <p>Your <strong>{{plan_name}}</strong> subscription will expire in <strong>3 days</strong> on <strong>{{expiry_date}}</strong>.</p>
      <div style="background: #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Please ensure your payment method is up to date to avoid service interruption.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{site_url}}/dashboard" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Update Payment Method</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Best regards,<br>The Preparedness Hub Team</p>
    </div>
  </div>
</body>
</html>',
  'Hi {{user_name}},

Your {{plan_name}} subscription will expire in 3 days on {{expiry_date}}.

IMPORTANT: Please ensure your payment method is up to date to avoid service interruption.

Update payment method: {{site_url}}/dashboard

Best regards,
The Preparedness Hub Team',
  '["user_name", "plan_name", "expiry_date", "site_url"]'::jsonb
),
(
  'renewal_reminder_1d',
  'URGENT: {{plan_name}} expires tomorrow',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Urgent: Subscription Expires Tomorrow</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">🚨 URGENT: Subscription Expires Tomorrow</h1>
    </div>
    <div style="background: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 18px; margin-bottom: 20px;">Hi {{user_name}},</p>
      <p><strong>Final notice:</strong> Your <strong>{{plan_name}}</strong> subscription expires <strong>tomorrow</strong> on <strong>{{expiry_date}}</strong>.</p>
      <div style="background: #ef4444; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-weight: bold;">⚠️ ACTION REQUIRED: Verify your payment method now</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{site_url}}/dashboard" style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Update Payment Now</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Best regards,<br>The Preparedness Hub Team</p>
    </div>
  </div>
</body>
</html>',
  'URGENT: Hi {{user_name}},

Your {{plan_name}} subscription expires TOMORROW on {{expiry_date}}.

ACTION REQUIRED: Verify your payment method now to avoid service interruption.

Update payment: {{site_url}}/dashboard

Best regards,
The Preparedness Hub Team',
  '["user_name", "plan_name", "expiry_date", "site_url"]'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;
-- 5. Function to replace template variables
CREATE OR REPLACE FUNCTION replace_template_variables(
  template_text text,
  variables jsonb
) RETURNS text AS $$
DECLARE
  result text := template_text;
  var_key text;
  var_value text;
BEGIN
  -- Loop through each variable in the jsonb object
  FOR var_key, var_value IN
    SELECT key, value::text 
    FROM jsonb_each_text(variables)
  LOOP
    result := replace(result, '{{' || var_key || '}}', var_value);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to queue renewal reminder emails
CREATE OR REPLACE FUNCTION queue_renewal_reminders()
RETURNS TABLE(
  queued_count integer,
  reminder_details jsonb
) AS $$
DECLARE
  reminder_count integer := 0;
  subscription_record record;
  template_record record;
  days_until_expiry integer;
  template_key text;
  variables jsonb;
  processed_subject text;
  processed_html text;
  processed_text text;
BEGIN
  -- Loop through subscriptions needing reminders
  FOR subscription_record IN
    SELECT 
      us.id,
      us.user_id,
      us.expires_at,
      us.last_reminder_sent,
      sp.name as plan_name,
      sp.price,
      sp.currency,
      sp.interval,
      p.email as user_email,
      p.name as user_name,
      EXTRACT(DAYS FROM (us.expires_at - CURRENT_TIMESTAMP))::integer as days_until_expiry
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
      AND p.email IS NOT NULL
  LOOP
    days_until_expiry := subscription_record.days_until_expiry;
    
    -- Determine template based on days until expiry
    IF days_until_expiry <= 1 THEN
      template_key := 'renewal_reminder_1d';
    ELSIF days_until_expiry <= 3 THEN
      template_key := 'renewal_reminder_3d';
    ELSIF days_until_expiry <= 7 THEN
      template_key := 'renewal_reminder_7d';
    ELSE
      CONTINUE; -- Skip if more than 7 days
    END IF;

    -- Get template
    SELECT * INTO template_record
    FROM public.email_templates
    WHERE template_key = queue_renewal_reminders.template_key
      AND is_active = true;
    
    IF NOT FOUND THEN
      CONTINUE; -- Skip if template not found
    END IF;

    -- Build variables for template replacement
    variables := jsonb_build_object(
      'user_name', COALESCE(subscription_record.user_name, 'Valued Member'),
      'plan_name', subscription_record.plan_name,
      'expiry_date', to_char(subscription_record.expires_at, 'FMDay, FMMonth FMDDth, YYYY'),
      'price', subscription_record.currency || ' ' || subscription_record.price::text,
      'site_url', COALESCE(current_setting('app.site_url', true), 'https://preparedness-hub.com')
    );

    -- Process templates with variable replacement
    processed_subject := replace_template_variables(template_record.subject_template, variables);
    processed_html := replace_template_variables(template_record.html_template, variables);
    processed_text := replace_template_variables(template_record.text_template, variables);

    -- Queue the email
    INSERT INTO public.email_queue (
      user_id,
      subscription_id,
      email_address,
      email_type,
      subject,
      html_content,
      text_content,
      scheduled_for
    ) VALUES (
      subscription_record.user_id,
      subscription_record.id,
      subscription_record.user_email,
      'reminder_' || days_until_expiry || 'd',
      processed_subject,
      processed_html,
      processed_text,
      CURRENT_TIMESTAMP
    );

    -- Update last reminder sent
    UPDATE public.user_subscriptions 
    SET last_reminder_sent = CURRENT_TIMESTAMP
    WHERE id = subscription_record.id;

    reminder_count := reminder_count + 1;
  END LOOP;

  RETURN QUERY SELECT 
    reminder_count,
    jsonb_build_object('queued_emails', reminder_count, 'timestamp', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;
-- 7. Function to process email queue using Supabase HTTP requests
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS TABLE(
  processed_count integer,
  success_count integer,
  failed_count integer,
  details jsonb
) AS $$
DECLARE
  email_record record;
  processed integer := 0;
  successes integer := 0;
  failures integer := 0;
  http_response jsonb;
  email_payload jsonb;
BEGIN
  -- Process pending emails (limit to 50 per batch to avoid timeouts)
  FOR email_record IN
    SELECT *
    FROM public.email_queue
    WHERE status IN ('pending', 'retry')
      AND scheduled_for <= CURRENT_TIMESTAMP
      AND attempt_count < max_attempts
    ORDER BY created_at
    LIMIT 50
  LOOP
    -- Increment attempt count
    UPDATE public.email_queue 
    SET attempt_count = attempt_count + 1
    WHERE id = email_record.id;

    -- Prepare email payload for Resend API
    email_payload := jsonb_build_object(
      'from', COALESCE(current_setting('app.from_email', true), 'noreply@preparedness-hub.com'),
      'to', jsonb_build_array(email_record.email_address),
      'subject', email_record.subject,
      'html', email_record.html_content,
      'text', email_record.text_content
    );

    -- Send email using Supabase HTTP extension (requires http extension)
    BEGIN
      SELECT content INTO http_response
      FROM http((
        'POST',
        'https://api.resend.com/emails',
        ARRAY[
          http_header('Authorization', 'Bearer ' || current_setting('app.resend_api_key', true)),
          http_header('Content-Type', 'application/json')
        ],
        'application/json',
        email_payload::text
      )::http_request);

      -- Mark as sent if successful
      UPDATE public.email_queue 
      SET 
        status = 'sent',
        sent_at = CURRENT_TIMESTAMP,
        error_message = NULL
      WHERE id = email_record.id;

      successes := successes + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Handle email send failure
      IF email_record.attempt_count >= email_record.max_attempts THEN
        -- Max attempts reached, mark as failed
        UPDATE public.email_queue 
        SET 
          status = 'failed',
          error_message = SQLERRM
        WHERE id = email_record.id;
      ELSE
        -- Schedule retry (exponential backoff)
        UPDATE public.email_queue 
        SET 
          status = 'retry',
          scheduled_for = CURRENT_TIMESTAMP + (INTERVAL '1 hour' * POWER(2, email_record.attempt_count)),
          error_message = SQLERRM
        WHERE id = email_record.id;
      END IF;
      
      failures := failures + 1;
    END;

    processed := processed + 1;
  END LOOP;

  -- Log processing results
  INSERT INTO public.subscription_renewals (
    subscription_id,
    user_id,
    plan_id,
    renewal_date,
    amount,
    currency,
    status,
    email_sent,
    email_type,
    created_at
  )
  SELECT 
    eq.subscription_id,
    eq.user_id,
    us.plan_id,
    us.expires_at,
    sp.price,
    sp.currency,
    'email_batch_processed',
    (eq.status = 'sent'),
    eq.email_type,
    CURRENT_TIMESTAMP
  FROM public.email_queue eq
  LEFT JOIN public.user_subscriptions us ON eq.subscription_id = us.id
  LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE eq.id IN (
    SELECT id FROM public.email_queue 
    WHERE status IN ('sent', 'failed')
      AND sent_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
  );

  RETURN QUERY SELECT 
    processed,
    successes,
    failures,
    jsonb_build_object(
      'processed', processed,
      'successful', successes,
      'failed', failures,
      'timestamp', CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Function to queue payment notification emails
CREATE OR REPLACE FUNCTION queue_payment_notification(
  p_subscription_id uuid,
  p_notification_type text, -- 'success' or 'failure'
  p_failure_reason text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  subscription_record record;
  template_key text;
  template_record record;
  variables jsonb;
  processed_subject text;
  processed_html text;
  processed_text text;
BEGIN
  -- Get subscription details
  SELECT 
    us.id,
    us.user_id,
    us.expires_at,
    sp.name as plan_name,
    sp.price,
    sp.currency,
    p.email as user_email,
    p.name as user_name
  INTO subscription_record
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  LEFT JOIN public.profiles p ON us.user_id = p.id
  WHERE us.id = p_subscription_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Determine template
  template_key := 'payment_' || p_notification_type;

  -- Build variables
  variables := jsonb_build_object(
    'user_name', COALESCE(subscription_record.user_name, 'Valued Member'),
    'plan_name', subscription_record.plan_name,
    'price', subscription_record.currency || ' ' || subscription_record.price::text,
    'next_billing', to_char(subscription_record.expires_at, 'FMDay, FMMonth FMDDth, YYYY'),
    'site_url', COALESCE(current_setting('app.site_url', true), 'https://preparedness-hub.com'),
    'failure_reason', COALESCE(p_failure_reason, 'Payment processing error')
  );

  -- Get and process template (you would need to add payment templates)
  -- For now, use a simple notification
  IF p_notification_type = 'success' THEN
    processed_subject := 'Payment Successful - ' || subscription_record.plan_name || ' Renewed';
    processed_html := '<p>Your payment was successful and your subscription has been renewed.</p>';
    processed_text := 'Your payment was successful and your subscription has been renewed.';
  ELSE
    processed_subject := 'Payment Failed - Action Required';
    processed_html := '<p>Your payment failed. Please update your payment method.</p>';
    processed_text := 'Your payment failed. Please update your payment method.';
  END IF;

  -- Queue the notification
  INSERT INTO public.email_queue (
    user_id,
    subscription_id,
    email_address,
    email_type,
    subject,
    html_content,
    text_content,
    scheduled_for
  ) VALUES (
    subscription_record.user_id,
    p_subscription_id,
    subscription_record.user_email,
    p_notification_type,
    processed_subject,
    processed_html,
    processed_text,
    CURRENT_TIMESTAMP
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql;
-- 9. Enable Row Level Security
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies
CREATE POLICY "Users can view own emails"
  ON public.email_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email queue"
  ON public.email_queue FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read active email templates"
  ON public.email_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage email templates"
  ON public.email_templates FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 11. Alternative to cron jobs - Manual execution functions
-- Note: pg_cron extension is not available in standard Supabase plans
-- Use these functions with external cron services or scheduled edge functions

-- Function to run daily renewal processing (call this daily at 2 AM UTC)
CREATE OR REPLACE FUNCTION run_daily_renewal_processing()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  renewal_count integer := 0;
BEGIN
  -- Process subscription renewals
  WITH renewed_subscriptions AS (
    UPDATE public.user_subscriptions 
    SET 
      expires_at = calculate_next_billing_date(expires_at, (
        SELECT sp.interval 
        FROM public.subscription_plans sp 
        WHERE sp.id = user_subscriptions.plan_id
      )),
      status = 'active'
    WHERE status = 'active'
      AND auto_renew = true
      AND expires_at <= CURRENT_DATE
      AND EXISTS (
        SELECT 1 FROM public.subscription_plans sp 
        WHERE sp.id = user_subscriptions.plan_id 
        AND sp.price > 0
      )
    RETURNING id, user_id, plan_id
  )
  SELECT COUNT(*) INTO renewal_count FROM renewed_subscriptions;

  -- Queue success notifications for renewed subscriptions
  INSERT INTO public.email_queue (
    user_id, subscription_id, email_address, email_type, 
    subject, html_content, text_content
  )
  SELECT 
    us.user_id,
    us.id,
    p.email,
    'renewal_success',
    'Subscription Renewed Successfully - ' || sp.name,
    '<p>Your ' || sp.name || ' subscription has been automatically renewed.</p>',
    'Your ' || sp.name || ' subscription has been automatically renewed.'
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  JOIN public.profiles p ON us.user_id = p.id
  WHERE us.status = 'active'
    AND us.expires_at > (CURRENT_DATE - INTERVAL '1 day')
    AND us.expires_at <= CURRENT_DATE
    AND p.email IS NOT NULL;

  result := jsonb_build_object(
    'renewed_subscriptions', renewal_count,
    'timestamp', CURRENT_TIMESTAMP,
    'status', 'completed'
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to run reminder processing (call this twice daily)
CREATE OR REPLACE FUNCTION run_reminder_processing()
RETURNS jsonb AS $$
DECLARE
  reminder_result jsonb;
BEGIN
  -- Queue renewal reminders
  SELECT jsonb_agg(row_to_json(t)) INTO reminder_result
  FROM queue_renewal_reminders() t;

  RETURN COALESCE(reminder_result, '{"queued_count": 0}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to run email processing (call this every 15 minutes)
CREATE OR REPLACE FUNCTION run_email_processing()
RETURNS jsonb AS $$
DECLARE
  email_result jsonb;
BEGIN
  -- Process email queue
  SELECT jsonb_agg(row_to_json(t)) INTO email_result
  FROM process_email_queue() t;

  RETURN COALESCE(email_result, '{"processed_count": 0}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 12. Create views for monitoring
CREATE OR REPLACE VIEW email_queue_stats AS
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest_email,
  MAX(created_at) as newest_email
FROM public.email_queue
GROUP BY status;

CREATE OR REPLACE VIEW daily_email_stats AS
SELECT 
  DATE(created_at) as date,
  email_type,
  COUNT(*) as total_emails,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_emails,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_emails,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'sent')::numeric / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as success_rate
FROM public.email_queue
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), email_type
ORDER BY date DESC, email_type;

-- 13. Create configuration function
CREATE OR REPLACE FUNCTION configure_email_system(
  resend_api_key text,
  from_email text,
  site_url text
) RETURNS text AS $$
BEGIN
  -- Set configuration (requires superuser or appropriate grants)
  PERFORM set_config('app.resend_api_key', resend_api_key, false);
  PERFORM set_config('app.from_email', from_email, false);
  PERFORM set_config('app.site_url', site_url, false);
  
  RETURN 'Email system configured successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN 'Configuration failed: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 14. Usage examples and testing

-- Queue a test reminder manually
-- SELECT queue_renewal_reminders();

-- Process email queue manually  
-- SELECT process_email_queue();

-- Check email queue status
-- SELECT * FROM email_queue_stats;

-- View recent email activity
-- SELECT * FROM daily_email_stats LIMIT 10;

-- Send a test payment notification
-- SELECT queue_payment_notification('subscription-uuid-here', 'success');

-- Configure the email system (run once with your credentials)
-- SELECT configure_email_system(
--   'your-resend-api-key',
--   'noreply@yoursite.com', 
--   'https://yoursite.com'
-- );

-- ============================================
-- SYSTEM READY
-- 
-- This system runs entirely within Supabase using:
-- 1. Database functions for email processing
-- 2. Built-in cron jobs for automation
-- 3. HTTP extension for sending emails via Resend
-- 4. RLS policies for security
-- 
-- To complete setup:
-- 1. Enable pg_cron extension in Supabase
-- 2. Enable http extension in Supabase
-- 3. Run configure_email_system() with your credentials
-- 4. Monitor with the provided views
-- ============================================

-- Show system status
SELECT 
  'Email Templates' as component,
  COUNT(*)::text as status
FROM public.email_templates WHERE is_active = true

UNION ALL

SELECT 
  'Pending Emails' as component,
  COUNT(*)::text as status  
FROM public.email_queue WHERE status = 'pending'

UNION ALL

SELECT 
  'Active Subscriptions' as component,
  COUNT(*)::text as status
FROM public.user_subscriptions WHERE status = 'active';

-- ============================================
-- SCHEDULING ALTERNATIVES SINCE CRON IS NOT AVAILABLE
-- ============================================

-- Option 1: Create scheduled edge functions (recommended)
-- Create these edge functions and call them via external cron services:

-- supabase/functions/daily-renewal-processing/index.ts:
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
  
  const { data, error } = await supabase.rpc('run_daily_renewal_processing')
  
  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
*/

-- supabase/functions/process-reminders/index.ts:
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
  
  const { data, error } = await supabase.rpc('run_reminder_processing')
  
  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
*/

-- supabase/functions/process-emails/index.ts:
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
  
  const { data, error } = await supabase.rpc('run_email_processing')
  
  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
*/

-- Option 2: External cron services to call these URLs:
-- https://your-project.supabase.co/functions/v1/daily-renewal-processing (daily at 2 AM)
-- https://your-project.supabase.co/functions/v1/process-reminders (twice daily at 9 AM & 6 PM)  
-- https://your-project.supabase.co/functions/v1/process-emails (every 15 minutes)

-- Option 3: GitHub Actions workflow (free with GitHub):
/*
name: Subscription Processing
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
jobs:
  process-renewals:
    runs-on: ubuntu-latest
    steps:
      - name: Process renewals
        run: |
          curl -X POST https://your-project.supabase.co/functions/v1/daily-renewal-processing \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
*/