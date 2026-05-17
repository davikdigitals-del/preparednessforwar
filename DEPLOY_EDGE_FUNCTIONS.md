# DEPLOY SUPABASE EDGE FUNCTIONS

## THE PROBLEM
CORS error when trying to subscribe:
```
Access to fetch at 'https://xfbmpjgcfohewejdzlfw.supabase.co/functions/v1/create-payment-intent' 
from origin 'https://preparednessforwar.onrender.com' has been blocked by CORS policy
```

**Root Cause:** The Edge Functions are not deployed to Supabase yet.

---

## SOLUTION: DEPLOY EDGE FUNCTIONS

You need to deploy two Edge Functions to Supabase:
1. `create-payment-intent` - Creates Stripe payment intents
2. `stripe-webhook` - Handles Stripe webhook events

---

## OPTION 1: DEPLOY VIA SUPABASE CLI (Recommended)

### Step 1: Install Supabase CLI

**Windows:**
```bash
npm install -g supabase
```

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
- This will open a browser
- Login with your Supabase account
- Authorize the CLI

### Step 3: Link Your Project
```bash
cd preparednessforwar
supabase link --project-ref xfbmpjgcfohewejdzlfw
```
- Use your project reference ID from Supabase dashboard

### Step 4: Set Environment Variables

You need to set these secrets in Supabase:

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Set Stripe webhook secret (get this from Stripe dashboard)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Where to find these:**
- **STRIPE_SECRET_KEY**: Stripe Dashboard → Developers → API Keys → Secret key
- **STRIPE_WEBHOOK_SECRET**: Stripe Dashboard → Developers → Webhooks → Add endpoint → Copy signing secret

### Step 5: Deploy Functions
```bash
# Deploy create-payment-intent function
supabase functions deploy create-payment-intent

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

### Step 6: Verify Deployment
```bash
supabase functions list
```

You should see both functions listed as deployed.

---

## OPTION 2: DEPLOY VIA SUPABASE DASHBOARD

If you can't use CLI, you can deploy via the dashboard:

### Step 1: Go to Edge Functions
1. Open Supabase Dashboard
2. Select your project
3. Click "Edge Functions" in sidebar
4. Click "Create a new function"

### Step 2: Deploy create-payment-intent

1. **Function Name:** `create-payment-intent`
2. **Code:** Copy from `supabase/functions/create-payment-intent/index.ts`
3. Click "Deploy function"

### Step 3: Deploy stripe-webhook

1. Click "Create a new function" again
2. **Function Name:** `stripe-webhook`
3. **Code:** Copy from `supabase/functions/stripe-webhook/index.ts`
4. Click "Deploy function"

### Step 4: Set Environment Variables

1. Go to Project Settings → Edge Functions
2. Add these secrets:
   - `STRIPE_SECRET_KEY` = Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key (from API settings)

---

## CONFIGURE STRIPE WEBHOOK

After deploying the functions, you need to configure Stripe to send webhooks:

### Step 1: Get Webhook URL
Your webhook URL will be:
```
https://xfbmpjgcfohewejdzlfw.supabase.co/functions/v1/stripe-webhook
```

### Step 2: Add Webhook in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** Paste your webhook URL
4. **Events to send:** Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. **Copy the Signing Secret** (starts with `whsec_`)
7. Add this as `STRIPE_WEBHOOK_SECRET` in Supabase

---

## VERIFY IT WORKS

### Test 1: Check Function is Deployed
```bash
curl https://xfbmpjgcfohewejdzlfw.supabase.co/functions/v1/create-payment-intent
```
Should return an error (not 404) - this means function exists.

### Test 2: Try Subscription on Site
1. Go to your site
2. Login as member
3. Go to subscription page
4. Try to subscribe
5. Should NOT see CORS error

### Test 3: Check Logs
In Supabase Dashboard:
1. Go to Edge Functions
2. Click on `create-payment-intent`
3. Click "Logs" tab
4. Try subscribing again
5. Should see logs appear

---

## TROUBLESHOOTING

### Error: "Function not found"
- Function not deployed yet
- Deploy using CLI or dashboard

### Error: "CORS policy"
- Function deployed but CORS headers missing
- Code already has CORS headers, just redeploy

### Error: "STRIPE_SECRET_KEY not set"
- Environment variables not configured
- Set secrets using CLI or dashboard

### Error: "Not authenticated"
- User not logged in
- Make sure you're logged in before subscribing

### Error: "Plan not found"
- Subscription plans not in database
- Run the SQL to create plans (see below)

---

## CREATE SUBSCRIPTION PLANS

If you don't have subscription plans yet, run this SQL in Supabase:

```sql
-- Create subscription plans table if not exists
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT NOT NULL, -- 'month' or 'year'
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample plans
INSERT INTO subscription_plans (name, description, price, currency, interval, features)
VALUES 
  ('Monthly Premium', 'Access to all premium content', 9.99, 'USD', 'month', 
   '["Unlimited access", "Ad-free experience", "Early access to content"]'::jsonb),
  ('Annual Premium', 'Access to all premium content (save 20%)', 95.99, 'USD', 'year',
   '["Unlimited access", "Ad-free experience", "Early access to content", "20% discount"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Create user_subscriptions table if not exists
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read plans
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

---

## SUMMARY

**What you need to do:**

1. ✅ Install Supabase CLI
2. ✅ Login and link project
3. ✅ Set Stripe secrets
4. ✅ Deploy both functions
5. ✅ Configure Stripe webhook
6. ✅ Create subscription plans (if needed)
7. ✅ Test subscription flow

**After deployment:**
- CORS error will be gone
- Subscriptions will work
- Stripe payments will process
- Webhooks will update database

---

## QUICK COMMANDS

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
cd preparednessforwar
supabase link --project-ref xfbmpjgcfohewejdzlfw

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Deploy functions
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook

# Verify
supabase functions list
```

**That's it!** The CORS error will be fixed once functions are deployed.
