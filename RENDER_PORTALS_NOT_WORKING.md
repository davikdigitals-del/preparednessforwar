# Portals Work Locally But Not on Render - Diagnostic Guide

## 🔍 Common Causes & Solutions

Since your portals work locally but fail on Render, the issue is likely one of these:

---

## Issue #1: Environment Variables Not Set in Render ⭐ MOST COMMON

### Symptoms:
- Blank page or white screen
- Console error: "Missing Supabase environment variables"
- Console error: "Cannot read properties of undefined"
- Login page loads but login fails silently

### Solution:

**You MUST set environment variables in Render Dashboard, not just locally!**

1. Go to: https://dashboard.render.com
2. Click your service
3. Click **"Environment"** in left sidebar
4. Add these variables ONE BY ONE:

```
Key: VITE_SUPABASE_URL
Value: https://xfbmpjgcfohewejdzlfw.supabase.co
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYm1wamdjZm9oZXdlamR6bGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODYyMDcsImV4cCI6MjA5MjU2MjIwN30.RrppC-u01_0Tv7GXBXsKGCZJ4xUBS8YzYoGeXwycxRA
```

5. Click **"Save Changes"**
6. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
7. Wait 3-5 minutes for deployment

### Verify:
After deployment, open browser console (F12) on your Render site and run:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Should show your values, NOT `undefined`.

---

## Issue #2: Client-Side Routing Not Working (404 on Portal Routes)

### Symptoms:
- Homepage works fine
- `/admin-login` shows 404
- `/dashboard` shows 404
- Direct URL access fails but clicking links works

### Solution:

Your `server.js` already has the fix, but verify it's being used:

**Check Render Settings:**
1. Go to Render Dashboard → Your Service → **Settings**
2. Scroll to **Build & Deploy**
3. Verify **Start Command** is: `npm start`
4. NOT `npm run preview` or `vite preview`

**Verify server.js is correct:**
```javascript
// Should have this catch-all route
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});
```

✅ Your server.js already has this!

---

## Issue #3: Build Not Creating dist Folder

### Symptoms:
- Render logs show "ENOENT: no such file or directory, open 'dist/index.html'"
- Service crashes immediately after starting
- Logs show "Cannot find module"

### Solution:

**Check Render Build Command:**
1. Go to Render Dashboard → Your Service → **Settings**
2. Verify **Build Command** is: `npm install && npm run build`
3. Check Render logs during deployment
4. Look for: `✓ built in X seconds`

**If build fails:**
- Check for TypeScript errors in logs
- Check for missing dependencies
- Try building locally first: `npm run build`

---

## Issue #4: Supabase URL Not Configured for Render Domain

### Symptoms:
- Login page loads
- Can enter credentials
- Login fails with no error or "Invalid credentials"
- Console shows CORS errors or redirect errors

### Solution:

**Configure Supabase for your Render domain:**

1. Go to: https://supabase.com/dashboard
2. Select your project: `xfbmpjgcfohewejdzlfw`
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to:
   ```
   https://your-app-name.onrender.com
   ```
5. Add **Redirect URLs**:
   ```
   https://your-app-name.onrender.com/**
   https://your-app-name.onrender.com/dashboard
   https://your-app-name.onrender.com/admin
   ```
6. Click **"Save"**

---

## Issue #5: Database Tables Not Set Up

### Symptoms:
- Login works
- Redirects to dashboard
- Dashboard shows "Loading..." forever
- Console shows database query errors

### Solution:

**Run database setup in Supabase:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Open file: `database/COMPLETE_SETUP_SINGLE_FILE.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **"Run"**

**Or run these essential tables:**
```sql
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  country TEXT DEFAULT 'GB',
  is_admin BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  PRIMARY KEY (user_id, role)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## Issue #6: Admin User Not Marked as Admin

### Symptoms:
- Can create admin account
- Can login
- Redirects back to login instead of `/admin`
- Or shows "Not authorized"

### Solution:

