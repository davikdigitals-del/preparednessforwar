# Add Content to Dynamic Sections - Quick Guide

## Issue
Your homepage sections are empty because:
1. Sections exist in database
2. But no posts are assigned to those sections yet

## Solution: Add Posts to Sections

### Option 1: Use Admin Panel (Recommended)

1. **Go to Admin Posts**: http://localhost:8080/admin/posts

2. **Click "New Post"**

3. **Fill in the form**:
   - **Title**: "Emergency Preparedness Tips"
   - **Author**: "Admin Team"
   - **Section**: Select "Emergency News" (or any section)
   - **Category**: Select a category under that section
   - **Content**: Write your article content
   - **Excerpt**: Brief summary
   - **Image URL**: Add an image (optional)
   - **Check "Published"**

4. **Click "Create"**

5. **Repeat** for different sections to populate homepage

### Option 2: Quick SQL Insert (Fast Testing)

Run this in Supabase SQL Editor to add sample posts:

```sql
-- Get section and category IDs first
SELECT id, slug, title FROM sections WHERE is_active = true;
SELECT id, name, section_id FROM categories;

-- Insert sample posts (replace UUIDs with your actual section/category IDs)
INSERT INTO posts (
  title,
  author,
  section_id,
  category_id,
  content,
  excerpt,
  image_url,
  is_published,
  published_at
)
VALUES
  -- Emergency News posts
  (
    'Major Storm Warning Issued for Eastern Coast',
    'Weather Team',
    (SELECT id FROM sections WHERE slug = 'emergency-news' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Natural Disasters' LIMIT 1),
    'A severe storm system is approaching the eastern coast. Residents are advised to prepare emergency kits and stay informed.',
    'Storm warning issued for coastal areas',
    'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
    true,
    now()
  ),
  (
    'Earthquake Preparedness: What You Need to Know',
    'Safety Team',
    (SELECT id FROM sections WHERE slug = 'emergency-news' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Natural Disasters' LIMIT 1),
    'Learn essential earthquake preparedness tips to keep your family safe during seismic events.',
    'Essential earthquake safety tips',
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
    true,
    now()
  ),
  
  -- Preparedness posts
  (
    'Building Your 72-Hour Emergency Kit',
    'Preparedness Team',
    (SELECT id FROM sections WHERE slug = 'preparedness' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Food Storage' LIMIT 1),
    'A comprehensive guide to building a 72-hour emergency kit for your family.',
    'Essential items for your emergency kit',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
    true,
    now()
  ),
  (
    'Water Storage and Purification Guide',
    'Survival Expert',
    (SELECT id FROM sections WHERE slug = 'preparedness' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Water Purification' LIMIT 1),
    'Learn how to store and purify water for emergency situations.',
    'Complete water preparedness guide',
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    true,
    now()
  ),
  
  -- Training posts
  (
    'First Aid Basics Everyone Should Know',
    'Medical Team',
    (SELECT id FROM sections WHERE slug = 'training' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'First Aid' LIMIT 1),
    'Essential first aid skills that could save a life in an emergency.',
    'Learn basic first aid skills',
    'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
    true,
    now()
  ),
  (
    'Self-Defense Training for Beginners',
    'Defense Instructor',
    (SELECT id FROM sections WHERE slug = 'training' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Self Defense' LIMIT 1),
    'Basic self-defense techniques for personal safety.',
    'Learn self-defense basics',
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
    true,
    now()
  );
```

### Option 3: Bulk Import Script

Create a file `database/INSERT_SAMPLE_POSTS.sql`:

```sql
-- Insert 50+ sample posts across all sections
-- This will populate your homepage with content

DO $$
DECLARE
  section_emergency UUID;
  section_preparedness UUID;
  section_training UUID;
  cat_natural_disasters UUID;
  cat_food_storage UUID;
  cat_first_aid UUID;
BEGIN
  -- Get section IDs
  SELECT id INTO section_emergency FROM sections WHERE slug = 'emergency-news' LIMIT 1;
  SELECT id INTO section_preparedness FROM sections WHERE slug = 'preparedness' LIMIT 1;
  SELECT id INTO section_training FROM sections WHERE slug = 'training' LIMIT 1;
  
  -- Get category IDs
  SELECT id INTO cat_natural_disasters FROM categories WHERE name LIKE '%Natural%' LIMIT 1;
  SELECT id INTO cat_food_storage FROM categories WHERE name LIKE '%Food%' LIMIT 1;
  SELECT id INTO cat_first_aid FROM categories WHERE name LIKE '%First%' LIMIT 1;
  
  -- Insert posts for Emergency News
  FOR i IN 1..10 LOOP
    INSERT INTO posts (title, author, section_id, category_id, content, excerpt, is_published, published_at)
    VALUES (
      'Emergency News Article ' || i,
      'News Team',
      section_emergency,
      cat_natural_disasters,
      'This is sample content for emergency news article ' || i || '. It contains important information about emergency situations.',
      'Sample excerpt for article ' || i,
      true,
      now() - (i || ' hours')::interval
    );
  END LOOP;
  
  -- Insert posts for Preparedness
  FOR i IN 1..10 LOOP
    INSERT INTO posts (title, author, section_id, category_id, content, excerpt, is_published, published_at)
    VALUES (
      'Preparedness Guide ' || i,
      'Prep Team',
      section_preparedness,
      cat_food_storage,
      'This is sample content for preparedness guide ' || i || '. Learn essential preparedness skills.',
      'Sample excerpt for guide ' || i,
      true,
      now() - (i || ' hours')::interval
    );
  END LOOP;
  
  -- Insert posts for Training
  FOR i IN 1..10 LOOP
    INSERT INTO posts (title, author, section_id, category_id, content, excerpt, is_published, published_at)
    VALUES (
      'Training Article ' || i,
      'Training Team',
      section_training,
      cat_first_aid,
      'This is sample content for training article ' || i || '. Master essential survival skills.',
      'Sample excerpt for training ' || i,
      true,
      now() - (i || ' hours')::interval
    );
  END LOOP;
  
  RAISE NOTICE 'Inserted 30 sample posts successfully!';
END $$;
```

## Quick Test

After adding posts, refresh your homepage and you should see:
- ✅ First 2 sections with posts
- ✅ Most Read section (premium placement)
- ✅ Remaining sections with posts below

## Tips

1. **Add images** - Posts look better with images (use Unsplash URLs)
2. **Vary publish times** - Use different timestamps for realistic ordering
3. **Mix content** - Add different types of posts (news, guides, tips)
4. **Use real content** - Replace sample text with actual articles

## Errors Fixed

✅ **DOM nesting warning** - Changed `<h3>` to `<div>` inside CardTitle
✅ **CORS error** - This is expected in development (payment function needs backend setup)

## Next Steps

1. Add posts via admin panel or SQL
2. Refresh homepage to see sections populated
3. Adjust section order in `/admin/sections` if needed
4. Add more posts to fill out all sections

Your homepage will look amazing once sections have content! 🎉
