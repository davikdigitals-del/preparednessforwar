# MEMBER PORTAL - DEPLOYMENT CHECKLIST

## 📋 Pre-Deployment Steps

### 1. Database Setup
- [ ] Open Supabase SQL Editor
- [ ] Run `database/CREATE_MEMBER_PORTAL_SYSTEM.sql`
- [ ] Verify all 10 tables created
- [ ] Check RLS policies are enabled
- [ ] Confirm default report categories inserted (8 categories)

### 2. Environment Variables
- [ ] Verify `.env` has all required variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`

### 3. Build & Deploy
```bash
# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Deploy to Render/Vercel/Netlify
# (Your existing deployment process)
```

### 4. PWA Configuration
- [ ] Verify `public/manifest.json` exists
- [ ] Verify `public/service-worker.js` exists
- [ ] Verify `public/offline.html` exists
- [ ] Check `index.html` has manifest link
- [ ] Confirm service worker registration in `main.tsx`

### 5. Icon Assets (Optional but Recommended)
Create these icons for PWA:
- [ ] `public/icon-192.png` (192x192px)
- [ ] `public/icon-512.png` (512x512px)

You can use any logo/icon for your site. If you don't have icons yet, the PWA will still work, just won't have custom icons when installed.

---

## 🧪 Testing Checklist

### Member Features
- [ ] Register new account
- [ ] Login to member dashboard
- [ ] Submit a field report
- [ ] View "My Reports" page
- [ ] Download content for offline (course/video)
- [ ] Check "Offline Content Manager"
- [ ] Create note in "My Bunker"
- [ ] Create checklist in "My Bunker"
- [ ] Add emergency contact in "My Bunker"
- [ ] View "Community Reports" page (public)

### Admin Features
- [ ] Login to admin panel
- [ ] Navigate to "Member Reports" (under Moderation)
- [ ] Review pending report
- [ ] Approve a report
- [ ] Reject a report with reason
- [ ] Feature an approved report
- [ ] Check report appears on Community Reports page

### Offline Testing
- [ ] Open site in Chrome DevTools
- [ ] Go to Application > Service Workers
- [ ] Verify service worker is registered
- [ ] Check "Offline" checkbox in DevTools
- [ ] Navigate to dashboard (should work)
- [ ] Try to access downloaded content (should work)
- [ ] Try to submit report (should queue or show offline message)

### PWA Testing
- [ ] Open site on mobile device
- [ ] Look for "Install App" prompt
- [ ] Install the PWA
- [ ] Open installed app
- [ ] Verify it opens in standalone mode
- [ ] Test offline functionality in installed app

---

## 🔍 Verification Steps

### Database Verification
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'member_%' OR table_name LIKE 'report_%';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'member_%';

-- Check default categories
SELECT * FROM report_categories ORDER BY display_order;
```

### Service Worker Verification
1. Open Chrome DevTools
2. Go to Application tab
3. Click "Service Workers"
4. Should see: `pfw-portal-v1` registered
5. Status should be "activated and running"

### Cache Verification
1. Open Chrome DevTools
2. Go to Application > Cache Storage
3. Should see: `pfw-portal-v1`
4. Should contain precached assets

---

## 🚨 Common Issues & Solutions

### Issue: Service Worker Not Registering
**Solution:**
- Check browser console for errors
- Verify `public/service-worker.js` exists
- Ensure HTTPS (required for SW)
- Clear browser cache and reload

### Issue: Offline Content Not Downloading
**Solution:**
- Check service worker is active
- Verify user is authenticated
- Check browser storage quota
- Look for errors in console

### Issue: Reports Not Appearing
**Solution:**
- Verify database tables created
- Check RLS policies
- Ensure user is authenticated
- Check admin approval status

### Issue: PWA Not Installable
**Solution:**
- Verify manifest.json is accessible
- Check HTTPS is enabled
- Ensure service worker is registered
- Verify manifest link in index.html

---

## 📱 Mobile Testing

### iOS (Safari)
- [ ] Open site in Safari
- [ ] Tap Share button
- [ ] Tap "Add to Home Screen"
- [ ] Open from home screen
- [ ] Test offline mode

### Android (Chrome)
- [ ] Open site in Chrome
- [ ] Look for "Install" prompt
- [ ] Install the app
- [ ] Open from app drawer
- [ ] Test offline mode

---

## 🎯 Success Criteria

✅ All database tables created
✅ Service worker registered
✅ PWA installable on mobile
✅ Offline mode works
✅ Members can submit reports
✅ Admins can review reports
✅ Content downloads for offline
✅ My Bunker features work
✅ Community reports page shows approved reports
✅ No console errors

---

## 📊 Performance Checks

### Lighthouse Audit
Run Lighthouse in Chrome DevTools:
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 80
- [ ] SEO > 80
- [ ] PWA > 80

### Key Metrics
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Service Worker registered
- [ ] Installable
- [ ] Works offline

---

## 🔐 Security Checks

- [ ] RLS enabled on all tables
- [ ] Admin-only routes protected
- [ ] User data isolated (can only see own)
- [ ] Public reports only show approved
- [ ] No sensitive data in client code
- [ ] Environment variables not exposed

---

## 📝 Post-Deployment

### Monitor
- [ ] Check error logs
- [ ] Monitor database usage
- [ ] Track service worker updates
- [ ] Watch storage usage
- [ ] Monitor report submissions

### User Communication
- [ ] Announce new member portal
- [ ] Explain offline features
- [ ] Guide on installing PWA
- [ ] Tutorial on submitting reports
- [ ] FAQ for common questions

---

## 🎉 Launch Checklist

- [ ] Database deployed
- [ ] Application deployed
- [ ] Service worker active
- [ ] PWA installable
- [ ] All features tested
- [ ] Admin panel accessible
- [ ] Documentation complete
- [ ] Team trained
- [ ] Users notified
- [ ] Monitoring active

---

## 📞 Support Resources

- **Documentation:** `MEMBER_PORTAL_COMPLETE.md`
- **Database Schema:** `database/CREATE_MEMBER_PORTAL_SYSTEM.sql`
- **Service Worker:** `public/service-worker.js`
- **Offline Service:** `src/services/OfflineService.ts`

---

**Status:** Ready for deployment ✅
**Last Updated:** 2026-05-20
