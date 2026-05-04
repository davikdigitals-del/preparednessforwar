# ✅ EXECUTION CHECKLIST - Clean State Setup

## Quick Reference for Running All Setup Files

Use this checklist to track your progress through the database setup.

---

## 📋 Pre-Flight Check

- [ ] Supabase project created
- [ ] Project ID configured: `xfbmpjgcfohewejdzlfw`
- [ ] Supabase SQL Editor open
- [ ] Ready to run SQL files

---

## 🚀 Execution Steps

### [ ] Step 1: Core Database
**File:** `ALL_IN_ONE_COMPLETE.sql`

- [ ] Opened file
- [ ] Copied entire contents (Ctrl+A, Ctrl+C)
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run" button
- [ ] Saw success message with counts
- [ ] Verified: Posts: 10, Media: 6, Library: 6

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### [ ] Step 2: Roles & Authentication
**File:** `ROLES_SETUP.sql`

- [ ] Clicked "New Query" in SQL Editor
- [ ] Opened file
- [ ] Copied entire contents
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "SUCCESS! Tables, policies, and functions created"

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

**Notes:**
- This drops existing profiles - intentional for clean state
- Users will need to sign up again

---

### [ ] Step 3: Storage Buckets
**File:** `STORAGE_SETUP.sql`

- [ ] Clicked "New Query"
- [ ] Opened file
- [ ] Copied entire contents
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "DONE. Storage bucket is ready"

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### [ ] Step 4: Premium & Subscriptions
**File:** `PREMIUM_SUBSCRIPTIONS.sql`

- [ ] Clicked "New Query"
- [ ] Opened file
- [ ] Copied entire contents
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "DONE. Premium and subscription tables ready"

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### [ ] Step 5: Sign Up User
**Action:** Sign up in your app

- [ ] Opened app at http://localhost:8080 (or your URL)
- [ ] Clicked "Sign Up"
- [ ] Entered email: ___________________________
- [ ] Entered password
- [ ] Completed signup
- [ ] Received confirmation email (if required)
- [ ] Verified account (if required)

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### [ ] Step 6: Make Yourself Admin
**File:** `MAKE_ADMIN.sql`

- [ ] Clicked "New Query"
- [ ] Opened file
- [ ] Replaced 'your@email.com' with actual email
- [ ] Ran the INSERT statement
- [ ] Ran the verification SELECT
- [ ] Saw both 'admin' and 'member' roles

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

**Your Email:** ___________________________

---

## 🔍 Verification Steps

### [ ] Verify Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

- [ ] Ran query
- [ ] Saw 23+ tables
- [ ] profiles exists
- [ ] user_roles exists
- [ ] posts exists
- [ ] subscription_plans exists

**Status:** ⬜ Not Started | ✅ Complete

---

### [ ] Verify Sample Data
```sql
SELECT 
  (SELECT COUNT(*) FROM posts) as posts,
  (SELECT COUNT(*) FROM media_items) as media,
  (SELECT COUNT(*) FROM library_items) as library,
  (SELECT COUNT(*) FROM subscription_plans) as plans;
```

- [ ] Ran query
- [ ] posts = 10
- [ ] media = 6
- [ ] library = 6
- [ ] plans = 3

**Status:** ⬜ Not Started | ✅ Complete

---

### [ ] Verify Storage
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'content-files';
```

- [ ] Ran query
- [ ] Bucket exists
- [ ] public = true

**Status:** ⬜ Not Started | ✅ Complete

---

### [ ] Verify Admin Status
```sql
SELECT u.email, r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'your@email.com';
```

- [ ] Ran query (with your email)
- [ ] Saw 'admin' role
- [ ] Saw 'member' role

**Status:** ⬜ Not Started | ✅ Complete

---

## 🧪 Functional Tests

### [ ] Test Authentication
- [ ] Can sign up new user
- [ ] Profile auto-created
- [ ] Can sign in
- [ ] Can sign out

**Status:** ⬜ Not Started | ✅ Complete

---

### [ ] Test Content Access
- [ ] Can view posts list
- [ ] Can view individual post
- [ ] Can view media items
- [ ] Can view library items

**Status:** ⬜ Not Started | ✅ Complete

---

### [ ] Test Admin Features
- [ ] Can access admin panel
- [ ] Can create new post
- [ ] Can edit post
- [ ] Can delete post
- [ ] Can upload media

**Status:** ⬜ Not Started | ✅ Complete

---

### [ ] Test Premium Features
- [ ] Can view subscription plans
- [ ] Premium content marked correctly
- [ ] Site settings editable

**Status:** ⬜ Not Started | ✅ Complete

---

## 📊 Final Status

### Setup Progress
- [ ] Step 1: Core Database
- [ ] Step 2: Roles & Auth
- [ ] Step 3: Storage
- [ ] Step 4: Premium
- [ ] Step 5: Sign Up
- [ ] Step 6: Make Admin

**Progress:** ___/6 Complete

### Verification Progress
- [ ] Tables verified
- [ ] Sample data verified
- [ ] Storage verified
- [ ] Admin status verified

**Progress:** ___/4 Complete

### Testing Progress
- [ ] Authentication tested
- [ ] Content access tested
- [ ] Admin features tested
- [ ] Premium features tested

**Progress:** ___/4 Complete

---

## 🎉 Completion

### [ ] All Steps Complete
- [ ] All setup steps executed
- [ ] All verifications passed
- [ ] All tests passed
- [ ] Database is production ready

**Date Completed:** ___________________________  
**Completed By:** ___________________________  
**Time Taken:** ___________________________ minutes

---

## 📝 Notes & Issues

### Issues Encountered
```
(Record any issues you encountered and how you resolved them)




```

### Custom Modifications
```
(Record any custom changes you made to the setup)




```

### Next Steps
```
(What you plan to do next)




```

---

## 🆘 Need Help?

If you encounter issues:

1. **Check:** `ADMIN_TROUBLESHOOTING.md`
2. **Review:** `FINAL_SETUP_GUIDE.md`
3. **Verify:** Run `check-schema.sql`
4. **Reset:** Use nuclear reset if needed (see FINAL_SETUP_GUIDE.md)

---

**Checklist Version:** 1.0  
**Last Updated:** April 24, 2026  
**For:** Preparedness for War Clean State Setup
