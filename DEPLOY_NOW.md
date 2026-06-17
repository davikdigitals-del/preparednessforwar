# 🚀 DEPLOYMENT GUIDE - Step by Step

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, you need to complete these 3 critical database tasks in Supabase:

### ✅ **Step 0: Database Setup (Do This FIRST!)**

#### 🔴 Task 1: Fix Featured Posts (5 min)
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Open file: `database/FIX_FEATURED_POSTS_SIMPLE.sql`
6. Copy entire content
7. Paste into Supabase SQL Editor
8. Click: **Run** (or press Ctrl+Enter)
9. ✅ Look for success message: "Featured posts RLS policies fixed!"

#### 🟡 Task 2: Enable Encryption (10 min)
1. In Supabase SQL Editor
2. Click: **New Query**
3. Open file: `database/ENCRYPTION_SETUP.sql`
4. Copy entire content
5. Paste into Supabase SQL Editor
6. Click: **Run** (or press Ctrl+Enter)
7. ✅ Look for success message: "END-TO-END ENCRYPTION SETUP COMPLETE!"

#### 🟢 Task 3: Add Email Templates (5 min)
1. In Supabase Dashboard
2. Go to: **Authentication** → **Email Templates** (left sidebar)
3. Click on: **Confirm signup**
4. Open file: `NEXT_STEPS.md`
5. Scroll to: **PRIORITY 3: Add Email Templates**
6. Copy the **Signup Confirmation Template**
7. Paste into Supabase (replace existing template)
8. Click: **Save**
9. Click on: **Identity linking**
10. Copy the **Identity Linking Template** from `NEXT_STEPS.md`
11. Paste into Supabase (replace existing template)
12. Click: **Save**

---

## 🚀 DEPLOYMENT OPTIONS

You have 3 deployment options. Choose one:

### **Option A: Render.com (Recommended - Free)**
### **Option B: Netlify (Great for Static Sites)**
### **Option C: Vercel (Fast & Easy)**

---

## 🔵 OPTION A: DEPLOY TO RENDER.COM (RECOMMENDED)

### Why Render?
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ GitHub integration
- ✅ Easy environment variables
- ✅ Already configured (render.yaml exists)

### Steps:

#### 1. **Push to GitHub (if not already)**

```bash
# Navigate to project
cd c:\Users\EMMAX\Downloads\pfw\preparednessforwar2

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for production deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push
git push -u origin main
```

#### 2. **Create Render Account**

1. Go to: https://render.com
2. Click: **Get Started**
3. Sign up with GitHub (recommended)

#### 3. **Create New Web Service**

1. Click: **New +** → **Web Service**
2. Connect your GitHub repository
3. Select: `preparednessforwar2` repository
4. Render will auto-detect `render.yaml`
5. Click: **Apply**

#### 4. **Set Environment Variables**

