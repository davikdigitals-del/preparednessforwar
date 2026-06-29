# 🛡️ Preparedness for War

**A comprehensive preparedness intelligence platform for NATO nations and beyond.**

Complete with admin portal, premium content management, and subscription system.

---

## ✨ Features

### 🎯 Core Platform
- **Content Management** - Posts, media, library, encyclopaedia
- **Emergency Alerts** - Critical notifications system
- **Country Targeting** - NATO member-specific content
- **User Authentication** - Secure login & profiles
- **Premium Subscriptions** - Monetization ready

### 👨‍💼 Admin Portal
- **Dashboard** - Analytics & overview
- **Post Editor** - Rich content creation
- **Media Manager** - File uploads & organization
- **Library Manager** - Document management
- **Alert System** - Emergency notifications
- **Site Settings** - Full configuration

### ⭐ Premium Features
- **Premium Content** - Mark posts/media as premium
- **Subscription Plans** - Free, Monthly, Annual
- **Premium Gate** - Beautiful paywall UI
- **User Subscriptions** - Track member plans
- **Admin Bypass** - Test premium features

---

## 🚀 Quick Start

### 1. Database Setup (30 seconds)

Run these files in **Supabase SQL Editor** (in order):

```bash
1. database/ALL_IN_ONE_COMPLETE.sql
2. database/ROLES_SETUP.sql
3. database/STORAGE_SETUP.sql
4. database/PREMIUM_SUBSCRIPTIONS.sql
5. database/MAKE_ADMIN.sql (after signing up)
```

**See:** `database/FINAL_SETUP_GUIDE.md` for detailed instructions

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
# or
bun dev
```

Visit: `http://localhost:8080`

### 5. Access Admin Portal

1. Sign up at `/signup`
2. Make yourself admin (see `ADMIN_QUICK_START.md`)
3. Login at `/admin-login`
4. Start creating content!

---

## 📚 Documentation

### 🎯 Quick Guides
- **[ADMIN_QUICK_START.md](./ADMIN_QUICK_START.md)** - 2-minute admin setup
- **[COMPLETE_SETUP_SUMMARY.md](./COMPLETE_SETUP_SUMMARY.md)** - What you have

### 📖 Complete Guides
- **[ADMIN_PREMIUM_GUIDE.md](./ADMIN_PREMIUM_GUIDE.md)** - Admin & premium features
- **[database/FINAL_SETUP_GUIDE.md](./database/FINAL_SETUP_GUIDE.md)** - Database setup

### 🔧 Reference
- **[database/QUICK_REFERENCE.md](./database/QUICK_REFERENCE.md)** - SQL examples
- **[database/INDEX.md](./database/INDEX.md)** - All database files

### 🧪 Testing
- **[database/ADMIN_TESTING_CHECKLIST.md](./database/ADMIN_TESTING_CHECKLIST.md)** - Testing guide
- **[database/ADMIN_TROUBLESHOOTING.md](./database/ADMIN_TROUBLESHOOTING.md)** - Common issues

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **Lucide Icons** - Icons

### Backend
- **Supabase** - Backend as a service
- **PostgreSQL** - Database
- **Row Level Security** - Authorization
- **Supabase Storage** - File uploads
- **Supabase Auth** - Authentication

---

## 📁 Project Structure

```
sentinel-network-main/
├── src/
│   ├── components/          # Reusable components
│   │   ├── home/           # Homepage sections
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components (shadcn)
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Authentication
│   │   └── DataContext.tsx # Data management
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin portal
│   │   ├── HomePage.tsx
│   │   ├── ArticlePage.tsx
│   │   └── ...
│   ├── lib/                # Utilities
│   │   ├── supabase.ts     # Supabase client
│   │   └── storage.ts      # File uploads
│   └── App.tsx             # Main app
├── database/               # Database setup
│   ├── *.sql              # SQL files
│   └── *.md               # Documentation
├── public/                 # Static assets
└── Documentation files
```

---

## 🎨 Key Features

### Content Management
- **Posts** - Articles with sections & categories
- **Media Library** - Videos & podcasts
- **Document Library** - PDFs & guides
- **Encyclopaedia** - A-Z reference
- **Emergency Alerts** - Critical notifications

### User System
- **Authentication** - Email/password
- **Profiles** - User accounts
- **Roles** - Admin/Member
- **Preferences** - User settings
- **Activity Tracking** - User engagement

### Premium System
- **Premium Content** - Mark any content as premium
- **Subscription Plans** - Free, Monthly (£9.99), Annual (£89.99)
- **Premium Gate** - Beautiful paywall UI
- **User Subscriptions** - Track member plans
- **Admin Bypass** - Admins see all content

### Admin Portal
- **Dashboard** - Analytics & stats
- **Post Editor** - Rich content creation
- **Media Manager** - File uploads
- **Library Manager** - Document management
- **Alert Creator** - Emergency notifications
- **Site Settings** - Full configuration
- **Subscription Manager** - Plan management
- **Member Viewer** - User management

---

## 🔑 Admin Access

### Make Yourself Admin

After signing up, run in **Supabase SQL Editor**:

