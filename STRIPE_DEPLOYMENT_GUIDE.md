# 🚀 STRIPE SUBSCRIPTION DEPLOYMENT GUIDE

## Overview
This guide will help you deploy the Stripe Checkout subscription system.

---

## 📋 PREREQUISITES

1. **New Stripe Secret Key** - Get from Stripe Dashboard → Developers → API Keys
2. **Supabase Account** - Access to your project dashboard
3. **Supabase CLI** (optional but recommended) - For deploying Edge Functions

---

## 🎯 DEPLOYMENT STEPS

### **STEP 1: Deploy Edge Function to Supabase**

The Edge Function code is ready in: `supabase/functions/create-checkout-session/index.ts`

**Option A: Via Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Navigate to project
cd preparednessforwar

# Link to your project
supabase link --project-ref xfbmpjgcfohewejdzlfw

# Deploy the function
supabase functions deploy create-checkout-session

# Verify deployment
supabase functions list
```

**Option B: Via Supabase Dashboard (Manual)**

1. Go to: https://supabase.com/dashboard/project/xfbmpjgcfohewejdzlfw/functions
2. Click **"Create a new function"**
3. Name: `create-checkout-session`
4. Copy code from `supabase/functions/create-checkout-session/index.ts`
5. Paste into editor
6. Click **"Deploy function"**

---

### **STEP 2: Add Stripe Secret to Supabase**

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/xfbmpjgcfohewejdzlfw/settings/functions

2. **Click "Manage secrets"**

3. **Add STRIPE_SECRET_KEY**
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your new Stripe secret key from Stripe Dashboard
   - Format: `sk_live_...` (for production) or `sk_test_...` (for testing)

4. **Click "Save"**

5. **Wait 1-2 minutes** for the secret to propagate

---

### **STEP 3: Update Render Environment Variables** (Optional)

If you're using the Stripe key in your frontend (not recommended), update Render:

1. Go to Render Dashboard → Your Service
2. Go to **Environment** tab
3. Find or add `STRIPE_SECRET_KEY`
4. Update with your new key
5. Save (triggers automatic redeploy)

---

### **STEP 4: Verify Deployment**

1. **Check Function Status**
   - Go to Supabase Dashboard → Edge Functions
   - Verify `create-checkout-session` shows as "Deployed"

2. **Check Function Logs**
   - Click on the function
   - Go to "Logs" tab
   - Keep this open for testing

3. **Test Subscription Flow**
   - Go to your site: https://preparednessforwar.onrender.com
   - Login as a member
   - Go to Subscribe page
   - Click "Subscribe" on any plan
   - Should redirect to Stripe Checkout page
   - Check logs for any errors

---

## 🧪 TESTING

### **Test with Stripe Test Cards**

Use these test card numbers on Stripe Checkout:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Any future expiry date, any CVC, any ZIP code.

### **Expected Behavior**

1. ✅ Click "Subscribe" → Redirects to Stripe Checkout
2. ✅ Stripe page shows correct plan and price
3. ✅ Can enter card details
4. ✅ Payment processes successfully
5. ✅ Redirects back to your site
6. ✅ Subscription appears in database

---

## 🔍 TROUBLESHOOTING

### **Error: "Expired API Key"**
- Make sure you updated the secret in Supabase
- Wait 2 minutes after updating
- Redeploy the function

### **Error: "Function not found" or 404**
- Function not deployed yet
- Deploy using steps above

### **Error: "Not authenticated" or 400**
- User not logged in
- Try logout and login again
- Check browser console for auth errors

### **Error: "Plan not found"**
- Subscription plans not created in database
- Run: `database/CREATE_SUBSCRIPTION_PLANS.sql`

---

## 📊 MONITORING

### **Check Edge Function Logs**
1. Supabase Dashboard → Edge Functions
2. Click `create-checkout-session`
3. Go to "Logs" tab
4. Watch for errors during testing

### **Check Stripe Dashboard**
1. Go to: https://dashboard.stripe.com/test/payments
2. See all test payments
3. Check for successful charges

---

## ✅ SUCCESS CHECKLIST

- [ ] Edge Function deployed to Supabase
- [ ] STRIPE_SECRET_KEY added to Supabase secrets
- [ ] Function shows as "Deployed" in dashboard
- [ ] Test subscription redirects to Stripe Checkout
- [ ] Stripe page shows correct plan details
- [ ] Test payment completes successfully
- [ ] No errors in Edge Function logs
- [ ] No errors in browser console

---

## 🎉 NEXT STEPS

Once subscriptions are working:

1. **Configure Webhook** (for production)
   - Stripe Dashboard → Webhooks
   - Add endpoint: `https://xfbmpjgcfohewejdzlfw.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy webhook secret
   - Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

2. **Test Subscription Management**
   - Check admin dashboard shows subscriptions
   - Verify user gets access to premium content
   - Test subscription expiry

3. **Switch to Live Mode**
   - Use live Stripe keys (sk_live_...)
   - Test with real card
   - Monitor in production

---

## 📞 SUPPORT

If you encounter issues:

1. Check Edge Function logs in Supabase
2. Check browser console for errors
3. Verify all secrets are set correctly
4. Ensure subscription plans exist in database

---

**Your subscription system is ready to go live!** 🚀