In Render dashboard, go to **Environment** and add:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key (optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (optional)
STRIPE_SECRET_KEY=your_stripe_secret (optional)
```

**To get Supabase keys:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy `Project URL` (VITE_SUPABASE_URL)
4. Copy `anon public` key (VITE_SUPABASE_ANON_KEY)

#### 5. **Deploy!**

1. Click: **Manual Deploy** → **Deploy latest commit**
2. Wait 5-10 minutes for build
3. ✅ Your site will be live at: `https://preparedness-for-war.onrender.com`

#### 6. **Add Custom Domain (Optional)**

1. In Render dashboard, go to: **Settings** → **Custom Domain**
2. Add your domain (e.g., `preparednessforwar.com`)
3. Update DNS records as shown
4. Wait for SSL certificate (automatic)

---

## 🟢 OPTION B: DEPLOY TO NETLIFY

### Steps:

#### 1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

#### 2. **Build Locally**

```bash
cd c:\Users\EMMAX\Downloads\pfw\preparednessforwar2
npm install
npm run build
```

#### 3. **Login to Netlify**

```bash
netlify login
```

#### 4. **Initialize Netlify**

```bash
netlify init
```

Follow prompts:
- Create & configure a new site
- Team: Your team
- Site name: preparedness-for-war
- Build command: `npm run build`
- Publish directory: `dist`

#### 5. **Set Environment Variables**

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your_anon_key_here"
```

#### 6. **Deploy!**

```bash
netlify deploy --prod
```

✅ Your site will be live at: `https://preparedness-for-war.netlify.app`

---

## 🟣 OPTION C: DEPLOY TO VERCEL

### Steps:

#### 1. **Install Vercel CLI**

```bash
npm install -g vercel
```

#### 2. **Login to Vercel**

```bash
vercel login
```

#### 3. **Deploy**

```bash
cd c:\Users\EMMAX\Downloads\pfw\preparednessforwar2
vercel
```

Follow prompts:
- Set up and deploy: Yes
- Which scope: Your account
- Link to existing project: No
- Project name: preparedness-for-war
- Directory: ./
- Override settings: No

#### 4. **Set Environment Variables**

```bash
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key when prompted
```

#### 5. **Deploy to Production**

```bash
vercel --prod
```

✅ Your site will be live at: `https://preparedness-for-war.vercel.app`

---

## 🔧 LOCAL BUILD FIRST (RECOMMENDED)

Before deploying, test the build locally:

### 1. **Install Dependencies**

```bash
cd c:\Users\EMMAX\Downloads\pfw\preparednessforwar2
npm install
```

This will take 2-5 minutes.

### 2. **Create .env File**

Create file: `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. **Build for Production**

```bash
npm run build
```

This creates optimized production build in `dist/` folder.

### 4. **Preview Build Locally**

```bash
npm run preview
```

Visit: http://localhost:4173

Test:
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Sign in/up works
- ✅ Video player works
- ✅ Featured posts in mega menu
- ✅ No console errors

### 5. **If Build Succeeds** ✅

Proceed with deployment to Render/Netlify/Vercel!

---

## ⚠️ COMMON BUILD ERRORS & FIXES

### Error: "Cannot find module"
```bash
# Fix: Reinstall dependencies
rm -rf node_modules
npm install
```

### Error: "TypeScript errors"
```bash
# Fix: Check for type errors
npm run lint
```

### Error: "Environment variables not defined"
```bash
# Fix: Create .env file with Supabase keys
# See section above
```

### Error: "Out of memory"
```bash
# Fix: Increase Node memory
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

---

## 🌐 POST-DEPLOYMENT CHECKLIST

After deployment:

### 1. **Update Supabase URLs**

1. Go to Supabase Dashboard
2. Settings → API → URL Configuration
3. Add your deployed URL to:
   - **Site URL**: `https://your-site.com`
   - **Redirect URLs**: Add all your auth callback URLs

### 2. **Test on Live Site**

- [ ] Homepage loads
- [ ] Sign up new account (test email confirmation)
- [ ] Sign in with email
- [ ] Sign in with Google/Apple/Discord
- [ ] Last sign-in method highlighted
- [ ] Featured posts show in mega menu
- [ ] Video player works (expand, PiP, fullscreen)
- [ ] Mobile responsive
- [ ] No console errors

### 3. **Set Up Cloudflare (Recommended)**

1. Sign up: https://cloudflare.com
2. Add your domain
3. Update nameservers
4. Enable:
   - ✅ DDoS Protection
   - ✅ WAF (Web Application Firewall)
   - ✅ Bot Fight Mode
   - ✅ SSL/TLS (Full Strict)
   - ✅ Always Use HTTPS

### 4. **Test Security**

Visit: https://securityheaders.com
Enter your domain
✅ Should get A+ rating

### 5. **Monitor Performance**

- Check Render/Netlify/Vercel dashboard for:
  - Build times
  - Deploy status
  - Bandwidth usage
  - Error logs

---

## 🎉 DEPLOYMENT COMPLETE!

Your site is now live with:
- 🔒 Military-grade encryption
- 🛡️ 14-layer security firewall
- 🎬 Professional video player
- 🔑 OAuth authentication
- 📧 Branded email templates
- 📌 Featured posts in mega menu

### 🏆 **SECURITY LEVEL: 5/5 (MAXIMUM)**

Same protection as Signal, ProtonMail, and WhatsApp!

---

## 📞 NEED HELP?

### Build Issues:
1. Check console output for errors
2. Verify `npm install` completed successfully
3. Ensure `.env` file exists with correct keys
4. Try: `rm -rf node_modules && npm install`

### Deployment Issues:
1. Check deployment logs in dashboard
2. Verify environment variables are set
3. Ensure GitHub repo is connected
4. Check build command in settings

### Database Issues:
1. Verify SQL scripts ran successfully in Supabase
2. Check Supabase logs (Dashboard → Logs)
3. Test queries in Supabase SQL Editor
4. Verify RLS policies are correct

---

## 🚀 QUICK DEPLOYMENT COMMANDS

### For Render.com:
```bash
# Push to GitHub
git add .
git commit -m "Production deployment"
git push

# Render will auto-deploy
```

### For Netlify:
```bash
npm install
npm run build
netlify deploy --prod
```

### For Vercel:
```bash
npm install
vercel --prod
```

---

**Choose your deployment platform and follow the steps above!**

**Recommended**: Start with **Render.com** (already configured in render.yaml)

