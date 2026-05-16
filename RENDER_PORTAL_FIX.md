# Fix Both Portals Not Working on Render

## 🔍 Problem Diagnosis

Both the **Admin Portal** (`/admin`) and **Member Dashboard** (`/dashboard`) are not working on Render. This is likely due to:

1. ❌ Environment variables not configured in Render
2. ❌ Build not completing successfully
3. ❌ Client-side routing (SPA) not configured properly
4. ❌ Supabase connection failing
5. ❌ Server not serving the built files correctly

---

## ✅ Solution: Step-by-Step Fix

### Step 1: Verify Environment Variables in Render

Go to your Render dashboard → Your service → **Environment** tab

**Required Variables (MUST be set):**

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_VERSION=20.11.0
```

**Optional (if using these features):**

```bash
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

⚠️ **CRITICAL:** Variable names MUST start with `VITE_` for client-side access!

**After adding/changing variables:**
1. Click **"Save Changes"**
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**

---

### Step 2: Fix Build Command in Render

Your current `render.yaml` has:
```yaml
buildCommand: npm install && npm run build
startCommand: npm start
```

This is correct, but let's verify the build works:

**Test locally first:**
```bash
cd preparednessforwar
npm install
npm run build
npm start
```

Then visit `http://localhost:3000` and test:
- ✅ Homepage loads
- ✅ `/admin-login` loads
- ✅ `/dashboard` loads (after login)
- ✅ Refresh works on all pages

---

### Step 3: Verify server.js is Correct

Your `server.js` should handle ALL routes and return `index.html` for client-side routing.

**Current server.js is correct:**
```javascript
// Handle client-side routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});
```

✅ This is already correct!

---

### Step 4: Update Render Configuration

**Option A: Update via Dashboard (Recommended)**

1. Go to Render Dashboard → Your Service → **Settings**
2. Verify these settings:

**Build & Deploy:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Auto-Deploy:** Yes

**Environment:**
- **Node Version:** 20.11.0 (set via `NODE_VERSION` env var)

**Health Check:**
- **Health Check Path:** `/` (or leave blank)

**Option B: Update render.yaml (Alternative)**

If you prefer to use the YAML file, ensure it looks like this:

```yaml
services:
  - type: web
    name: preparedness-for-war
    runtime: node
    plan: free
    branch: main
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 20.11.0
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
      - key: VITE_RECAPTCHA_SITE_KEY
        sync: false
      - key: VITE_STRIPE_PUBLISHABLE_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
    healthCheckPath: /
```

---

### Step 5: Configure Supabase for Production

**In Supabase Dashboard:**

1. Go to **Authentication** → **URL Configuration**

2. Set **Site URL:**
   ```
   https://your-app-name.onrender.com
   ```

3. Add **Redirect URLs:**
   ```
   https://your-app-name.onrender.com/**
   https://your-app-name.onrender.com/dashboard
   https://your-app-name.onrender.com/admin
   ```

4. Go to **Settings** → **API** → Verify CORS is enabled

---

### Step 6: Deploy with Clean Build

1. In Render Dashboard, go to **Manual Deploy**
2. Click **"Clear build cache & deploy"**
3. Watch the build logs for errors

**Expected build output:**
```
==> Installing dependencies
npm install
...
==> Building application
npm run build
vite v5.x.x building for production...
✓ built in 30s
...
==> Starting server
npm start
✅ Server is running on port 10000
```

---

### Step 7: Test Both Portals

Once deployed, test these URLs:

**Admin Portal:**
1. Visit: `https://your-app.onrender.com/admin-login`
2. Create admin account or login
3. Should redirect to: `https://your-app.onrender.com/admin`
4. Verify admin dashboard loads

**Member Portal:**
1. Visit: `https://your-app.onrender.com/login`
2. Login with member account
3. Should redirect to: `https://your-app.onrender.com/dashboard`
4. Verify member dashboard loads

**Test Refresh:**
1. On `/admin` page, press F5 (refresh)
2. Should stay on `/admin` (not 404)
3. On `/dashboard` page, press F5
4. Should stay on `/dashboard` (not 404)

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot GET /admin" or 404 on Refresh

**Cause:** Server not handling client-side routing

**Solution:**
- Verify `server.js` has the catch-all route: `app.get('*', ...)`
- Ensure `dist/index.html` exists after build
- Check Render logs for errors

### Issue 2: "Supabase client not initialized"

**Cause:** Environment variables not set or incorrect

**Solution:**
1. Check Render Environment tab
2. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Redeploy after adding variables
4. Check browser console for actual error

### Issue 3: Admin Login Works but Dashboard Shows "Loading..."

**Cause:** Database tables not set up or RLS policies blocking access

