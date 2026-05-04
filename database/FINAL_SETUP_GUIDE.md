# 🎯 FINAL SETUP GUIDE - Clean State Continued

## Overview

This is the **definitive guide** for setting up your Preparedness for War database from a completely clean state. All files are ready and organized for sequential execution.

---

## 📁 File Structure

Your database folder now contains:

### Core Setup Files (Run These)
1. **ALL_IN_ONE_COMPLETE.sql** - Core schema + sample data
2. **ROLES_SETUP.sql** - Authentication & roles (nuclear clean)
3. **STORAGE_SETUP.sql** - File upload buckets
4. **PREMIUM_SUBSCRIPTIONS.sql** - Premium features & subscriptions
5. **MAKE_ADMIN.sql** - Make yourself admin

### Documentation Files
- **CLEAN_STATE_SETUP.md** - Comprehensive setup guide
- **FINAL_SETUP_GUIDE.md** - This file
- **START_HERE.md** - Quick start guide
- **QUICK_START.md** - 3-minute setup
- **ADMIN_TESTING_CHECKLIST.md** - Testing guide
- **ADMIN_TROUBLESHOOTING.md** - Troubleshooting guide

### Utility Files
- **check-schema.sql** - Verify your schema
- **QUICK_REFERENCE.md** - SQL query examples

---

## 🚀 Complete Setup Process

### Prerequisites
- ✅ Supabase project created
- ✅ Project ID in `supabase/config.toml`: `xfbmpjgcfohewejdzlfw`
- ✅ Access to Supabase SQL Editor

---

### Step 1: Core Database Setup
**File:** `ALL_IN_ONE_COMPLETE.sql`  
**Time:** ~15 seconds

```bash
# What this does:
- Drops all existing tables (clean slate)
- Creates all core tables with correct schema
- Adds indexes for performance
- Creates functions and triggers
- Sets up basic RLS policies
- Inserts sample data (10 posts, 6 media, 6 library, etc.)
```

**How to run:**
1. Open Supabase SQL Editor
2. Copy entire contents of `ALL_IN_ONE_COMPLETE.sql`
3. Paste into SQL Editor
4. Click "Run" or press F5
5. Wait for success message

**Expected output:**
```
✅ DATABASE SETUP COMPLETE!
Posts: 10
Media Items: 6
Library Items: 6
Encyclopaedia Entries: 6
Countries: 32
Sections: 8
```

---

### Step 2: Roles & Authentication (Nuclear Clean)
**File:** `ROLES_SETUP.sql`  
**Time:** ~5 seconds

```bash
# What this does:
- Drops ALL existing auth triggers and functions
- Drops and recreates profiles and user_roles tables
- Creates app_role enum (admin, member)
- Sets up RLS policies for auth
- Creates handle_new_user() trigger
- Creates assign_admin_role() function
- Creates has_role() helper function
```

**How to run:**
1. In SQL Editor, click "New Query"
2. Copy entire contents of `ROLES_SETUP.sql`
3. Paste into SQL Editor
4. Click "Run"

**Expected output:**
```
SUCCESS! Tables, policies, and functions created.
```

**Important Notes:**
- This uses a "nuclear clean" approach - it drops everything first
- Existing profiles will be deleted - this is intentional for clean state
- Users will need to sign up again after this step

---

### Step 3: Storage Buckets
**File:** `STORAGE_SETUP.sql`  
**Time:** ~3 seconds

```bash
# What this does:
- Creates 'content-files' bucket (50MB limit)
- Configures public read access
- Allows authenticated users to upload/update/delete
- Sets allowed MIME types (images, videos, audio, PDFs, docs)
```

**How to run:**
1. Click "New Query"
2. Copy entire contents of `STORAGE_SETUP.sql`
3. Paste and run

**Expected output:**
```
DONE. Storage bucket is ready.
```

---

### Step 4: Premium Features & Subscriptions
**File:** `PREMIUM_SUBSCRIPTIONS.sql`  
**Time:** ~5 seconds

```bash
# What this does:
- Adds is_premium flags to posts, media_items, library_items
- Creates subscription_plans table
- Creates user_subscriptions table
- Creates site_settings table (editable config)
- Adds 3 default plans (Free, Premium Monthly, Premium Annual)
- Adds default site settings
- Sets up RLS policies
```

**How to run:**
1. Click "New Query"
2. Copy entire contents of `PREMIUM_SUBSCRIPTIONS.sql`
3. Paste and run

**Expected output:**
```
DONE. Premium and subscription tables ready.
```

---

### Step 5: Make Yourself Admin
**File:** `MAKE_ADMIN.sql`  
**Time:** ~2 seconds

**⚠️ Important:** Do this AFTER signing up in your app!

**Method 1: By Email (Recommended)**
```sql
-- Replace 'your@email.com' with your actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;

-- Verify it worked
SELECT u.email, r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'your@email.com';
```

**Method 2: Using Function (After Sign In)**
```sql
SELECT public.assign_admin_role();
```

---

## ✅ Verification

After completing all steps, run these checks:

### Check 1: Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** 23+ tables including:
- profiles
- user_roles
- posts
- media_items
- library_items
- subscription_plans
- user_subscriptions
- site_settings
- etc.

### Check 2: Sample Data Loaded
```sql
SELECT 
  (SELECT COUNT(*) FROM posts) as posts,
  (SELECT COUNT(*) FROM media_items) as media,
  (SELECT COUNT(*) FROM library_items) as library,
  (SELECT COUNT(*) FROM encyclopaedia_entries) as encyclopaedia,
  (SELECT COUNT(*) FROM countries) as countries,
  (SELECT COUNT(*) FROM subscription_plans) as plans,
  (SELECT COUNT(*) FROM site_settings) as settings;
```

