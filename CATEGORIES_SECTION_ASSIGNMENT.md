# Categories and Sections - How They Work Together

## Overview
Categories **must** be assigned to a Section. This creates a hierarchical structure:
```
Section (e.g., "Emergency News")
  └── Category (e.g., "Natural Disasters")
  └── Category (e.g., "Terrorism")
  └── Category (e.g., "Cyber Attacks")
```

---

## Database Structure

### Sections Table
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY,
  slug TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER,
  is_active BOOLEAN
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES sections(id),  -- Links to parent section
  name TEXT,
  slug TEXT,
  description TEXT
);
```

**Key Point**: `section_id` is a foreign key that links each category to its parent section.

---

## How to Create Categories in Admin Panel

### Step 1: Make Sure Sections Exist
1. Go to `/admin/sections`
2. Check if you have sections created
3. If not, create sections first (e.g., "Emergency News", "Preparedness", "Training")

### Step 2: Create Category
1. Go to `/admin/categories`
2. Click **"New Category"** button
3. Fill in the form:
   - **Section**: Select which section this category belongs to (REQUIRED)
   - **Name**: Category name (e.g., "Natural Disasters")
   - **Slug**: URL-friendly version (e.g., "natural-disasters")
   - **Description**: Brief description (optional)
4. Click **"Create"**

### Step 3: View Categories
The categories table shows:
- **Name**: Category name
- **Section**: Which section it belongs to (shown as blue badge)
- **Slug**: URL slug
- **Description**: Category description
- **Posts**: Number of posts in this category
- **Actions**: Edit or Delete buttons

---

## How It Works in Posts

When creating a post in `/admin/posts`:

1. **Select Section First**
   - Choose a section from the dropdown
   - Example: "Emergency News"

2. **Then Select Category**
   - Category dropdown automatically filters to show only categories from the selected section
   - Example: If you selected "Emergency News", you'll only see categories like "Natural Disasters", "Terrorism", etc.

3. **Section-Category Relationship**
   - This ensures posts are properly organized
   - Users can browse by section, then filter by category
   - URLs follow pattern: `/section/emergency-news/natural-disasters`

---

## Example Structure

```
📁 Emergency News (Section)
   ├── 🏷️ Natural Disasters (Category)
   ├── 🏷️ Terrorism (Category)
   └── 🏷️ Cyber Attacks (Category)

📁 Preparedness (Section)
   ├── 🏷️ Food Storage (Category)
   ├── 🏷️ Water Purification (Category)
   └── 🏷️ First Aid (Category)

📁 Training (Section)
   ├── 🏷️ Survival Skills (Category)
   ├── 🏷️ Self Defense (Category)
   └── 🏷️ Emergency Response (Category)
```

---

## Frontend Display

### Homepage
- Shows sections as main navigation
- Each section card shows its categories

### Section Page (`/section/emergency-news`)
- Shows all posts from that section
- Sidebar shows categories within that section
- Click category to filter posts

### Category Page (`/section/emergency-news/natural-disasters`)
- Shows only posts from that specific category
- Breadcrumb: Home > Emergency News > Natural Disasters

---

## Admin Panel Features

### Categories Management (`/admin/categories`)
✅ **Create** new categories and assign to sections
✅ **Edit** existing categories (change name, section, description)
✅ **Delete** categories (if no posts are using them)
✅ **View** which section each category belongs to
✅ **See** post count per category

### Posts Management (`/admin/posts`)
✅ **Section dropdown** - Select section first
✅ **Category dropdown** - Automatically filtered by selected section
✅ **Smart filtering** - Only see relevant categories

---

## Important Notes

1. **Categories MUST have a section**
   - You cannot create a category without assigning it to a section
   - The section dropdown is required

2. **Section-first workflow**
   - Always select section before category
   - This ensures proper organization

3. **Deleting sections**
   - If you delete a section, all its categories are also deleted (CASCADE)
   - Be careful when deleting sections

4. **Editing categories**
   - You can move a category to a different section by editing it
   - This will affect all posts using that category

---

## Summary

✅ **Sections** = Top-level organization (Emergency News, Preparedness, Training)
✅ **Categories** = Sub-organization within sections (Natural Disasters, Food Storage, etc.)
✅ **Posts** = Belong to one section and one category
✅ **Hierarchy** = Section → Category → Posts

**To create a category**: Go to `/admin/categories` → Click "New Category" → Select section → Fill in details → Create

**To assign category to post**: Go to `/admin/posts` → Select section → Select category (filtered by section) → Create post