```sql
-- Replace with your email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;
```

Or use the function:

```sql
SELECT public.assign_admin_role();
```

### Admin URLs

- **Login:** `/admin-login`
- **Dashboard:** `/admin`
- **Posts:** `/admin/posts`
- **Media:** `/admin/media`
- **Library:** `/admin/library`
- **Alerts:** `/admin/alerts`
- **Settings:** `/admin/settings`

---

## ⭐ Premium Content

### Mark Content as Premium

**In Admin Portal:**

1. Edit post/media/document
2. Find "★ Premium Only" toggle
3. Turn it ON
4. Save/Publish

**What Happens:**
- Non-premium users see premium gate
- Content is blurred/locked
- Subscription options shown
- Admins can still view (bypass)

### Subscription Plans

**Default Plans:**

1. **Free** - £0/month
   - Free articles
   - Basic features
   - Emergency alerts

2. **Premium Monthly** - £9.99/month
   - All free features
   - Premium articles
   - Exclusive videos
   - Full library access

3. **Premium Annual** - £89.99/year
   - All monthly features
   - 2 months free
   - Priority support
   - Early access

---

## 🧪 Testing

### Quick Test

1. **Database Setup**
   ```bash
   # Run 5 SQL files in Supabase
   ```

2. **Make Admin**
   ```sql
   SELECT public.assign_admin_role();
   ```

3. **Access Admin**
   - Go to `/admin-login`
   - Sign in
   - See dashboard

4. **Create Premium Post**
   - Click "New Post"
   - Fill in content
   - Toggle "★ Premium Only"
   - Publish

5. **Test Premium Gate**
   - Sign out
   - View post as guest
   - See premium gate

**See:** `database/ADMIN_TESTING_CHECKLIST.md` for complete testing guide

---

## 🚨 Troubleshooting

### Can't access admin?

```sql
-- Make yourself admin
SELECT public.assign_admin_role();
```

### Premium not working?

```sql
-- Add premium column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
```

### Database errors?

- Check Supabase connection
- Verify environment variables
- Run database setup again

**See:** `database/ADMIN_TROUBLESHOOTING.md` for more solutions

---

## 📊 Database

### Tables (23+)
- profiles
- user_roles
- posts
- media_items
- library_items
- encyclopaedia_entries
- alerts
- subscription_plans
- user_subscriptions
- site_settings
- countries (32 NATO members)
- sections (8 content sections)
- And 11 more...

### Sample Data
- 10 sample posts
- 6 media items
- 6 library documents
- 6 encyclopaedia entries
- 3 alerts
- 3 subscription plans
- 32 countries
- 8 sections

**See:** `database/README.md` for database documentation

---

## 🎯 What's Included

### ✅ Complete Platform
- Frontend (React + TypeScript)
- Backend (Supabase)
- Admin portal
- Premium system
- User authentication
- Content management

### ✅ Ready to Use
- Database setup scripts
- Sample data
- Documentation
- Testing guides
- Troubleshooting

### ✅ Production Ready
- Security configured
- Performance optimized
- Error handling
- Mobile responsive
- SEO friendly

---

## 📖 Learn More

### Documentation
- [Admin Quick Start](./ADMIN_QUICK_START.md) - 2-minute setup
- [Complete Setup Summary](./COMPLETE_SETUP_SUMMARY.md) - Overview
- [Admin & Premium Guide](./ADMIN_PREMIUM_GUIDE.md) - Full guide
- [Database Setup](./database/FINAL_SETUP_GUIDE.md) - Database guide

### Database
- [Database README](./database/README.md) - Overview
- [Quick Reference](./database/QUICK_REFERENCE.md) - SQL examples
- [File Index](./database/INDEX.md) - All files

### Testing
- [Testing Checklist](./database/ADMIN_TESTING_CHECKLIST.md) - Test guide
- [Troubleshooting](./database/ADMIN_TROUBLESHOOTING.md) - Common issues

---

## 🤝 Contributing

This is a complete, production-ready platform. Feel free to:

- Customize the design
- Add new features
- Extend functionality
- Improve documentation

---

## 📄 License

This project is part of the Preparedness for War platform.

---

## 🎉 You're Ready!

Your Preparedness for War is **complete** and **production-ready**!

### Next Steps

1. ✅ Run database setup (30 seconds)
2. ✅ Make yourself admin
3. ✅ Access admin portal
4. ✅ Create premium content
5. ✅ Launch your platform!

**Start building your preparedness intelligence hub!** 🚀

---

## 📞 Support

### Documentation
- Read `ADMIN_QUICK_START.md` for quick setup
- Read `ADMIN_PREMIUM_GUIDE.md` for features
- Check `database/ADMIN_TROUBLESHOOTING.md` for issues

### Database
- See `database/FINAL_SETUP_GUIDE.md` for setup
- Use `database/check-schema.sql` to verify
- Check `database/QUICK_REFERENCE.md` for queries

---

**Project:** Preparedness for War  
**Version:** 1.0  
**Status:** Production Ready  
**Setup Time:** 2 minutes  
**Last Updated:** April 24, 2026

**Built with ❤️ for preparedness intelligence**
