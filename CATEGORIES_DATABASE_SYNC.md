# Categories Database Sync - Summary

## What Was Done

### 1. Restored Original Files
- ✅ Restored `src/pages/SectionPage.tsx` - Uses mockData for categories
- ✅ Restored `src/components/layout/SiteHeader.tsx` - Uses mockData for navigation

### 2. Created Database Sync Script
- ✅ Created `database/SYNC_CATEGORIES_FROM_MOCKDATA.sql`
- Syncs all categories from mockData.ts to database
- Ensures database reflects what's in the code

## Current Setup

### Frontend (Code)
**Uses mockData.ts** for navigation and categories:
- SiteHeader navigation menu
- SectionPage category pills
- PostCard section colors
- All other frontend displays

### Admin Panel
**Uses Database** for category management:
- AdminCategories - CRUD interface
- AdminPosts - Category selection (filtered by section)
- AdminSections - Section management

## How It Works

### Navigation & Display (Frontend)
```typescript
// Uses mockData
import { navSections } from "@/data/mockData";

const section = navSections.find(s => s.slug === "emergency-news");
// Shows: UK Alerts, NATO Updates, Global Situation, Infrastructure
```

### Admin Management (Backend)
```typescript
// Uses database
const { data } = await supabase
  .from("categories")
  .select("*")
  .eq("section_id", sectionId);
// Manages categories in database
```

## Categories in mockData.ts

### 1. Emergency News (4 categories)
- UK Alerts
- NATO Updates
- Global Situation
- Infrastructure Disruptions

### 2. Survival Guides (5 categories)
- Emergency Planning
- Evacuation & Shelter
- Home Preparation
- Urban Survival
- Rural Survival

### 3. Health & Vaccination (5 categories)
- Children
- Adults
- Elderly
- First Aid
- Mental Health

### 4. Official Directives (4 categories)
- UK Ministry of Defence
- NATO Civil Preparedness
- EU Civil Protection
- Red Cross Guidance

### 5. Essential Supplies (7 categories)
- Water
- Food & Rations
- Medical & Medicines
- Power & Light
- Communication & Safety
- Clothing & Shelter
- Hygiene & Sanitation

### 6. Resources (4 categories)
- Checklists
- Templates
- Schedules
- Downloads

### 7. Education (3 categories)
- Courses
- Training Programmes
- Workshops

### 8. Podcast & Video (4 categories)
- Podcasts
- Videos
- Documentaries
- Interviews

**Total: 36 categories across 8 sections**

## Database Sync Script

### What It Does
The `SYNC_CATEGORIES_FROM_MOCKDATA.sql` script:

1. **Gets section IDs** from database
2. **Inserts/updates categories** to match mockData
3. **Sets proper order** (order_index)
4. **Activates all categories** (is_active = true)
5. **Uses ON CONFLICT** to update existing categories

### How to Run

**Option 1: Supabase SQL Editor**
```sql
-- Copy and paste the entire script into Supabase SQL Editor
-- Click "Run"
```

**Option 2: Using Supabase Power (MCP)**
```typescript
// Use the apply_migration tool
kiroPowers.use({
  powerName: "supabase-hosted",
  serverName: "supabase",
  toolName: "apply_migration",
  arguments: {
    project_id: "xfbmpjgcfohewejdzlfw",
    name: "sync_categories_from_mockdata",
    query: "-- paste script here --"
  }
});
```

### What It Updates
```sql
-- For each category:
INSERT INTO categories (section_id, slug, title, order_index, is_active)
VALUES (section_id, 'category-slug', 'Category Title', 0, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section_id = EXCLUDED.section_id,
  order_index = EXCLUDED.order_index;
```

## Why This Approach?

### Advantages
1. ✅ **Frontend stays fast** - No database queries for navigation
2. ✅ **Admin has flexibility** - Can manage categories in database
3. ✅ **Easy to maintain** - mockData is version controlled
4. ✅ **No breaking changes** - Existing code continues to work
5. ✅ **Best of both worlds** - Static data for display, dynamic for admin

