# Environment Variables for Render

## 🔐 Copy These to Render Dashboard

Go to your Render service → **Environment** tab → Add these variables:

---

## Required Variables (MUST SET)

### NODE_VERSION
```
NODE_VERSION=20.11.0
```

### VITE_SUPABASE_URL
```
VITE_SUPABASE_URL=https://xfbmpjgcfohewejdzlfw.supabase.co
```

### VITE_SUPABASE_ANON_KEY
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYm1wamdjZm9oZXdlamR6bGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODYyMDcsImV4cCI6MjA5MjU2MjIwN30.RrppC-u01_0Tv7GXBXsKGCZJ4xUBS8YzYoGeXwycxRA
```

---

## Optional Variables (For Full Features)

### VITE_RECAPTCHA_SITE_KEY
```
VITE_RECAPTCHA_SITE_KEY=6LfW3NgsAAAAAJg_iOTfx5Swt6bLqjqf0NWV0F3_
```

### RECAPTCHA_SECRET_KEY
```
RECAPTCHA_SECRET_KEY=6LfW3NgsAAAAAEk5A-2gcPveQ4jeLeopGh3eXh0B
```

### VITE_STRIPE_PUBLISHABLE_KEY
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51TSmrV6AEy5p66QTYUi2M7obDhCW8lgilg0ND05kzLk47m3pdaWYvjvfz7f4yvrVFH5mTn7ez2hHQBEQ31FQnzwT004ejGIVeA
```

### STRIPE_SECRET_KEY
```
STRIPE_SECRET_KEY=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
```

---

## 📋 How to Add in Render Dashboard

### Step 1: Open Environment Settings
1. Go to https://dashboard.render.com
2. Click on your service (preparedness-for-war)
3. Click **"Environment"** in the left sidebar

### Step 2: Add Each Variable
For each variable above:
1. Click **"Add Environment Variable"**
2. Enter the **Key** (e.g., `VITE_SUPABASE_URL`)
3. Enter the **Value** (e.g., `https://xfbmpjgcfohewejdzlfw.supabase.co`)
4. Click **"Save"**

### Step 3: Deploy
After adding all variables:
1. Click **"Manual Deploy"** at the top
2. Select **"Clear build cache & deploy"**
3. Wait for deployment to complete (3-5 minutes)

---

## ⚠️ Important Notes

### Variable Naming
- Variables starting with `VITE_` are accessible in the browser (client-side)
- Variables without `VITE_` are server-side only
- **Never** put `VITE_` prefix on secret keys (like `STRIPE_SECRET_KEY`)

### Security
- ✅ `VITE_SUPABASE_ANON_KEY` - Safe to expose (public key)
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` - Safe to expose (public key)
- ✅ `VITE_RECAPTCHA_SITE_KEY` - Safe to expose (public key)
- ❌ `STRIPE_SECRET_KEY` - NEVER expose (server-side only)
- ❌ `RECAPTCHA_SECRET_KEY` - NEVER expose (server-side only)

### After Adding Variables
- Always redeploy after adding/changing environment variables
- Variables are only loaded during build time for `VITE_` prefixed vars
- Clear build cache to ensure fresh build with new variables

---

## 🧪 Test After Deployment

Once deployed, test these URLs:

### 1. Homepage
```
https://your-app.onrender.com/
```
Should load the homepage

### 2. Admin Login
```
https://your-app.onrender.com/admin-login
```
Should load admin login page

### 3. Member Login
```
https://your-app.onrender.com/login
```
Should load member login page

### 4. Check Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for errors related to:
   - Supabase connection
   - Environment variables
   - API calls

---

## 🔍 Verify Variables Are Set

After deployment, you can verify variables are loaded:

### In Browser Console (F12):
```javascript
// These should show your values (VITE_ prefixed only)
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY);

// These should be undefined (server-side only)
console.log(import.meta.env.STRIPE_SECRET_KEY); // undefined
console.log(import.meta.env.RECAPTCHA_SECRET_KEY); // undefined
```

---

## 🚨 Troubleshooting

### "Supabase client not initialized"
- ❌ `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` not set
- ✅ Add both variables and redeploy

### "Cannot connect to Supabase"
- ❌ Wrong Supabase URL or key
- ✅ Double-check values match your Supabase project

### "Stripe not working"
- ❌ `VITE_STRIPE_PUBLISHABLE_KEY` not set
- ✅ Add variable and redeploy

### "reCAPTCHA not showing"
- ❌ `VITE_RECAPTCHA_SITE_KEY` not set
- ✅ Add variable and redeploy (or it's optional)

### Variables not updating
- ❌ Didn't redeploy after adding variables
- ✅ Click "Manual Deploy" → "Clear build cache & deploy"

---

## ✅ Quick Checklist

Before testing, ensure:

- [ ] All required variables added in Render
- [ ] Variable names are EXACTLY as shown (case-sensitive)
- [ ] No extra spaces in values
- [ ] Redeployed after adding variables
- [ ] Build completed successfully (check logs)
- [ ] Service is "Live" (green status)

---

## 📞 Next Steps

1. ✅ Add all variables to Render dashboard
2. ✅ Clear build cache and deploy
3. ✅ Wait for deployment to complete
4. ✅ Test both portals:
   - `/admin-login` → Create admin account → Access `/admin`
   - `/login` → Create member account → Access `/dashboard`
5. ✅ Check browser console for errors
6. ✅ If issues persist, see `RENDER_PORTAL_FIX.md`

---

**Good luck! 🚀**