**Solution:**
1. Run database setup: `database/COMPLETE_SETUP_SINGLE_FILE.sql`
2. Verify `profiles` table exists
3. Verify `user_roles` table exists
4. Check RLS policies allow authenticated users

### Issue 4: "Invalid admin credentials" Even with Correct Password

**Cause:** User not marked as admin in database

**Solution:**
```sql
-- Run this in Supabase SQL Editor
UPDATE profiles 
SET is_admin = true, role = 'admin' 
WHERE email = 'your-admin-email@example.com';

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM profiles WHERE email = 'your-admin-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Issue 5: Free Tier Slow/Timeout on First Load

**Cause:** Render free tier spins down after 15 minutes of inactivity

**Solution:**
- First request takes 30-60 seconds to wake up
- Upgrade to Starter plan ($7/month) for always-on service
- Or accept the cold start delay

### Issue 6: Build Fails with "Out of Memory"

**Cause:** Render free tier has limited RAM (512MB)

**Solution:**
1. Reduce build size by removing unused dependencies
2. Or upgrade to Starter plan (512MB RAM, better performance)

---

## 🔍 Debugging Checklist

Use this checklist to diagnose issues:

**Environment:**
- [ ] `VITE_SUPABASE_URL` is set in Render
- [ ] `VITE_SUPABASE_ANON_KEY` is set in Render
- [ ] Variables start with `VITE_` prefix
- [ ] Redeployed after adding variables

**Build:**
- [ ] Build completes without errors
- [ ] `dist/` folder is created
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` contains JS/CSS files

**Server:**
- [ ] Server starts on correct port
- [ ] Logs show "Server is running on port X"
- [ ] Health check passes (green status in Render)

**Supabase:**
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added
- [ ] Database tables exist
- [ ] RLS policies configured

**Testing:**
- [ ] Homepage loads
- [ ] `/admin-login` loads
- [ ] Can create admin account
- [ ] Can login to admin portal
- [ ] `/dashboard` loads after member login
- [ ] Refresh works on all pages
- [ ] No console errors in browser

---

## 📊 View Logs in Render

To see what's happening:

1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Look for errors like:
   - `Cannot find module 'express'` → Build failed
   - `ENOENT: no such file or directory, open 'dist/index.html'` → Build didn't create dist folder
   - `Error: listen EADDRINUSE` → Port conflict (shouldn't happen on Render)

**Useful log commands:**
```bash
# In Render logs, look for:
"✅ Server is running on port"  # Server started successfully
"vite v5.x.x building"          # Build started
"✓ built in"                    # Build completed
"GET /admin 200"                # Successful request
"GET /admin 404"                # Failed request (routing issue)
```

---

## 🎯 Quick Fix Summary

**If both portals don't work, do this:**

1. **Set environment variables in Render:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Clear build cache and redeploy:**
   - Render Dashboard → Manual Deploy → Clear build cache & deploy

3. **Configure Supabase:**
   - Add your Render URL to Site URL and Redirect URLs

4. **Test:**
   - Visit `/admin-login` and `/login`
   - Create accounts and test login
   - Verify dashboards load

5. **Check logs:**
   - Look for errors in Render logs
   - Check browser console for errors

---

## 💡 Pro Tips

1. **Always test locally first:**
   ```bash
   npm run build && npm start
   ```
   If it doesn't work locally, it won't work on Render.

2. **Use Render's "Manual Deploy":**
   - Gives you more control
   - Can clear build cache
   - Can see logs in real-time

3. **Check browser console:**
   - Press F12 in browser
   - Look for red errors
   - Check Network tab for failed requests

4. **Upgrade to Starter plan:**
   - $7/month
   - Always running (no cold starts)
   - Better performance
   - Worth it for production

---

## 📞 Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Share these details:**
   - Render service URL
   - Error message from Render logs
   - Error message from browser console
   - Which portal is failing (admin, member, or both)

2. **Check these files:**
   - `server.js` - Should handle all routes
   - `vite.config.ts` - Should build to `dist/`
   - `package.json` - Should have correct scripts

3. **Verify Supabase:**
   - Can you connect to Supabase from local dev?
   - Are the environment variables correct?
   - Is the database set up?

---

## ✅ Success Checklist

You'll know it's working when:

- ✅ Homepage loads at `https://your-app.onrender.com`
- ✅ Admin login page loads at `/admin-login`
- ✅ Can create admin account
- ✅ Can login and see admin dashboard at `/admin`
- ✅ Member login page loads at `/login`
- ✅ Can create member account
- ✅ Can login and see member dashboard at `/dashboard`
- ✅ Refreshing any page works (no 404)
- ✅ No errors in browser console
- ✅ No errors in Render logs

---

**Good luck! 🚀**