### Trade-offs
- ⚠️ **Two sources of truth** - mockData and database
- ⚠️ **Manual sync needed** - When adding new categories
- ⚠️ **Admin changes don't affect frontend** - Unless mockData is updated

## When to Sync

### Sync Database → mockData
When admin adds categories in database:
1. Export categories from database
2. Update mockData.ts manually
3. Commit to git

### Sync mockData → Database
When developer adds categories in mockData:
1. Update mockData.ts
2. Run `SYNC_CATEGORIES_FROM_MOCKDATA.sql`
3. Database now matches code

## Admin Category Management

### What Works Now
- ✅ View all categories in `/admin/categories`
- ✅ Create new categories
- ✅ Edit existing categories
- ✅ Delete categories
- ✅ Assign categories to sections
- ✅ Set category order
- ✅ Activate/deactivate categories

### What Admin Changes Affect
- ✅ **AdminPosts** - Category dropdown (filtered by section)
- ✅ **Database queries** - Any admin panel queries
- ❌ **Frontend navigation** - Still uses mockData
- ❌ **Section pages** - Still uses mockData
- ❌ **Homepage** - Still uses mockData

## Recommended Workflow

### For Developers
1. Add categories to `mockData.ts`
2. Run sync script to update database
3. Commit both changes to git

### For Admins
1. Add categories via `/admin/categories`
2. Notify developer to update mockData.ts
3. Developer syncs mockData with database

### For Production
1. Keep mockData as source of truth
2. Sync database on deployment
3. Admin can manage but changes are temporary until synced to code

## Future Enhancement Options

### Option 1: Fully Dynamic (Database-First)
- Remove mockData categories
- Load everything from database
- Requires caching for performance
- More flexible but slower

### Option 2: Hybrid with Cache
- Load from database on first visit
- Cache in localStorage
- Refresh periodically
- Best of both worlds

### Option 3: Build-Time Generation
- Generate mockData from database at build time
- Static for performance
- Dynamic for admin
- Requires build pipeline

## Files Involved

### Frontend (Uses mockData)
- `src/data/mockData.ts` - Source of truth for frontend
- `src/components/layout/SiteHeader.tsx` - Navigation menu
- `src/pages/SectionPage.tsx` - Category pills
- `src/pages/Index.tsx` - Section displays
- `src/components/PostCard.tsx` - Section colors

### Admin (Uses Database)
- `src/pages/admin/AdminCategories.tsx` - Category CRUD
- `src/pages/admin/AdminPosts.tsx` - Category selection
- `src/pages/admin/AdminSections.tsx` - Section management

### Database
- `database/SYNC_CATEGORIES_FROM_MOCKDATA.sql` - Sync script
- `public.sections` table - Sections data
- `public.categories` table - Categories data

## Testing Checklist

After running sync script:

- [ ] Run `SYNC_CATEGORIES_FROM_MOCKDATA.sql` in Supabase
- [ ] Check categories in `/admin/categories`
- [ ] Verify all 36 categories exist
- [ ] Check each section has correct categories
- [ ] Test category selection in `/admin/posts`
- [ ] Verify categories are filtered by section
- [ ] Check frontend navigation still works
- [ ] Verify section pages show correct categories

## Summary

✅ **Current State:**
- Frontend uses mockData (fast, static)
- Admin uses database (flexible, dynamic)
- 36 categories across 8 sections defined in mockData
- Sync script ready to update database

✅ **What You Can Do:**
- Manage categories in admin panel
- Categories appear in post creation
- Categories filtered by section
- Frontend navigation works from mockData

⚠️ **Important:**
- Admin category changes don't affect frontend navigation
- To update frontend, must update mockData.ts
- Run sync script when mockData changes

🎯 **Recommendation:**
Keep current setup. It's fast, works well, and gives you admin flexibility. Just remember to sync mockData → Database when you add new categories in code.