**Manually set user as admin:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this (replace with your email):
```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Set as admin
UPDATE profiles 
SET is_admin = true, role = 'admin' 
WHERE email = 'your-email@example.com';

-- Add admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 🔍 Step-by-Step Diagnosis

Follow these steps to find the exact issue:

### Step 1: Check Render Logs
1. Go to Render Dashboard → Your Service → **Logs**
2. Look for errors:
   - ❌ "Missing Supabase environment variables" → Issue #1
   - ❌ "ENOENT: no such file" → Issue #3
   - ❌ "Cannot find module" → Issue #3
   - ✅ "Server is running on port" → Server started OK

### Step 2: Check Browser Console
1. Visit your Render URL
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for errors:
   - ❌ "Missing Supabase environment variables" → Issue #1
   - ❌ "Failed to fetch" → Issue #4
   - ❌ "CORS error" → Issue #4
   - ❌ "401 Unauthorized" → Issue #5 or #6

### Step 3: Test Environment Variables
In browser console on your Render site:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

- If both show values → Env vars are set ✅
- If either is `undefined` → Issue #1 ❌

### Step 4: Test Portal Access
Try accessing portals directly:

**Admin Portal:**
```
https://your-app.onrender.com/admin-login
```
- ✅ Page loads → Routing works
- ❌ 404 error → Issue #2

**Member Portal:**
```
https://your-app.onrender.com/login
```
- ✅ Page loads → Routing works
- ❌ 404 error → Issue #2

### Step 5: Test Login
1. Try to create an account
2. Try to login
3. Check what happens:
   - ❌ Nothing happens → Issue #1 or #4
   - ❌ Error message → Check console for details
   - ✅ Redirects but shows "Loading..." → Issue #5
   - ✅ Redirects back to login → Issue #6

---

## 🚀 Quick Fix Workflow

**Do these in order:**

1. ✅ Set environment variables in Render (Issue #1)
2. ✅ Redeploy with clear cache
3. ✅ Configure Supabase Site URL (Issue #4)
4. ✅ Run database setup SQL (Issue #5)
5. ✅ Test admin login
6. ✅ If admin login fails, manually set admin (Issue #6)
7. ✅ Test member login

---

## 📊 Diagnostic Checklist

Use this to identify your specific issue:

**Environment Variables:**
- [ ] Set in Render dashboard (not just .env file)
- [ ] VITE_SUPABASE_URL is set
- [ ] VITE_SUPABASE_ANON_KEY is set
- [ ] Redeployed after adding variables
- [ ] Variables show in browser console (not undefined)

**Build & Deployment:**
- [ ] Build command is: `npm install && npm run build`
- [ ] Start command is: `npm start`
- [ ] Build completes without errors
- [ ] Logs show "Server is running on port"
- [ ] Service status is "Live" (green)

**Supabase Configuration:**
- [ ] Site URL set to Render URL
- [ ] Redirect URLs added
- [ ] Database tables exist
- [ ] RLS policies configured

**Portal Access:**
- [ ] Homepage loads
- [ ] /admin-login loads (not 404)
- [ ] /login loads (not 404)
- [ ] Can create accounts
- [ ] Can login
- [ ] Dashboards load after login

---

## 💡 Most Likely Solution

**90% of the time, the issue is:**

1. **Environment variables not set in Render dashboard**
   - You set them in `.env` locally
   - But forgot to set them in Render
   - Solution: Add them in Render → Environment tab

2. **Forgot to redeploy after adding env vars**
   - Variables only load during build
   - Solution: Manual Deploy → Clear build cache & deploy

3. **Supabase Site URL not configured**
   - Supabase blocks requests from unknown domains
   - Solution: Add Render URL to Supabase settings

---

## 🆘 Still Stuck?

**Share these details:**

1. **Render URL:** `https://your-app.onrender.com`

2. **What happens when you visit `/admin-login`:**
   - Blank page?
   - 404 error?
   - Page loads but login fails?

3. **Render logs (last 20 lines):**
   - Copy from Render Dashboard → Logs

4. **Browser console errors:**
   - Press F12 → Console tab
   - Copy any red errors

5. **Environment variables status:**
   - Are they set in Render dashboard?
   - Do they show in browser console?

---

**Let's fix this! 🚀**
