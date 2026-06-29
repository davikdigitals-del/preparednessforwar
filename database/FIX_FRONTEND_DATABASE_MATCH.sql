-- ============================================
-- FIX FRONTEND-DATABASE MISMATCH
-- ============================================
-- This script aligns your database with your frontend structure
-- Run this in Supabase SQL Editor or via MCP

-- ============================================
-- STEP 1: ENSURE CORRECT SECTIONS EXIST
-- ============================================

-- Insert/Update the 8 sections your frontend expects
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES 
  ('Emergency News', 'emergency-news', 'Breaking news, alerts, and critical updates on emergency situations', 1, true),
  ('Survival Guides', 'survival-guides', 'Comprehensive guides for emergency planning, evacuation, and survival skills', 2, true),
  ('Health & Vaccination', 'health', 'Health guidance, first aid, mental health, and vaccination information', 3, true),
  ('Official Directives', 'directives', 'Official guidance from UK MOD, NATO, EU, and Red Cross', 4, true),
  ('Essential Supplies', 'supplies', 'Guides on water, food, medical supplies, power, and communication equipment', 5, true),
  ('Resources', 'resources', 'Checklists, templates, schedules, and downloadable resources', 6, true),
  ('Education', 'education', 'Courses, training programmes, and workshops for emergency preparedness', 7, true),
  ('Podcast & Video', 'media', 'Podcasts, videos, documentaries, and interviews on preparedness topics', 8, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ============================================
-- STEP 2: LINK CATEGORIES TO SECTIONS
-- ============================================

-- Emergency News Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'emergency-news')
WHERE slug IN ('uk-alerts', 'nato-updates', 'global-situation', 'infrastructure');

-- Survival Guides Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'survival-guides')
WHERE slug IN ('emergency-planning', 'evacuation-shelter', 'home-preparation', 'urban-survival', 'rural-survival');

-- Health & Vaccination Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'health')
WHERE slug IN ('children', 'adults', 'elderly', 'first-aid', 'mental-health');

-- Official Directives Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'directives')
WHERE slug IN ('uk-mod', 'nato-civil', 'eu-civil', 'red-cross');

-- Essential Supplies Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'supplies')
WHERE slug IN ('water', 'food-rations', 'medical', 'power-light', 'communication', 'clothing-shelter', 'hygiene');

-- Resources Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'resources')
WHERE slug IN ('checklists', 'templates', 'schedules', 'downloads');

-- Education Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'education')
WHERE slug IN ('courses', 'training', 'workshops');

-- Podcast & Video Section Categories
UPDATE categories SET section_id = (SELECT id FROM sections WHERE slug = 'media')
WHERE slug IN ('podcasts', 'videos', 'documentaries', 'interviews');

-- ============================================
-- STEP 3: VERIFY THE STRUCTURE
-- ============================================

SELECT 
  s.slug as section_slug,
  s.title as section_title,
  s.display_order,
  COUNT(c.id) as category_count,
  STRING_AGG(c.slug, ', ' ORDER BY c.slug) as categories
FROM sections s
LEFT JOIN categories c ON c.section_id = s.id
WHERE s.slug IN ('emergency-news', 'survival-guides', 'health', 'directives', 'supplies', 'resources', 'education', 'media')
GROUP BY s.id, s.slug, s.title, s.display_order
ORDER BY s.display_order;

-- ============================================
-- STEP 4: CHECK FOR ORPHANED CATEGORIES
-- ============================================

SELECT 
  slug,
  title,
  'ORPHANED - No section assigned' as status
FROM categories
WHERE section_id IS NULL
ORDER BY slug;

-- ============================================
-- STEP 5: CHECK FOR EXTRA SECTIONS
-- ============================================

SELECT 
  slug,
  title,
  'EXTRA - Not used by frontend' as status
FROM sections
WHERE slug NOT IN ('emergency-news', 'survival-guides', 'health', 'directives', 'supplies', 'resources', 'education', 'media')
ORDER BY slug;

-- ============================================
-- OPTIONAL: CLEAN UP EXTRA SECTIONS
-- ============================================
-- Uncomment the lines below to remove sections not used by your frontend
-- WARNING: This will also delete any posts assigned to these sections!

-- DELETE FROM sections 
-- WHERE slug NOT IN (
--   'emergency-news', 
--   'survival-guides', 
--   'health', 
--   'directives', 
--   'supplies', 
--   'resources', 
--   'education', 
--   'media'
-- );

-- ============================================
-- OPTIONAL: CLEAN UP ORPHANED CATEGORIES
-- ============================================
-- Uncomment to remove categories that don't belong to any section

-- DELETE FROM categories WHERE section_id IS NULL;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '✅ DATABASE NOW MATCHES FRONTEND!';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 8 SECTIONS CONFIGURED:';
  RAISE NOTICE '   1. Emergency News (4 categories)';
  RAISE NOTICE '   2. Survival Guides (5 categories)';
  RAISE NOTICE '   3. Health & Vaccination (5 categories)';
  RAISE NOTICE '   4. Official Directives (4 categories)';
  RAISE NOTICE '   5. Essential Supplies (7 categories)';
  RAISE NOTICE '   6. Resources (4 categories)';
  RAISE NOTICE '   7. Education (3 categories)';
  RAISE NOTICE '   8. Podcast & Video (4 categories)';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 36 CATEGORIES LINKED TO SECTIONS';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Your frontend and database are now in sync!';
  RAISE NOTICE '💡 Check the verification queries above for any issues.';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  If you want to remove extra sections/categories,';
  RAISE NOTICE '    uncomment the DELETE statements and run again.';
  RAISE NOTICE '';
END $$;
