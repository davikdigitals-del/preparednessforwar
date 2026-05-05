# Deploy to Render - Complete Step-by-Step Guide

## 🚀 Your Complete Deployment Guide with Actual Credentials

Follow these exact steps to deploy your Preparedness For War website to Render.com.

---

## ✅ Pre-Flight Check

Your repository is ready! All code is pushed to GitHub and configured for Render deployment.

**What's Already Done:**
- ✅ `render.yaml` configured
- ✅ `server.js` production server created
- ✅ `package.json` updated with start script
- ✅ All code pushed to GitHub
- ✅ `.env` file protected (not in git)

---

## 🌐 Step 1: Sign Up / Log In to Render (2 minutes)

### 1.1 Go to Render
Visit: [https://render.com](https://render.com)

### 1.2 Sign Up with GitHub
1. Click **"Get Started for Free"** or **"Sign In"**
2. Choose **"Sign in with GitHub"**
3. Authorize Render to access your repositories
4. Complete your profile if prompted

---

## 🔗 Step 2: Connect Your Repository (2 minutes)

### 2.1 Create New Web Service
1. In Render Dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**

### 2.2 Connect Repository
1. You'll see a list of your GitHub repositories
2. Find: **"sentinel-network-main"** or your repository name
3. Click **"Connect"**

**If you don't see your repository:**
- Click **"Configure account"**
- Grant Render access to the repository
- Return and refresh the page

---

## ⚙️ Step 3: Configure Service Settings (3 minutes)

Render will auto-detect your `render.yaml` file. Verify these settings:

### 3.1 Basic Settings

| Setting | Value |
|---------|-------|
| **Name** | `preparedness-for-war` |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### 3.2 Instance Type

**For Testing (Free):**
- Select: **Free**
- Note: Spins down after 15 min inactivity

**For Production (Recommended):**
- Select: **Starter** ($7/month)
- Always running, much faster

**Choose Free for now, you can upgrade later!**

---

## 🔐 Step 4: Add Environment Variables (5 minutes)

This is the most important step! Click the **"Environment"** tab.

### 4.1 Add Each Variable

Click **"Add Environment Variable"** for each of these:

#### Variable 1: Supabase URL
```
Key: VITE_SUPABASE_URL
Value: https://xfbmpjgcfohewejdzlfw.supabase.co
```

#### Variable 2: Supabase Anon Key
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYm1wamdjZm9oZXdlamR6bGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODYyMDcsImV4cCI6MjA5MjU2MjIwN30.RrppC-u01_0Tv7GXBXsKGCZJ4xUBS8YzYoGeXwycxRA
```

#### Variable 3: reCAPTCHA Site Key
```
Key: VITE_RECAPTCHA_SITE_KEY
Value: 6LfW3NgsAAAAAJg_iOTfx5Swt6bLqjqf0NWV0F3_
```

#### Variable 4: Stripe Publishable Key
```
Key: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_live_51TSmrV6AEy5p66QTYUi2M7obDhCW8lgilg0ND05kzLk47m3pdaWYvjvfz7f4yvrVFH5mTn7ez2hHQBEQ31FQnzwT004ejGIVeA
```

#### Variable 5: Stripe Secret Key
```
Key: STRIPE_SECRET_KEY
Value: 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
```

#### Variable 6: Node Version (Auto-added)
```
Key: NODE_VERSION
Value: 20.11.0
```

### 4.2 Verify All Variables

Make sure you have **6 environment variables** total:
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_RECAPTCHA_SITE_KEY
- ✅ VITE_STRIPE_PUBLISHABLE_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ NODE_VERSION

---

## 🚀 Step 5: Deploy! (5-7 minutes)

### 5.1 Start Deployment

1. Scroll to the bottom of the page
2. Click **"Create Web Service"** button
3. Render will start building your app

### 5.2 Watch Build Progress

You'll see the build logs in real-time:

```
==> Cloning from https://github.com/...
==> Checking out commit...
==> Running build command: npm install && npm run build
==> Installing dependencies...
==> Building Vite project...
==> Build completed successfully!
==> Starting service: npm start
==> Server is running on port 10000
==> Your service is live!
```

**Build Time:** 5-7 minutes for first deployment

### 5.3 Deployment Complete! 🎉

Once you see **"Your service is live"**, your site is deployed!

**Your Live URL:**
```
https://preparedness-for-war.onrender.com
```

Or check the URL shown in your Render dashboard.

---

## 🔧 Step 6: Configure Supabase (2 minutes)

Now that your site is live, update Supabase to allow authentication from your Render URL.

### 6.1 Update Site URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **xfbmpjgcfohewejdzlfw**
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to:
   ```
   https://preparedness-for-war.onrender.com
   ```

### 6.2 Add Redirect URLs

In the same page, add to **Redirect URLs:**
```
https://preparedness-for-war.onrender.com/**
```

Click **"Save"**

---

## 💳 Step 7: Configure Stripe Webhooks (3 minutes)

### 7.1 Add Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter **Endpoint URL:**
   ```
   https://preparedness-for-war.onrender.com/api/stripe-webhook
   ```

### 7.2 Select Events

Select these events to listen for:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 7.3 Save Webhook

1. Click **"Add endpoint"**
2. Copy the **Signing Secret** (starts with `whsec_...`)
3. Go back to Render → Environment
4. Add new variable:
   ```
   Key: STRIPE_WEBHOOK_SECRET
   Value: whsec_your_signing_secret_here
   ```
5. Click **"Save Changes"**

---

## 🧪 Step 8: Test Your Deployment (5 minutes)

### 8.1 Visit Your Site

Open: `https://preparedness-for-war.onrender.com`

### 8.2 Test Core Features

- [ ] Homepage loads correctly
- [ ] Images display properly
- [ ] Navigation works (click menu items)
- [ ] Login page loads
- [ ] Signup page loads
- [ ] Posts display on homepage
- [ ] Click on a post to view article
- [ ] Mobile menu works (resize browser)

### 8.3 Test Authentication

1. Click **"Sign Up"**
2. Create a test account
3. Check email for verification
4. Log in with your account
5. Access member dashboard

### 8.4 Test Admin Panel (if admin)

1. First, make yourself admin in Supabase:
   - Go to Supabase → SQL Editor
   - Run: `UPDATE profiles SET is_admin = true, role = 'admin' WHERE email = 'your-email@example.com';`
2. Visit: `https://preparedness-for-war.onrender.com/admin`
3. Verify admin dashboard loads

### 8.5 Check Browser Console

1. Open DevTools (F12)
2. Check Console tab
3. Should see no errors (ignore Chrome extension warnings)

---

## 📱 Step 9: Test Mobile Responsiveness (3 minutes)

### 9.1 Test on Desktop

1. Resize browser window to different sizes
2. Verify layout adapts correctly
3. Test hamburger menu on narrow widths

### 9.2 Test on Real Devices

**On Your Phone:**
1. Open browser (Safari/Chrome)
2. Visit: `https://preparedness-for-war.onrender.com`
3. Test navigation, scrolling, and interactions
4. Verify touch targets are easy to tap

**Test on:**
- [ ] iPhone (any model)
- [ ] Android phone
- [ ] Tablet (if available)

---

## 🎯 Step 10: Run Database Setup (5 minutes)

Your database needs to be set up with sections and categories.

### 10.1 Run Database Scripts

Go to Supabase → SQL Editor and run these scripts **in order:**

#### Script 1: Update Sections and Categories
```sql
-- Copy and paste from: database/UPDATE_SECTIONS_AND_CATEGORIES.sql
```

#### Script 2: Fix Posts Section Field
```sql
-- Copy and paste from: database/FIX_POSTS_SECTION_FIELD.sql
```

#### Script 3: Make Yourself Admin
```sql
-- Copy and paste from: database/MAKE_ME_ADMIN.sql
-- Or run this:
UPDATE profiles SET is_admin = true, role = 'admin' WHERE id = auth.uid();
```

### 10.2 Verify Database Setup

Run this query to check:
```sql
SELECT COUNT(*) as section_count FROM sections;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as post_count FROM posts;
```

You should see:
- 8 sections
- 36 categories
- Your posts (if any)

---

## 🔄 Step 11: Set Up Automatic Deployments (Already Done!)

Good news! Automatic deployments are already configured.

**How it works:**
1. You make changes locally
2. Commit: `git add . && git commit -m "Update"`
3. Push: `git push origin main`
4. Render automatically detects the push
5. Builds and deploys new version
6. Your site updates in 3-5 minutes! 🚀

**No manual deployment needed!**

---

## 📊 Step 12: Monitor Your Application

### 12.1 View Logs

In Render Dashboard:
1. Click **"Logs"** tab
2. See real-time application logs
3. Monitor for errors

### 12.2 Check Metrics

In Render Dashboard:
1. Click **"Metrics"** tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### 12.3 Set Up Alerts (Optional)

1. Go to **Settings** → **Notifications**
2. Add your email
3. Get notified of:
   - Deploy failures
   - Service downtime
   - High resource usage

---

## 🌍 Step 13: Add Custom Domain (Optional)

### 13.1 Purchase Domain

Buy a domain from:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare

### 13.2 Add to Render

1. In Render Dashboard → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `preparednessforwar.com`)
4. Render provides DNS records

