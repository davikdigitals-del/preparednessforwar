# Subscription Renewal Automation Guide

## Overview
This system provides automated subscription renewals for monthly and yearly plans with Stripe integration and comprehensive tracking.

## Components

### 1. Database Setup
Run the SQL file to set up the renewal system:
```sql
-- Run in Supabase SQL Editor
\i database/SUBSCRIPTION_RENEWAL_SETUP.sql
```

### 2. Edge Functions
Two edge functions handle renewal processing:

- **`process-subscription-renewals`**: Basic renewal processing (demo mode)
- **`handle-subscription-billing`**: Full Stripe integration with payment processing

### 3. Admin Interface
Access renewal management at `/admin/subscription-renewals`

## How It Works

### Automatic Renewal Flow
1. **Daily Check**: System checks for subscriptions expiring in next 3 days
2. **Payment Processing**: Creates Stripe payment intents for renewal
3. **Success Handling**: Updates subscription with new expiry date
4. **Failure Handling**: Marks subscription as payment failed
5. **Notifications**: Logs all renewal attempts and results

### Subscription States
- **active**: Subscription is current and valid
- **payment_failed**: Renewal payment failed, needs attention
- **cancelled**: User cancelled, won't auto-renew
- **expired**: Past due date, access revoked

## Setup Instructions

### 1. Environment Variables
Add to your Supabase project settings:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2. Deploy Edge Functions
```bash
# Deploy renewal functions
supabase functions deploy process-subscription-renewals
supabase functions deploy handle-subscription-billing
```

### 3. Set Up Cron Jobs
Configure automated daily runs:

#### Option A: Supabase Cron (Recommended)
```sql
-- Add to your Supabase project
SELECT cron.schedule(
  'process-renewals',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-subscription-renewals',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

#### Option B: External Cron Service
Use services like:
- Vercel Cron Jobs
- AWS CloudWatch Events
- GitHub Actions (scheduled workflows)
- External monitoring services (Uptime Robot, etc.)

### 4. Webhook Setup (Optional)
For real-time Stripe events:
```bash
# Configure Stripe webhook endpoint
https://your-project.supabase.co/functions/v1/stripe-webhook
```

## Monitoring & Analytics

### View Upcoming Renewals
```sql
SELECT * FROM upcoming_renewals;
```

### Check Renewal Statistics
```sql
SELECT * FROM get_renewal_stats(30); -- Last 30 days
```

### Manual Processing
Call the edge function directly:
```javascript
const { data, error } = await supabase.functions.invoke('process-subscription-renewals');
```

## Key Features

### ✅ Automated Processing
- Daily checks for expiring subscriptions
- Automatic payment collection via Stripe
- Renewal attempt tracking and retry logic

### ✅ Comprehensive Logging
- All renewal attempts logged with details
- Success/failure tracking with reasons
- Revenue and statistics reporting

### ✅ Admin Controls
- Web interface for renewal management
- Manual processing triggers
- Real-time statistics dashboard

### ✅ Customer Experience
- Seamless auto-renewals
- Payment failure notifications
- Grace periods and retry attempts

### ✅ Revenue Protection
- Minimizes subscription lapses
- Automated payment collection
- Failed payment recovery workflows

## Troubleshooting

### Common Issues

**Renewals Not Processing**
- Check edge function logs in Supabase dashboard
- Verify Stripe API keys are correct
- Ensure cron job is configured and running

**Payment Failures**
- Check Stripe dashboard for declined payments
- Verify customer payment methods are valid
- Review webhook delivery status

**Missing Billing Dates**
- Run `SELECT update_subscription_billing_dates();`
- Check trigger is properly installed
- Verify subscription plans have valid intervals

### Logs and Monitoring
- Supabase Functions: Real-time logs in dashboard
- Stripe Dashboard: Payment and webhook logs
- Database: Check `subscription_renewals` table for detailed logs

## Best Practices

1. **Test Thoroughly**: Use Stripe test mode before production
2. **Monitor Daily**: Check renewal processing results
3. **Handle Failures**: Set up alerts for payment failures
4. **Customer Communication**: Send renewal notifications
5. **Backup Strategy**: Regular database backups
6. **Security**: Protect webhook endpoints and API keys

## Support

For issues with the renewal system:
1. Check Supabase function logs
2. Review Stripe dashboard for payment issues
3. Examine database logs in `subscription_renewals` table
4. Test edge functions manually via admin interface