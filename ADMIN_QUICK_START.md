# Admin System - Quick Start Guide

## 🚀 3-Step Setup

### Step 1: Verify Database (2 minutes)
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Run: `database/VERIFY_ADMIN_SETUP.sql`
4. Check results:
   - ✅ All green = Ready to go!
   - ❌ Any red = Run `database/SETUP_ADMIN_TABLES.sql` first

### Step 2: Create Admin Account (1 minute)
1. Start dev server: `npm run dev`
2. Open: http://localhost:8080/admin-login
3. Click **"Create Account"** tab
4. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: (min 6 chars)
5. Click **"Create Admin Account"**
6. Wait for: "✅ Admin account created successfully!"

### Step 3: Login (30 seconds)
1. Form switches to **"Login"** tab automatically
2. Email/password should be pre-filled
3. Click **"Login to Admin"**
4. You're in! 🎉

---

## 🐛 Troubleshooting

### Problem: Can't create account
**Solution**: Open browser console (F12) and check for errors

### Problem: Can't login
**Solution**: Make sure you created the account first (Step 2)

### Problem: Database errors
**Solution**: Run `database/SETUP_ADMIN_TABLES.sql` in Supabase SQL Editor

### Problem: reCAPTCHA blocking
**Solution**: Temporarily disable in `.env`:
```bash
# Comment out this line:
# VITE_RECAPTCHA_SITE_KEY=...
```

---

## 📋 What You Get

After successful login at `/admin`, you can:

- ✅ **Manage Posts** - Create, edit, delete articles
- ✅ **Manage Sections** - Add/edit site sections
- ✅ **Manage Categories** - Organize content
- ✅ **View Members** - See registered users
- ✅ **Manage Subscriptions** - Handle premium plans

---

## 🔍 Console Logs

Open browser console (F12) to see detailed logs:

**Registration**:
```
Creating admin account for: your@email.com
Account created, signing in to set admin role...
Signed in, setting admin role...
Admin role set, signing out...
Registration complete, switched to login tab
```

**Login**:
```
Attempting admin login for: your@email.com
Admin login - User authenticated: [user-id]
Admin profile updated successfully
Admin role updated successfully
Admin login successful, user role: admin isAdmin: true
Admin login successful, navigating to /admin
```

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `database/VERIFY_ADMIN_SETUP.sql` | Check if database is ready |
| `database/SETUP_ADMIN_TABLES.sql` | Set up database tables/policies |
| `ADMIN_LOGIN_TEST_GUIDE.md` | Detailed testing guide |
| `ADMIN_LOGIN_FIXED.md` | Technical documentation |
| `src/pages/AdminLoginPage.tsx` | Login/registration UI |
| `src/contexts/AuthContext.tsx` | Authentication logic |

---

## ✅ Success Checklist

- [ ] Ran verification script - all green
- [ ] Created admin account - saw success message
- [ ] Logged in - redirected to `/admin`
- [ ] Can see admin sidebar
- [ ] Can access Posts page
- [ ] Can create a test post
- [ ] Can logout successfully

---

## 🎯 Next Steps

1. **Test the system** - Follow Step 1-3 above
2. **Create your real admin account** - Use your actual email
3. **Start managing content** - Add posts, sections, categories
4. **Invite team members** - Create more admin accounts if needed

---

## 💡 Tips

- **Always check console** (F12) for detailed logs
- **Use strong passwords** for production
- **Keep `.env` file secure** - Never commit to git
- **Test in incognito** to verify fresh user experience
- **Backup database** before making changes

---

## 📞 Need Help?

1. Check `ADMIN_LOGIN_TEST_GUIDE.md` for detailed troubleshooting
2. Run `database/VERIFY_ADMIN_SETUP.sql` to diagnose issues
3. Check browser console (F12) for error messages
4. Verify Supabase connection in `.env` file

---

**Ready? Start with Step 1! 🚀**
