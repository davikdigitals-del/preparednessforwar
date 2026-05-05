# Render.com Deployment Guide

## 🚀 Complete Setup Guide for Deploying to Render

This guide will walk you through deploying your Preparedness For War website to Render.com.

---

## 📋 Prerequisites

Before you start, make sure you have:

1. ✅ A GitHub account with your code pushed to a repository
2. ✅ A Render.com account (free tier available)
3. ✅ Supabase project set up and running
4. ✅ All environment variables ready (Supabase, Stripe, reCAPTCHA)

---

## 🔧 Step 1: Prepare Your Repository

### 1.1 Ensure All Files Are Committed

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Verify render.yaml Exists

Your project already has a `render.yaml` file configured. This file tells Render how to build and deploy your app.

---

## 🌐 Step 2: Create a New Web Service on Render

### 2.1 Sign Up / Log In to Render

1. Go to [https://render.com](https://render.com)
2. Sign up or log in with your GitHub account
3. Authorize Render to access your repositories

### 2.2 Create New Web Service

1. Click **"New +"** button in the top right
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Search for your repository name
   - Click **"Connect"**

### 2.3 Configure Service Settings

Render will auto-detect your `render.yaml` file, but verify these settings:

**Basic Settings:**
- **Name:** `preparedness-for-war` (or your preferred name)
- **Region:** Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch:** `main` (or your default branch)
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run preview -- --host 0.0.0.0 --port $PORT`

**Instance Type:**
- **Free** (for testing) or **Starter** ($7/month for production)

---

## 🔐 Step 3: Configure Environment Variables

In the Render dashboard, go to **Environment** tab and add these variables:

### Required Variables

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API |
| `NODE_VERSION` | `20.11.0` | Already set in render.yaml |

### Optional Variables (if using these features)

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `VITE_RECAPTCHA_SITE_KEY` | Your reCAPTCHA site key | Google reCAPTCHA Admin Console |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | Stripe Dashboard → Developers → API Keys |

### How to Add Environment Variables

1. In your Render service dashboard, click **"Environment"** in the left sidebar
2. Click **"Add Environment Variable"**
3. Enter the **Key** and **Value**
4. Click **"Save Changes"**
5. Repeat for all variables

**⚠️ Important:** Use **LIVE/PRODUCTION** keys for Stripe and reCAPTCHA, not test keys!

---

## 🏗️ Step 4: Deploy Your Application

### 4.1 Trigger First Deployment

1. After adding all environment variables, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Or simply click **"Create Web Service"** if this is your first deployment

### 4.2 Monitor Build Process

Watch the build logs in real-time:
- ✅ Installing dependencies
- ✅ Building Vite project
- ✅ Starting preview server
- ✅ Service is live!

**Build time:** Usually 3-5 minutes for first deployment

### 4.3 Check Deployment Status

Once deployed, you'll see:
- ✅ **Status:** Live
- 🌐 **URL:** `https://preparedness-for-war.onrender.com` (or your custom domain)

---

## 🌍 Step 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In Render dashboard, go to **"Settings"** → **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `preparednessforwar.com`)
4. Render will provide DNS records

### 5.2 Update DNS Settings

In your domain registrar (GoDaddy, Namecheap, etc.):

**For Root Domain (preparednessforwar.com):**
- Type: `A`
- Name: `@`
- Value: Render's IP address (shown in dashboard)

**For Subdomain (www.preparednessforwar.com):**
- Type: `CNAME`
- Name: `www`
- Value: `preparedness-for-war.onrender.com`

**SSL Certificate:**
- ✅ Render automatically provisions free SSL certificates
- ✅ HTTPS is enabled by default

---

## 🔄 Step 6: Configure Supabase for Production

### 6.1 Update Supabase Site URL

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Render URL to **Site URL:**
   ```
   https://preparedness-for-war.onrender.com
   ```
3. Add to **Redirect URLs:**
   ```
   https://preparedness-for-war.onrender.com/**
   ```

### 6.2 Update CORS Settings (if needed)

In Supabase Dashboard → **Settings** → **API**:
- Ensure your Render URL is allowed in CORS settings

---

## 🔧 Step 7: Configure Stripe Webhooks (if using payments)

### 7.1 Add Webhook Endpoint

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://preparedness-for-war.onrender.com/api/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** and add it to Render environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Step 8: Test Your Deployment

### 8.1 Basic Functionality Tests

Visit your deployed site and test:

- ✅ Homepage loads correctly
- ✅ Navigation works
- ✅ Images display properly
- ✅ Login/Signup works
- ✅ Posts display correctly
- ✅ Admin panel accessible (if admin)
- ✅ Premium features work (if using Stripe)
- ✅ Mobile responsiveness

### 8.2 Check Browser Console

Open browser DevTools (F12) and check for:
- ❌ No console errors
- ❌ No 404 errors for assets
- ❌ No CORS errors

### 8.3 Test on Multiple Devices

- 📱 iPhone/Android
- 💻 Desktop browsers (Chrome, Firefox, Safari)
- 📱 Tablet

---

## 🔄 Step 9: Set Up Automatic Deployments

### 9.1 Enable Auto-Deploy

Render automatically deploys when you push to your main branch:

1. Go to **Settings** → **Build & Deploy**
2. Ensure **"Auto-Deploy"** is set to **"Yes"**
3. Select branch: **main**

### 9.2 Deploy Workflow

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render automatically:
# 1. Detects the push
# 2. Pulls latest code
# 3. Runs build command
# 4. Deploys new version
# 5. Your site is updated! 🎉
```

---

## 📊 Step 10: Monitor Your Application

### 10.1 View Logs

In Render dashboard:
- Click **"Logs"** to see real-time application logs
- Monitor for errors or issues

### 10.2 Check Metrics

In Render dashboard:
- **Metrics** tab shows:
  - CPU usage
  - Memory usage
  - Request count
  - Response times

### 10.3 Set Up Alerts (Optional)

1. Go to **Settings** → **Notifications**
2. Add email or Slack webhook
3. Get notified of:
   - Deploy failures
   - Service downtime
   - High resource usage

---

## 🚨 Troubleshooting Common Issues

### Issue 1: Build Fails

**Error:** `npm install` fails

**Solution:**
```bash
# Locally, delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### Issue 2: Environment Variables Not Working

**Error:** Supabase connection fails

**Solution:**
1. Check environment variables are set correctly in Render
2. Ensure variable names start with `VITE_` for client-side access
3. Redeploy after adding/changing environment variables

### Issue 3: 404 on Page Refresh

**Error:** Refreshing a page shows 404

**Solution:** This is already handled by Vite's preview server, but if issues persist:
1. Check `vite.config.ts` has proper history fallback
2. Ensure start command includes `--host 0.0.0.0`

### Issue 4: Slow Performance

**Solution:**
1. Upgrade from Free tier to Starter ($7/month)
2. Free tier spins down after 15 minutes of inactivity
3. Starter tier is always running

### Issue 5: Images Not Loading

**Solution:**
1. Check image URLs are absolute (not relative)
2. Ensure Supabase storage buckets are public
3. Check CORS settings in Supabase

---

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic SSL
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM
- ⚠️ 0.1 CPU

### Starter Tier ($7/month)
- ✅ Always running (no spin down)
- ✅ 512 MB RAM
- ✅ 0.5 CPU
- ✅ Better performance
- ✅ Recommended for production

### Pro Tier ($25/month)
- ✅ 2 GB RAM
- ✅ 1 CPU
- ✅ High performance
- ✅ For high-traffic sites

---

## 🎯 Production Checklist

Before going live, ensure:

- ✅ All environment variables are set (production keys)
- ✅ Supabase URL configuration updated
- ✅ Stripe webhooks configured (if using payments)
- ✅ Custom domain configured (optional)
- ✅ SSL certificate active (automatic)
- ✅ Database migrations run in Supabase
- ✅ Admin user created in database
- ✅ Test all critical features
- ✅ Mobile responsiveness verified
- ✅ Browser compatibility tested
- ✅ Performance optimized
- ✅ Error monitoring set up
- ✅ Backup strategy in place

---

## 📚 Additional Resources

### Render Documentation
- [Render Docs](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)

### Your Project Documentation
- `README.md` - Project overview
- `STRIPE_SETUP_GUIDE.md` - Stripe integration
- `GOOGLE_SIGNIN_SETUP.md` - Google OAuth
- `MOBILE_RESPONSIVE_COMPLETE.md` - Mobile features
- `MEGA_MENU_GUIDE.md` - Navigation system

---

## 🆘 Getting Help

### Render Support
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)
- Email: support@render.com

### Your Project Issues
- Check browser console for errors
- Review Render logs for server errors
- Verify environment variables are correct
- Test locally with `npm run build && npm run preview`

---

## 🎉 You're Live!

Congratulations! Your Preparedness For War website is now deployed on Render.

**Your site is accessible at:**
- 🌐 `https://preparedness-for-war.onrender.com`
- 🌐 Your custom domain (if configured)

**Next Steps:**
1. Share your site URL
2. Monitor performance and logs
3. Set up analytics (Google Analytics, etc.)
4. Plan for scaling as traffic grows

---

## 🔄 Continuous Deployment Workflow

```bash
# Development workflow
1. Make changes locally
2. Test with: npm run dev
3. Build test: npm run build && npm run preview
4. Commit: git add . && git commit -m "Your message"
5. Push: git push origin main
6. Render automatically deploys! 🚀
7. Check deployment in Render dashboard
8. Test live site
```

---

## 📝 Quick Reference Commands

```bash
# Local development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Git deployment
git add .                      # Stage changes
git commit -m "message"        # Commit changes
git push origin main           # Deploy to Render

# Check deployment
# Visit: https://dashboard.render.com
# View logs and metrics
```

---

**Happy Deploying! 🚀**
