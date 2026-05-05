# Render Deployment - Quick Start Checklist

## ⚡ 5-Minute Deployment Guide

Follow these steps to deploy your site to Render in minutes.

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] GitHub repository with latest code pushed
- [ ] Supabase project URL and anon key
- [ ] Stripe keys (if using payments)
- [ ] reCAPTCHA keys (if using captcha)
- [ ] Render.com account created

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub (2 minutes)

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Service (1 minute)

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Render auto-detects `render.yaml` ✅

### Step 3: Add Environment Variables (2 minutes)

Click **"Environment"** tab and add:

**Required:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Optional (if using):**
```
VITE_RECAPTCHA_SITE_KEY=your-site-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Step 4: Deploy! (3-5 minutes)

1. Click **"Create Web Service"**
2. Wait for build to complete
3. Your site is live! 🎉

**Your URL:** `https://preparedness-for-war.onrender.com`

---

## 🔧 Post-Deployment Configuration

### Update Supabase (1 minute)

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL:** `https://preparedness-for-war.onrender.com`
3. Add **Redirect URL:** `https://preparedness-for-war.onrender.com/**`

### Update Stripe Webhooks (if using payments)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://preparedness-for-war.onrender.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`

---

## 🧪 Test Your Deployment

Visit your site and verify:

- [ ] Homepage loads
- [ ] Login/Signup works
- [ ] Posts display correctly
- [ ] Images load
- [ ] Admin panel accessible
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎯 You're Live!

**Congratulations!** Your site is now deployed on Render.

**Next Steps:**
1. Share your URL with users
2. Monitor logs in Render dashboard
3. Set up custom domain (optional)
4. Upgrade to Starter plan for better performance ($7/month)

---

## 🔄 Future Deployments

Every time you push to GitHub, Render automatically deploys:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render automatically deploys! 🚀
```

---

## 📚 Need More Help?

- **Full Guide:** See `RENDER_DEPLOYMENT_GUIDE.md`
- **Render Docs:** [https://render.com/docs](https://render.com/docs)
- **Render Support:** support@render.com

---

## 💡 Pro Tips

1. **Free Tier:** Spins down after 15 min inactivity (first request takes ~30 seconds)
2. **Starter Tier ($7/mo):** Always running, much faster
3. **Custom Domain:** Free SSL certificate included
4. **Logs:** Check Render dashboard for errors
5. **Environment Variables:** Changes require manual redeploy

---

**Happy Deploying! 🎉**
