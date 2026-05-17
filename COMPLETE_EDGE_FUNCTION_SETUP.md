# COMPLETE EDGE FUNCTION SETUP GUIDE

## 🎯 GOAL
Fix the CORS error on subscription page by deploying Edge Functions to Supabase.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Deploy create-payment-intent Function**

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project (xfbmpjgcfohewejdzlfw)

2. **Navigate to Edge Functions**
   - Click **"Edge Functions"** in the left sidebar
   - Click **"Create a new function"**

3. **Create the Function**
   - **Function name:** `create-payment-intent`
   - **Copy and paste this code:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { planId } = await req.json()

    // Fetch plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      throw new Error('Plan not found')
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100), // Convert to cents
      currency: plan.currency.toLowerCase(),
      metadata: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        amount: plan.price,
        currency: plan.currency,
      }),
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

4. **Click "Deploy function"**

---

### **STEP 2: Deploy stripe-webhook Function**

1. **Create Another Function**
   - Click **"Create a new function"** again
   - **Function name:** `stripe-webhook`
   - **Copy and paste this code:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { userId, planId } = paymentIntent.metadata

        if (!userId || !planId) {
          throw new Error('Missing metadata')
        }

        // Calculate expiry date based on plan interval
        const { data: plan } = await supabaseAdmin
          .from('subscription_plans')
          .select('interval')
          .eq('id', planId)
          .single()

        const expiresAt = new Date()
        if (plan?.interval === 'year') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1)
        }

        // Create or update subscription
        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            payment_ref: paymentIntent.id,
          })

        if (error) {
          console.error('Error creating subscription:', error)
          throw error
        }

        console.log(`Subscription created for user ${userId}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (userId) {
          await supabaseAdmin
            .from('user_subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('status', 'active')
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

2. **Click "Deploy function"**

---

### **STEP 3: Get Supabase Service Role Key**

1. **In Supabase Dashboard**
   - Go to **Project Settings** (gear icon in sidebar)
   - Click **"API"** tab
   - Scroll down to **"Project API keys"**
   - Find **"service_role"** key
   - Click the eye icon to reveal it
   - **Copy the entire key** (starts with `eyJhbGci...`)

---

### **STEP 4: Add Secrets to Supabase**

1. **Navigate to Edge Functions Settings**
   - In Supabase Dashboard, go to **Edge Functions**
   - Click **"Manage secrets"** button
   - OR go to **Project Settings** → **Edge Functions** → **Secrets**

2. **Add These 3 Secrets:**

   **Secret 1:**
   - Name: `STRIPE_SECRET_KEY`
   - Value: `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`

   **Secret 2:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (Paste the service_role key you copied in Step 3)

   **Secret 3:**
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: (You'll get this in Step 5 - leave blank for now)

3. **Click "Save" or "Add secret"**

---

### **STEP 5: Configure Stripe Webhook**

1. **Go to Stripe Dashboard**
   - Open: https://dashboard.stripe.com
   - Click **"Developers"** in top menu
   - Click **"Webhooks"** in left sidebar

2. **Add Endpoint**
   - Click **"Add endpoint"** button
   - **Endpoint URL:** 
     ```
     https://xfbmpjgcfohewejdzlfw.supabase.co/functions/v1/stripe-webhook
     ```

3. **Select Events**
   - Click **"Select events"**
   - Search and select these 3 events:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `customer.subscription.deleted`
   - Click **"Add events"**

4. **Add Endpoint**
   - Click **"Add endpoint"** button at bottom

5. **Copy Signing Secret**
   - After creating, you'll see the webhook details
   - Find **"Signing secret"** section
   - Click **"Reveal"** or **"Click to reveal"**
   - **Copy the secret** (starts with `whsec_...`)

6. **Add to Supabase**
   - Go back to Supabase Dashboard
   - Go to Edge Functions → Manage secrets
   - Find `STRIPE_WEBHOOK_SECRET`
   - Paste the signing secret you just copied
   - Save

---

### **STEP 6: Verify Everything Works**

1. **Check Functions are Deployed**
   - In Supabase Dashboard → Edge Functions
   - You should see:
     - ✅ `create-payment-intent` (status: deployed)
     - ✅ `stripe-webhook` (status: deployed)

2. **Check Secrets are Set**
   - Go to Edge Functions → Manage secrets
   - You should see:
     - ✅ `STRIPE_SECRET_KEY`
     - ✅ `STRIPE_WEBHOOK_SECRET`
     - ✅ `SUPABASE_SERVICE_ROLE_KEY`

3. **Test on Your Site**
   - Go to: https://preparednessforwar.onrender.com
   - Login as a member
   - Go to subscription page
   - Try to subscribe
   - **CORS error should be GONE!**

4. **Check Logs**
   - In Supabase Dashboard → Edge Functions
   - Click on `create-payment-intent`
   - Click **"Logs"** tab
   - Try subscribing again
   - You should see logs appear

---

## ✅ CHECKLIST

**Supabase Edge Functions:**
- [ ] `create-payment-intent` function deployed
- [ ] `stripe-webhook` function deployed
- [ ] `STRIPE_SECRET_KEY` secret added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` secret added
- [ ] `STRIPE_WEBHOOK_SECRET` secret added

**Stripe Webhook:**
- [ ] Webhook endpoint created
- [ ] Webhook URL points to Supabase function
- [ ] 3 events selected (payment_intent.succeeded, payment_intent.payment_failed, customer.subscription.deleted)
- [ ] Signing secret copied and added to Supabase

**Testing:**
- [ ] CORS error gone
- [ ] Can access subscription page
- [ ] Payment form loads
- [ ] Logs appear in Supabase when testing

---

## 🎉 DONE!

Once all steps are complete:
- ✅ CORS error will be fixed
- ✅ Subscriptions will work
- ✅ Payments will process
- ✅ Webhooks will update database

**Your subscription system is now fully functional!**
