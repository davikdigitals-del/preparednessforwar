# Quick Fix: Both Portals Not Working on Render

## 🎯 5-Minute Fix

Follow these steps in order:

---

## Step 1: Add Environment Variables (2 minutes)

Go to: **Render Dashboard → Your Service → Environment**

Add these 3 REQUIRED variables:

```
NODE_VERSION
20.11.0
```

```
VITE_SUPABASE_URL
https://xfbmpjgcfohewejdzlfw.supabase.co
```

```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYm1wamdjZm9oZXdlamR6bGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODYyMDcsImV4cCI6MjA5MjU2MjIwN30.RrppC-u01_0Tv7GXBXsKGCZJ4xUBS8YzYoGeXwycxRA
```

Click **"Save Changes"**

---

## Step 2: Redeploy (3 minutes)

1. Click **"Manual Deploy"** (top right)
2. Select **"Clear build cache & deploy"**
3. Wait for build to complete

Watch for:
- ✅ "Installing dependencies"
- ✅ "Building application"
- ✅ "Server is running on port"

---

## Step 3: Configure Supabase (1 minute)

Go to: **Supabase Dashboard → Authentication → URL Configuration**

Set **Site URL:**
```
https://your-app-name.onrender.com
```

Add **Redirect URLs:**
```
https://your-app-name.onrender.com/**
```

Click **"Save"**

---

## Step 4: Test Both Portals (2 minutes)

### Test Admin Portal:
1. Visit: `https://your-app.onrender.com/admin-login`
2. Click "Create Account" tab
3. Create admin account
4. Login
5. Should redirect to `/admin` dashboard

### Test Member Portal:
1. Visit: `https://your-app.onrender.com/login`
2. Click "Sign Up"
3. Create member account
4. Login
5. Should redirect to `/dashboard`

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ No "Cannot connect to Supabase" errors
- ✅ Login forms load properly
- ✅ Can create accounts
- ✅ Can login successfully
- ✅ Dashboards load after login
- ✅ Refreshing pages works (no 404)

---

## ❌ Still Not Working?

### Check Render Logs:
1. Go to Render Dashboard → **Logs**
2. Look for errors like:
   - "Cannot find module" → Build failed
   - "ENOENT" → Missing files
   - "Connection refused" → Supabase issue

### Check Browser Console:
1. Press **F12** in browser
2. Go to **Console** tab
3. Look for red errors
4. Common issues:
   - "Supabase client not initialized" → Env vars not set
   - "Network error" → Supabase URL wrong
   - "401 Unauthorized" → Database permissions

### Quick Fixes:

**If admin login fails:**
```sql
-- Run in Supabase SQL Editor
UPDATE profiles 
SET is_admin = true, role = 'admin' 
WHERE email = 'your-email@example.com';
```

**If member dashboard shows "Loading...":**
- Check if database tables exist
- Run: `database/COMPLETE_SETUP_SINGLE_FILE.sql`

**If pages show 404 on refresh:**
- Verify `server.js` has catch-all route
- Check Render logs for server errors

---

## 📚 Detailed Guides

For more help, see:
- `RENDER_ENV_VARS.md` - Full environment variable guide
- `RENDER_PORTAL_FIX.md` - Complete troubleshooting guide
- `RENDER_DEPLOYMENT_GUIDE.md` - Full deployment walkthrough

---

## 💡 Pro Tips

1. **First load is slow on free tier** (30-60 seconds)
   - Render spins down after 15 min inactivity
   - Upgrade to Starter ($7/mo) for always-on

2. **Always clear build cache** when changing env vars
   - Ensures fresh build with new variables

3. **Test locally first:**
   ```bash
   npm run build
   npm start
   ```
   - If it works locally, it should work on Render

4. **Check both browser console AND Render logs**
   - Browser console = frontend errors
   - Render logs = backend/build errors

---

## 🆘 Emergency Checklist

If nothing works, verify:

- [ ] Environment variables are set in Render (not just locally)
- [ ] Variable names start with `VITE_` for client-side
- [ ] Redeployed after adding variables
- [ ] Build completed without errors
- [ ] Supabase URL is configured
- [ ] Database tables exist in Supabase
- [ ] Service status is "Live" (green)

---

**You got this! 🚀**