### 13.3 Update DNS

In your domain registrar:

**A Record (Root Domain):**
```
Type: A
Name: @
Value: [IP from Render]
TTL: 3600
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: preparedness-for-war.onrender.com
TTL: 3600
```

### 13.4 Wait for DNS Propagation

- Takes 1-24 hours
- Render auto-provisions SSL certificate
- Your site will be accessible at your custom domain

---

## 🚨 Important: Stripe Key Security

### ⚠️ CRITICAL REMINDER

Your Stripe keys were exposed in this chat. After deployment:

1. **Go to Stripe Dashboard** → **Developers** → **API Keys**
2. **Roll/Delete** both keys:
   - Secret Key: `sk_live_51TSmrV6AEy5p66QT...`
   - Publishable Key: `pk_live_51TSmrV6AEy5p66QT...`
3. **Generate new keys**
4. **Update in Render:**
   - Go to Environment tab
   - Update `VITE_STRIPE_PUBLISHABLE_KEY`
   - Update `STRIPE_SECRET_KEY`
   - Click "Save Changes"
5. **Redeploy** (Render will auto-redeploy after env var change)

**Do this within 24 hours of deployment!**

---

## ✅ Deployment Checklist

Before considering deployment complete:

### Pre-Deployment
- [x] Code pushed to GitHub
- [x] `render.yaml` configured
- [x] Environment variables ready

