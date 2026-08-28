# Supabase-Native Email Subscription System Setup

## Overview
This system runs entirely within Supabase using database functions, HTTP extensions, and scheduled edge functions instead of cron jobs.

## Prerequisites
1. Supabase project with database access
2. Resend account for email sending (or alternative email service)
3. External scheduling service (GitHub Actions, Vercel Cron, etc.)

## Step 1: Database Setup

1. **Run the SQL setup file**:
   ```sql
   -- In Supabase SQL Editor, run:
   \i database/SUPABASE_NATIVE_EMAIL_SYSTEM.sql
   ```

2. **Enable required extensions** (if not already enabled):
   ```sql
   -- Enable HTTP extension for sending emails
   CREATE EXTENSION IF NOT EXISTS http;
   
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

## Step 2: Configure Email Service

1. **Set up configuration** (run once with your credentials):
   ```sql
   SELECT configure_email_system(
     'your-resend-api-key-here',
     'noreply@yourdomain.com',
     'https://yourdomain.com'
   );
   ```

2. **Test the configuration**:
   ```sql
   -- Queue a test reminder
   SELECT run_reminder_processing();
   
   -- Check email queue
   SELECT * FROM email_queue_stats;
   ```

## Step 3: Deploy Edge Functions

Deploy the three edge functions to Supabase:

```bash
# Deploy all functions
supabase functions deploy daily-renewal-processing
supabase functions deploy process-reminders  
supabase functions deploy process-emails
```

## Step 4: Set Up Scheduling

Since pg_cron is not available, use one of these alternatives:

### Option A: GitHub Actions (Free & Recommended)

Create `.github/workflows/subscription-processing.yml`:

```yaml
name: Subscription Processing
on:
  schedule:
    # Daily renewal processing at 2 AM UTC
    - cron: '0 2 * * *'
    # Reminder processing at 9 AM and 6 PM UTC  
    - cron: '0 9,18 * * *'
    # Email processing every 15 minutes
    - cron: '*/15 * * * *'

jobs:
  process-subscriptions:
    runs-on: ubuntu-latest
    steps:
      - name: Daily renewal processing
        if: github.event.schedule == '0 2 * * *'
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/daily-renewal-processing" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
          
      - name: Process reminders
        if: github.event.schedule == '0 9,18 * * *'
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/process-reminders" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
          
      - name: Process emails
        if: github.event.schedule == '*/15 * * * *'
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/process-emails" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

**Required GitHub Secrets:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

### Option B: Vercel Cron Jobs

If deploying to Vercel, create `api/cron/` endpoints:

```javascript
// api/cron/daily-renewals.js
export default async function handler(req, res) {
  const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/daily-renewal-processing`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  
  const data = await response.json();
  res.json(data);
}
```

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-renewals",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/process-reminders", 
      "schedule": "0 9,18 * * *"
    },
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Option C: External Cron Services

Use services like:
- **EasyCron**: Free tier available
- **Cronhub**: Simple HTTP cron service  
- **UptimeRobot**: Can be configured for HTTP monitoring/calls

Configure them to call these URLs:
- `https://your-project.supabase.co/functions/v1/daily-renewal-processing` (daily at 2 AM UTC)
- `https://your-project.supabase.co/functions/v1/process-reminders` (twice daily at 9 AM & 6 PM UTC)
- `https://your-project.supabase.co/functions/v1/process-emails` (every 15 minutes)

## Step 5: Testing & Monitoring

### Manual Testing
```sql
-- Test reminder processing
SELECT run_reminder_processing();

-- Test email processing  
SELECT run_email_processing();

-- Test daily renewals
SELECT run_daily_renewal_processing();

-- Check email queue status
SELECT * FROM email_queue_stats;

-- View recent email activity
SELECT * FROM daily_email_stats LIMIT 10;
```

### Admin Interface
Add the admin component to your React app to monitor the system:

```typescript
import AdminNativeEmails from '@/pages/admin/AdminNativeEmails';

// Add to your admin routes
<Route path="/admin/emails" element={<AdminNativeEmails />} />
```

## Email Templates

The system includes these default templates:
- **7-day reminder**: Friendly heads-up
- **3-day reminder**: More urgent notice
- **1-day reminder**: Final warning
- **Success notification**: Payment confirmation
- **Failure notification**: Payment failed alert

### Customizing Templates

Update templates in the database:
```sql
UPDATE public.email_templates 
SET 
  subject_template = 'Your custom subject {{plan_name}}',
  html_template = '<p>Your custom HTML content</p>',
  text_template = 'Your custom text content'
WHERE template_key = 'renewal_reminder_7d';
```

## Environment Variables

Make sure these are set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 
- Resend API key (configured via `configure_email_system()`)

## Troubleshooting

### Common Issues

1. **HTTP extension not enabled**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS http;
   ```

2. **Email sending fails**:
   - Check Resend API key is correct
   - Verify `from_email` domain is verified in Resend
   - Check `app.resend_api_key` setting

3. **Functions not triggering**:
   - Verify edge functions are deployed
   - Check external cron service is configured
   - Monitor function logs in Supabase dashboard

4. **RLS issues**:
   - Ensure service role key has proper permissions
   - Check RLS policies allow service role access

### Monitoring Queries

```sql
-- Check system health
SELECT * FROM email_queue_stats;

-- Recent email activity
SELECT * FROM daily_email_stats WHERE date >= CURRENT_DATE - 7;

-- Failed emails
SELECT * FROM public.email_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Pending subscriptions needing renewals
SELECT COUNT(*) as upcoming_renewals
FROM public.user_subscriptions 
WHERE status = 'active' 
  AND expires_at BETWEEN CURRENT_DATE AND CURRENT_DATE + 7;
```

## Success Metrics

The system is working correctly when you see:
- ✅ Email templates loaded in database
- ✅ Scheduled functions running without errors
- ✅ Email queue processing regularly (every 15 minutes)
- ✅ Renewal reminders sent 7, 3, and 1 days before expiry
- ✅ Payment notifications sent for successes/failures
- ✅ Subscription renewals processed automatically

## Support

Monitor the system through:
1. Supabase function logs
2. Email queue status views
3. Daily email statistics
4. Admin interface metrics