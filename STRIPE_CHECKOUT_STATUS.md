# Stripe Checkout Status & Setup

## Current Status

### ✅ What's Working:
1. **Stripe Keys Configured** - Both publishable and secret keys are in `.env`
2. **Stripe Component** - `StripeCheckout.tsx` is properly implemented
3. **Payment Flow** - Frontend payment form is ready
4. **Subscription Plans** - Database table exists

### ❌ What's NOT Working:
1. **Supabase Edge Function** - The `create-payment-intent` function needs to be deployed
2. **CORS Error** - Backend function not responding (expected in development)

## The Issue

The CORS error you're seeing:
```
Access to fetch at 'https://xfbmpjgcfohewejdzlfw.supabase.co/functions/v1/create-payment-intent' 
from origin 'http://192.168.212.66:8080' has been blocked by CORS policy
```

This means the Supabase Edge Function doesn't exist or isn't deployed yet.

## What You Need

### 1. Supabase Edge Function

You need to create and deploy a Supabase Edge Function called `create-payment-intent`.

**File**: `supabase/functions/create-payment-intent/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { planId, userId } = await req.json()

    // Get plan details from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const planResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscription_plans?id=eq.${planId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    )
    
    const plans = await planResponse.json()
    const plan = plans[0]

    if (!plan) {
      throw new Error('Plan not found')
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price,
      currency: plan.currency.toLowerCase(),
      metadata: {
        planId: plan.id,
        userId: userId,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 2. Deploy the Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref xfbmpjgcfohewejdzlfw

# Deploy the function
supabase functions deploy create-payment-intent --no-verify-jwt

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY=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
```

## Alternative: Test Without Backend

For testing the UI without the backend function:

### Option 1: Mock the Payment Flow

Update `src/pages/SubscribePage.tsx`:

```typescript
// Add this mock function at the top
const createMockPaymentIntent = async (planId: string) => {
  // Mock client secret for testing
  return {
    clientSecret: 'pi_test_secret_mock_for_ui_testing'
  };
};

// In handleSelectPlan function, replace the fetch call:
const handleSelectPlan = async (plan: SubscriptionPlan) => {
  setSelectedPlan(plan);
  setProcessingPayment(true);

  try {
    // FOR TESTING ONLY - Replace with real API call
    const { clientSecret } = await createMockPaymentIntent(plan.id);
    
    setClientSecret(clientSecret);
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
    setSelectedPlan(null);
  } finally {
    setProcessingPayment(false);
  }
};
```

### Option 2: Use Stripe Test Mode

1. Get Stripe test keys from: https://dashboard.stripe.com/test/apikeys
2. Replace in `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Current Checkout Flow

1. **User clicks "Subscribe"** on a plan
2. **Frontend calls** `create-payment-intent` function
3. **Function creates** Stripe PaymentIntent
4. **Returns** client secret
5. **Stripe Elements** renders payment form
6. **User enters** card details
7. **Stripe processes** payment
8. **Webhook** updates subscription status

## What Works Now

✅ **Frontend UI** - Subscription plans display
✅ **Plan Selection** - Users can select plans
✅ **Stripe Integration** - Stripe.js is loaded
✅ **Payment Form** - Stripe Elements ready

## What Needs Setup

❌ **Edge Function** - Deploy `create-payment-intent`
❌ **Webhooks** - Set up Stripe webhooks
❌ **Subscription Logic** - Handle successful payments

## Quick Fix for Testing

**Run this first**:
```sql
-- File: database/FIX_POSTS_TABLE_COLUMNS.sql
```

This adds the missing `views` column to posts table.

**Then** you can populate content with:
```sql
-- File: database/ADD_REALISTIC_POSTS.sql
```

## Summary

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Stripe Keys | ✅ Configured | None |
| Frontend UI | ✅ Working | None |
| Payment Form | ✅ Ready | None |
| Edge Function | ❌ Missing | Deploy function |
| Webhooks | ❌ Not set up | Configure webhooks |
| Posts Table | ❌ Missing column | Run FIX_POSTS_TABLE_COLUMNS.sql |

## Next Steps

1. **Fix posts table**: Run `database/FIX_POSTS_TABLE_COLUMNS.sql`
2. **Add content**: Run `database/ADD_REALISTIC_POSTS.sql`
3. **Deploy Edge Function**: Follow deployment steps above
4. **Test payments**: Use Stripe test mode

The Stripe checkout UI is ready, but the backend function needs to be deployed to process actual payments.
