# 🗺️ MEMBER PORTAL - ROUTES REFERENCE

## Quick reference for all routes in the application

---

## 🏠 PUBLIC ROUTES

### Homepage & Content
```
/                              # Homepage
/latest                        # Latest posts
/library                       # Library page
/encyclopaedia                 # Encyclopaedia
/media                         # Media hub
/about                         # About page
/newsletter                    # Newsletter signup
```

### Legal & Info
```
/privacy                       # Privacy policy
/terms                         # Terms of service
/disclaimer                    # Disclaimer
/legal/:page                   # Dynamic legal pages
```

### Content Pages
```
/:section                      # Section page (e.g., /news)
/:section/:category            # Category page
/:section/:category/:id        # Article page
/tag/:tag                      # Posts by tag
```

### Community
```
/community-reports             # 🆕 Public approved member reports
/countries                     # NATO countries page
```

---

## 🔐 AUTHENTICATION ROUTES

```
/login                         # Member login
/signup                        # Member signup
/admin-login                   # Admin login (separate)
```

---

## 👤 MEMBER DASHBOARD ROUTES

### Main Dashboard
```
/dashboard                     # Main member dashboard
/dashboard/home               # 🆕 Command center overview
```

### Training & Courses
```
/courses                       # Browse all courses
/courses/:slug                 # Course detail page
/courses/:slug/learn          # Course player
/my-courses                    # My enrolled courses
/dashboard/training           # 🆕 Training academy view
/checkout/course/:courseId    # Course checkout
```

### Member Reports
```
/dashboard/submit-report      # 🆕 Submit new field report
/dashboard/my-reports         # 🆕 View own reports
```

### Offline & Content
```
/dashboard/offline-content    # 🆕 Manage offline downloads
```

### Personal Space
```
/dashboard/my-bunker          # 🆕 Notes, checklists, contacts
```

### Account & Subscription
```
/my-subscription              # Manage subscription
/subscribe                    # Subscribe to premium
/notifications                # View notifications
```

### Shopping
```
/shop                         # Affiliate products (NOT in portal)
```

---

## 👨‍💼 ADMIN ROUTES

### Dashboard & Analytics
```
/admin                        # Admin dashboard
/admin/analytics              # Analytics & stats
```

### Content Management
```
/admin/posts                  # Manage posts
/admin/categories             # Manage categories
/admin/sections               # Manage sections
/admin/media                  # Media library
/admin/podcast-videos         # Podcast & videos
/admin/library                # Library content
/admin/encyclopaedia          # Encyclopaedia entries
/admin/pages                  # Static pages
```

### Courses & Monetization
```
/admin/courses                # Manage courses
/admin/courses/:id/builder    # Course builder
/admin/enrollments            # Course enrollments
/admin/affiliate-products     # Affiliate products
/admin/sponsors               # Sponsors
/admin/advertisements         # Advertisements
/admin/revenue                # Revenue tracking
```

### Members & Moderation
```
/admin/members                # Manage members
/admin/subscriptions          # Subscriptions
/admin/reports                # Content reports
/admin/comments               # Comments moderation
/admin/member-reports         # 🆕 Review member field reports
```

### Site Management
```
/admin/alerts                 # Emergency alerts
/admin/banner                 # Banner management
/admin/countries              # Countries management
/admin/settings               # Site settings
```

---

## 🆕 NEW ROUTES ADDED

### Member Portal Routes
```
/dashboard/home               # Command center overview
/dashboard/training           # Training academy
/dashboard/submit-report      # Submit field report
/dashboard/my-reports         # View own reports
/dashboard/offline-content    # Manage offline content
/dashboard/my-bunker          # Personal space
/community-reports            # Public reports page
```

### Admin Routes
```
/admin/member-reports         # Review member reports
```

---

## 🔒 ROUTE PROTECTION

### Public Routes
- Accessible to everyone
- No authentication required
- Examples: /, /community-reports, /courses

### Member Routes
- Requires authentication
- Redirects to /login if not authenticated
- Examples: /dashboard, /my-courses, /dashboard/my-bunker

### Admin Routes
- Requires authentication AND admin role
- Redirects to /admin-login if not authenticated
- Redirects to / if authenticated but not admin
- Examples: /admin, /admin/member-reports

---

## 📱 MOBILE APP ROUTES

When installed as PWA, these routes work offline:

### Cached Routes (Work Offline)
```
/                             # Homepage (cached)
/dashboard                    # Dashboard (cached)
/my-courses                   # Courses (cached)
/dashboard/offline-content    # Offline manager (cached)
/dashboard/my-bunker          # Personal space (cached)
```

### Online-Only Routes
```
/dashboard/submit-report      # Requires internet
/community-reports            # Requires internet
/courses (browse)             # Requires internet
```

---

## 🎯 ROUTE PATTERNS

### Dynamic Routes
```
/:section                     # Any section slug
/:section/:category           # Any category in section
/:section/:category/:id       # Any article
/tag/:tag                     # Any tag
/courses/:slug                # Any course slug
/courses/:slug/learn          # Course player
/checkout/course/:courseId    # Course checkout
/legal/:page                  # Legal pages
/admin/courses/:id/builder    # Course builder
```

---

## 🔗 NAVIGATION HELPERS

### Main Navigation
- Homepage: `/`
- Dashboard: `/dashboard`
- Courses: `/courses`
- Community: `/community-reports`
- Shop: `/shop`

### Quick Actions (Dashboard)
- Submit Report: `/dashboard/submit-report`
- My Reports: `/dashboard/my-reports`
- Offline Content: `/dashboard/offline-content`
- My Bunker: `/dashboard/my-bunker`
- Training: `/dashboard/training`

### Admin Quick Links
- Dashboard: `/admin`
- Member Reports: `/admin/member-reports`
- Courses: `/admin/courses`
- Members: `/admin/members`
- Analytics: `/admin/analytics`

---

## 📊 ROUTE STATISTICS

### Total Routes
- **Public Routes:** ~20
- **Member Routes:** ~15
- **Admin Routes:** ~25
- **Total:** ~60 routes

### New Routes Added
- **Member Portal:** 7 new routes
- **Admin:** 1 new route
- **Total New:** 8 routes

---

## 🚀 ROUTE USAGE

### Most Used Routes (Expected)
1. `/dashboard` - Member dashboard
2. `/courses` - Browse courses
3. `/my-courses` - Enrolled courses
4. `/` - Homepage
5. `/community-reports` - Community reports

### Admin Most Used
1. `/admin` - Admin dashboard
2. `/admin/posts` - Manage posts
3. `/admin/member-reports` - Review reports
4. `/admin/courses` - Manage courses
5. `/admin/members` - Manage members

---

## 🔍 ROUTE SEARCH

### Find Routes by Feature

**Training/Courses:**
- `/courses`, `/my-courses`, `/dashboard/training`

**Reports:**
- `/dashboard/submit-report`, `/dashboard/my-reports`, `/community-reports`, `/admin/member-reports`

**Offline:**
- `/dashboard/offline-content`

**Personal:**
- `/dashboard/my-bunker`

**Admin:**
- `/admin/*` (all admin routes)

---

## 📝 NOTES

1. All `/dashboard/*` routes require authentication
2. All `/admin/*` routes require admin role
3. PWA caches key routes for offline access
4. Dynamic routes use React Router params
5. 404 page for unknown routes: `*`

---

**Last Updated:** May 20, 2026
**Total Routes:** ~60
**New Routes:** 8