**Expected:**
- posts: 10
- media: 6
- library: 6
- encyclopaedia: 6
- countries: 32
- plans: 3
- settings: 10+

### Check 3: Storage Bucket
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'content-files';
```

**Expected:**
- id: content-files
- public: true
- file_size_limit: 52428800

### Check 4: Auth Functions Exist
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'assign_admin_role', 'has_role');
```

**Expected:** All 3 functions listed

### Check 5: Your Admin Status
```sql
-- Replace with your email
SELECT u.email, r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'your@email.com';
```

**Expected:** Both 'admin' and 'member' roles

---

## 🔧 Troubleshooting

### Issue: "relation already exists"
**Cause:** You already ran that step  
**Solution:** Skip to next step, or run nuclear reset (see below)

### Issue: "column does not exist"
**Cause:** You skipped Step 1  
**Solution:** Run `ALL_IN_ONE_COMPLETE.sql` first

### Issue: "trigger already exists"
**Cause:** Old triggers from previous setup  
**Solution:** `ROLES_SETUP.sql` handles this automatically

### Issue: Can't upload files
**Cause:** Storage bucket not created  
**Solution:** Run `STORAGE_SETUP.sql` again

### Issue: Premium features not working
**Cause:** Premium tables not created  
**Solution:** Run `PREMIUM_SUBSCRIPTIONS.sql`

### Issue: Not an admin
**Cause:** Admin role not assigned  
**Solution:** Run `MAKE_ADMIN.sql` with your email

### Issue: Users can't sign up
**Cause:** handle_new_user() trigger missing  
**Solution:** Run `ROLES_SETUP.sql` again

---

## 🚨 Nuclear Reset (Complete Wipe)

If you want to start completely fresh:

```sql
-- ⚠️ WARNING: This deletes EVERYTHING!

-- Drop all public tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id = 'content-files';

-- Drop auth triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Then run all 5 steps again from the beginning
```

---

## 📊 What You Get

After completing all steps:

### Database Tables (23+)
- ✅ profiles (with user_id reference to auth.users)
- ✅ user_roles (admin/member with app_role enum)
- ✅ posts (with section, standfirst, is_premium)
- ✅ media_items (with is_premium)
- ✅ library_items (with is_premium)
- ✅ subscription_plans
- ✅ user_subscriptions
- ✅ site_settings
- ✅ encyclopaedia_entries
- ✅ alerts
- ✅ countries (32 NATO members)
- ✅ sections (8 content sections)
- ✅ And 12 more supporting tables

### Authentication & Security
- ✅ Row Level Security (RLS) enabled
- ✅ Policies for all protected tables
- ✅ Auto-profile creation on signup
- ✅ Role-based access control
- ✅ Admin assignment function

### Storage
- ✅ content-files bucket (50MB limit)
- ✅ Public read access
- ✅ Authenticated upload/update/delete
- ✅ Multiple MIME types supported

### Premium Features
- ✅ Premium content flags
- ✅ Subscription management
- ✅ 3 subscription plans
- ✅ Site settings (editable config)

### Sample Data
- ✅ 10 sample posts
- ✅ 6 media items
- ✅ 6 library documents
- ✅ 6 encyclopaedia entries
- ✅ 3 alerts
- ✅ 32 countries
- ✅ 8 sections

---

## 🎯 Quick Reference

| Step | File | Purpose | Time | Required |
|------|------|---------|------|----------|
| 1 | ALL_IN_ONE_COMPLETE.sql | Core schema & data | 15s | ✅ Yes |
| 2 | ROLES_SETUP.sql | Auth & roles | 5s | ✅ Yes |
| 3 | STORAGE_SETUP.sql | File uploads | 3s | ✅ Yes |
| 4 | PREMIUM_SUBSCRIPTIONS.sql | Premium features | 5s | ✅ Yes |
| 5 | MAKE_ADMIN.sql | Admin access | 2s | ✅ Yes |

**Total time:** ~30 seconds

---

## 🎉 Success Checklist

After completing all steps, you should have:

- [x] All tables created with correct schema
- [x] Sample content loaded (posts, media, library)
- [x] Authentication system working
- [x] Role-based access control (admin/member)
- [x] Storage bucket configured
- [x] Premium features enabled
- [x] Subscription plans created
- [x] Site settings configurable
- [x] Admin access granted
- [x] Auto-profile creation on signup

---

## 📖 Next Steps

1. **Test Authentication**
   - Sign up a new user
   - Verify profile auto-creation
   - Make yourself admin
   - Test admin features

2. **Test Content**
   - View sample posts
   - Test media playback
   - Download library items
   - Browse encyclopaedia

3. **Test Premium**
   - Mark content as premium
   - Test subscription flow
   - Verify access control

4. **Customize**
   - Update site settings
   - Add your own content
   - Configure sections
   - Customize subscription plans

---

## 📚 Additional Resources

- **ADMIN_TESTING_CHECKLIST.md** - Complete testing guide
- **ADMIN_TROUBLESHOOTING.md** - Common issues & solutions
- **QUICK_REFERENCE.md** - Useful SQL queries
- **check-schema.sql** - Schema verification queries

---

## ✨ You're Done!

Your Preparedness for War database is now fully configured and ready to use!

**Database:** ✅ Complete  
**Authentication:** ✅ Working  
**Storage:** ✅ Configured  
**Premium:** ✅ Enabled  
**Admin:** ✅ Assigned  

**Start building your preparedness intelligence hub!** 🚀

---

**Last Updated:** April 24, 2026  
**Version:** 3.0 (Clean State Continued Continued)  
**Status:** Production Ready