### Deployment
- [ ] Render service created
- [ ] All 6 environment variables added
- [ ] Build completed successfully
- [ ] Service is live

### Post-Deployment
- [ ] Supabase URL configuration updated
- [ ] Stripe webhooks configured
- [ ] Database scripts run
- [ ] Admin user created
- [ ] Site tested (homepage, login, posts)
- [ ] Mobile responsiveness verified
- [ ] Browser console checked (no errors)
- [ ] Stripe keys rolled/regenerated

### Optional
- [ ] Custom domain added
- [ ] Monitoring/alerts set up
- [ ] Analytics added (Google Analytics)
- [ ] Upgraded to Starter plan ($7/mo)

---

## 🎉 Congratulations!

Your Preparedness For War website is now **LIVE** on Render!

**Your Live Site:**
```
🌐 https://preparedness-for-war.onrender.com
```

### What's Next?

1. **Share your site** with users
2. **Create content** (posts, videos, resources)
3. **Monitor performance** in Render dashboard
4. **Roll Stripe keys** for security
5. **Consider upgrading** to Starter plan for better performance

---

## 📚 Additional Resources

### Documentation
- `RENDER_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `RENDER_QUICK_START.md` - Quick reference
- `STRIPE_SETUP_GUIDE.md` - Stripe integration
- `MOBILE_RESPONSIVE_COMPLETE.md` - Mobile features
- `MEGA_MENU_GUIDE.md` - Navigation system

### Support
- **Render Docs:** [https://render.com/docs](https://render.com/docs)
- **Render Community:** [https://community.render.com](https://community.render.com)
- **Render Support:** support@render.com
- **Render Status:** [https://status.render.com](https://status.render.com)

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all environment variables are set
- Try deploying again (click "Manual Deploy")

### Site Not Loading
- Check if service is "Live" in dashboard
- Wait 30 seconds (free tier spins up)
- Check logs for errors

### Login Not Working
- Verify Supabase URL configuration
- Check environment variables are correct
- Ensure Supabase project is active

### Payments Not Working
- Verify Stripe keys are correct
- Check webhook is configured
- Test with Stripe test mode first

---

**You're all set! Happy deploying! 🚀**
