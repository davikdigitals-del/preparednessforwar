# TEST EDGE FUNCTION SETUP

## 🧪 VERIFY EVERYTHING IS WORKING

### **TEST 1: Check Secrets Are Set**

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Scroll to "Secrets" section
3. You should see these 3 secrets:
   - ✅ `STRIPE_SECRET_KEY`
   - ✅ `STRIPE_WEBHOOK_SECRET`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

**If any are missing, add them now!**

---

### **TEST 2: Check Plans Exist**

1. Go to Supabase Dashboard → Table Editor
2. Click on `subscription_plans` table
3. You should see 2 rows:
   - Monthly Premium - $9.99
   - Annual Premium - $95.99

**If no plans, run the SQL again:**
- SQL Editor → New query → Paste `CREATE_SUBSCRIPTION_PLANS.sql` → Run

---

### **TEST 3: Check Edge Function Logs**

1. Go to Supabase Dashboard → Edge Functions
2. Click on `create-payment-intent`
3. Click "Logs" tab
4. Try subscribing on your site
5. **Look for the error message**

**Common errors and fixes:**

**Error: "STRIPE_SECRET_KEY is not defined"**
```
Fix: Add STRIPE_SECRET_KEY secret in Supabase
```

**Error: "Plan not found"**
```
Fix: Run CREATE_SUBSCRIPTION_PLANS.sql in SQL Editor
```

**Error: "Invalid API Key provided"**
```
Fix: Check that STRIPE_SECRET_KEY is correct (starts with sk_live_...)
```

**Error: "Not authenticated"**
```
Fix: Make sure you're logged in before subscribing
```

---

### **TEST 4: Manual API Test**

You can test the Edge Function directly using curl:

```bash
curl -X POST https://xfbmpjgcfohewejdzlfw.supabase.co/functions/v1/create-payment-intent \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"planId": "5a5dfb1a-674e-45cc-9f5a-3a029fa2469b"}'
```

Replace `YOUR_SUPABASE_ANON_KEY` with your anon key from Project Settings → API

**Expected response:**
- Success: `{"clientSecret": "pi_...", "amount": 9.99, "currency": "USD"}`
- Error: `{"error": "..."}`

---

### **TEST 5: Check Browser Console**

1. Open your site
2. Press F12 to open Developer Tools
3. Go to "Network" tab
4. Try subscribing
5. Click on the `create-payment-intent` request
6. Click "Response" tab
7. **What does it say?**

---

## 🔍 DEBUGGING CHECKLIST

If still getting 400 error, check these:

**Secrets:**
- [ ] STRIPE_SECRET_KEY is set (check it starts with `sk_live_`)
- [ ] STRIPE_WEBHOOK_SECRET is set (starts with `whsec_`)
- [ ] SUPABASE_SERVICE_ROLE_KEY is set (starts with `eyJhbGci`)

**Database:**
- [ ] subscription_plans table exists
- [ ] 2 plans exist in the table
- [ ] Plan IDs match (5a5dfb1a-674e-45cc-9f5a-3a029fa2469b)

**Edge Function:**
- [ ] Function is deployed (shows "Active" status)
- [ ] Function code is correct (check in Supabase)
- [ ] Logs show requests coming in

**User:**
- [ ] User is logged in (check header shows "Dashboard")
- [ ] User session is valid (not expired)

---

## 📊 WHAT TO SHARE

To help debug, please share:

1. **Edge Function logs** - The exact error message
2. **Browser console** - The response from the API call
3. **Which test fails** - From the tests above

---

## 🎯 MOST LIKELY ISSUES

Based on the 400 error, it's usually one of these:

1. **Secrets not set** (90% of cases)
   - Solution: Add all 3 secrets in Supabase

2. **Plans don't exist** (8% of cases)
   - Solution: Run CREATE_SUBSCRIPTION_PLANS.sql

3. **Wrong Stripe key** (2% of cases)
   - Solution: Verify STRIPE_SECRET_KEY is correct

---

**Check the Edge Function logs and share the error message!**
