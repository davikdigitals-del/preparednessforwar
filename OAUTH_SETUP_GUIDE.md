# OAuth Setup Guide - Google, Apple & Discord

## ✅ What's Been Added

Your sign-in and sign-up pages now have modern OAuth buttons for:
- 🔵 **Google** - Modern multi-color Google logo
- 🍎 **Apple** - Sleek Apple icon
- 💬 **Discord** - Discord brand icon

## 🔧 Supabase Configuration Required

To enable these OAuth providers, you need to configure them in your Supabase dashboard.

---

## 1️⃣ Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   ```
   https://xfbmpjgcfohewejdzlfw.supabase.co/auth/v1/callback
   ```
7. Copy your **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **PREPAREDNESS FOR WAR**
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Enable the provider
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

---

## 2️⃣ Apple OAuth Setup

### Step 1: Create Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **Services ID**
4. Enable **Sign in with Apple**
5. Configure domains and redirect URLs:
   ```
   Domain: xfbmpjgcfohewejdzlfw.supabase.co
   Redirect URL: https://xfbmpjgcfohewejdzlfw.supabase.co/auth/v1/callback
   ```
6. Create a **Key** for Sign in with Apple
7. Download the key file (.p8)

### Step 2: Configure in Supabase

1. Go to **Authentication** → **Providers** in Supabase
2. Find **Apple** and enable it
3. Enter:
   - **Services ID** (Bundle ID)
   - **Team ID**
   - **Key ID**
   - **Private Key** (contents of .p8 file)
4. Click **Save**

---

## 3️⃣ Discord OAuth Setup

### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Give it a name (e.g., "Preparedness Hub")
4. Navigate to **OAuth2** in the sidebar
5. Add redirect URL:
   ```
   https://xfbmpjgcfohewejdzlfw.supabase.co/auth/v1/callback
   ```
6. Copy your **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Go to **Authentication** → **Providers** in Supabase
2. Find **Discord** and enable it
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

---

## 🎨 UI Features Added

### Modern Design Elements

✅ **Divider with "Or continue with" text**
```
─────────── Or continue with ───────────
```

✅ **3-Column Grid Layout**
- Responsive button grid
- Equal spacing
- Hover effects

✅ **Brand-Accurate Icons**
- Google: Multi-color official logo
- Apple: Minimalist black icon
- Discord: Official brand icon

✅ **Consistent Styling**
- Outline variant buttons
- Proper spacing
- Accessible design

---

## 🧪 Testing OAuth

### Local Testing (Development)

For local development, you'll need to add localhost redirects:

1. In each OAuth provider console, add:
   ```
   http://localhost:5173/dashboard
   ```

2. In Supabase, update redirect URLs to include:
   ```
   http://localhost:5173/auth/v1/callback
   ```

### Production Testing

1. Deploy your app to production
2. Update OAuth redirect URLs to your production domain
3. Test each provider:
   - Click the Google button → Should redirect to Google login
   - Click the Apple button → Should redirect to Apple login
   - Click the Discord button → Should redirect to Discord login

---

## 🔒 Security Notes

### Important Considerations

1. **Never commit OAuth secrets** to your repository
2. **Use environment variables** for sensitive data
3. **Enable email verification** in Supabase Auth settings
4. **Set up proper RLS policies** for user data
5. **Configure allowed redirect URLs** carefully

### Supabase Auth Settings

Recommended settings in **Authentication** → **Settings**:

- ✅ Enable email confirmations
- ✅ Enable secure email change
- ✅ Set session timeout appropriately
- ✅ Configure site URL: `https://yourdomain.com`
- ✅ Add redirect URLs for production and development

---

## 📱 User Experience Flow

### Sign Up Flow
1. User clicks "Continue with Google/Apple/Discord"
2. Redirects to provider's login page
3. User authorizes the app
4. Redirects back to `/dashboard`
5. Profile is auto-created in `profiles` table
6. User role is set to `member`

### Sign In Flow
1. User clicks OAuth button
2. If already authorized, signs in immediately
3. If not, goes through authorization
4. Redirects to `/dashboard`

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Invalid redirect URI"**
- Solution: Check that redirect URLs match exactly in both provider console and Supabase

**Issue: "OAuth provider not configured"**
- Solution: Ensure provider is enabled in Supabase dashboard

**Issue: "User profile not created"**
- Solution: Check that `handle_new_user()` trigger is working in Supabase

**Issue: "Redirect loop"**
- Solution: Verify site URL is set correctly in Supabase Auth settings

### Debug Steps

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify OAuth credentials are correct
4. Test with a different browser/incognito mode
5. Check that RLS policies allow user creation

---

## 📊 Database Integration

### Automatic Profile Creation

When users sign in with OAuth, the `handle_new_user()` trigger automatically:

1. Creates a profile in `profiles` table
2. Sets default role to `member`
3. Extracts name from OAuth provider
4. Sets default country to `GB`
5. Creates entry in `user_roles` table

### OAuth User Data

OAuth providers return different data:

**Google:**
- Email (verified)
- Full name
- Profile picture URL

**Apple:**
- Email (verified)
- Name (optional, only on first sign-in)

**Discord:**
- Email (verified)
- Username
- Avatar URL
- Discriminator

---

## ✨ Next Steps

1. **Configure OAuth providers** in Supabase dashboard
2. **Test each provider** in development
3. **Update production URLs** when deploying
4. **Monitor auth logs** for any issues
5. **Consider adding more providers** (GitHub, Microsoft, etc.)

---

## 🎯 Quick Start Checklist

- [ ] Create Google OAuth credentials
- [ ] Create Apple Sign In credentials
- [ ] Create Discord application
- [ ] Configure all three in Supabase
- [ ] Test in development
- [ ] Update redirect URLs for production
- [ ] Deploy and test in production
- [ ] Monitor user sign-ups

---

## 📞 Support

If you encounter issues:

1. Check [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
2. Review provider-specific documentation
3. Check Supabase community forums
4. Review browser console errors

---

**Your OAuth integration is ready to go! Just configure the providers in Supabase and you're all set.** 🚀
