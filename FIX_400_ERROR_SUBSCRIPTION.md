# FIX 400 ERROR ON SUBSCRIPTION PAGE

## 🎉 GOOD NEWS!
The Edge Function is now deployed! The error changed from **404** to **400**, which means:
- ✅ Function exists and is responding
- ❌ But it's returning an error

## 🔴 THE PROBLEM
**400 Bad Request** error means one of these:
1. Missing Stripe secret key in Supabase
2. No subscription plans in database
3. Invalid plan ID

## ✅ SOLUTION

### **STEP 1: Add Secrets to Supabase** (If not done yet)

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/xfbmpjgcfohewejdzlfw

2. **Get Service Role Key**
   - Go to **Project Settings** → **API**
   - Find **"service_role"** key
   - Click eye icon to reveal
   - Copy it (starts with `eyJhbGci...`)

3. **Add Secrets**
   - Go to **Edge Functions** → **Manage secrets**
   - Add these 3 secrets:

   **Secret 1:**
   ```
   Name: STRIPE_SECRET_KEY
   Value: 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
   ```

   **Secret 2:**
   ```
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_mBHUYW8UeBQfV8PSOp2DO2E8fV7RnVme
   ```

   **Secret 3:**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: (Paste the service_role key you copied)
   ```

---

### **STEP 2: Create Subscription Plans in Database**

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/xfbmpjgcfohewejdzlfw

2. **Open SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

3. **Run This SQL**
   - Copy ALL the code from: `database/CREATE_SUBSCRIPTION_PLANS.sql`
   - Paste into SQL Editor
   - Click **"Run"** button

4. **Verify Plans Created**
   - At the bottom of results, you should see:
     ```
     Monthly Premium - $9.99 - month
     Annual Premium - $95.99 - year
     ```

---

### **STEP 3: Test Again**

1. Go to your site
2. Hard refresh (Ctrl+Shift+R)
3. Login as member
4. Go to subscription page
5. Click "Subscribe" button
6. **400 error should be GONE!**

---

## 🔍 HOW TO DEBUG

### **Check Edge Function Logs**

1. In Supabase Dashboard → Edge Functions
2. Click on `create-payment-intent`
3. Click **"Logs"** tab
4. Try subscribing on your site
5. Look at the error message in logs

**Common errors:**

**Error: "Not authenticated"**
- Solution: Make sure you're logged in before subscribing

**Error: "Plan not found"**
- Solution: Run the SQL to create subscription plans (Step 2)

**Error: "STRIPE_SECRET_KEY is not defined"**
- Solution: Add the secret in Supabase (Step 1)

**Error: "Invalid API Key"**
- Solution: Check that STRIPE_SECRET_KEY is correct

---

## 📋 QUICK CHECKLIST

**Edge Function:**
- [x] Function deployed (you have this - error is 400 not 404)
- [ ] STRIPE_SECRET_KEY secret added
- [ ] STRIPE_WEBHOOK_SECRET secret added
- [ ] SUPABASE_SERVICE_ROLE_KEY secret added

**Database:**
- [ ] subscription_plans table exists
- [ ] Plans created (Monthly and Annual)
- [ ] RLS policies set

**Testing:**
- [ ] Can access subscription page
- [ ] Can see plan options
- [ ] Can click subscribe button
- [ ] Payment form loads (no 400 error)

---

## 🎯 EXPECTED FLOW AFTER FIX

1. User clicks "Subscribe"
2. Edge Function receives request
3. Checks user is authenticated ✅
4. Finds plan in database ✅
5. Creates Stripe payment intent ✅
6. Returns client secret ✅
7. Payment form loads ✅
8. User enters card details
9. Payment processes
10. Webhook updates database
11. User gets premium access

---

## ⚠️ IMPORTANT NOTES

1. **You're using LIVE Stripe keys** - Real payments will be charged!
2. **Test with test cards** first:
   - Card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

3. **Check Stripe Dashboard** to see test payments

---

## 🚀 AFTER EVERYTHING WORKS

Once subscriptions work:

1. **Test the full flow:**
   - Subscribe with test card
   - Check payment in Stripe Dashboard
   - Verify subscription in database
   - Check premium access works

2. **Monitor logs:**
   - Supabase Edge Functions logs
   - Stripe Dashboard logs
   - Browser console

3. **Set up webhook monitoring:**
   - Stripe Dashboard → Webhooks
   - Check webhook is receiving events
   - Verify events are processed

---

## 📞 NEED HELP?

If still getting 400 error after following all steps:

1. Check Edge Function logs for exact error message
2. Verify all 3 secrets are added
3. Verify subscription plans exist in database
4. Check browser console for more details
5. Share the exact error message from logs

---

**Follow Steps 1 and 2 above to fix the 400 error!** 🎉
