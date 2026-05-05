-- ============================================
-- VIEW CURRENT SECTIONS
-- ============================================
-- First, let's see what sections you currently have in the database

SELECT 
  id,
  title,
  slug,
  description,
  display_order,
  is_active,
  created_at
FROM sections
ORDER BY display_order;

-- ============================================
-- UPDATE SECTIONS TO MATCH YOUR SITE STRUCTURE
-- ============================================
-- Based on your frontend mockData, here are your actual sections
-- This will insert new sections or update existing ones

-- 1. Emergency News
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Emergency News', 'emergency-news', 'Breaking news, alerts, and critical updates on emergency situations', 1, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 2. Survival Guides
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Survival Guides', 'survival-guides', 'Comprehensive guides for emergency planning, evacuation, and survival skills', 2, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 3. Health & Vaccination
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Health & Vaccination', 'health', 'Health guidance, first aid, mental health, and vaccination information', 3, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 4. Official Directives
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Official Directives', 'directives', 'Official guidance from UK MOD, NATO, EU, and Red Cross', 4, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 5. Essential Supplies
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Essential Supplies', 'supplies', 'Guides on water, food, medical supplies, power, and communication equipment', 5, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 6. Resources
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Resources', 'resources', 'Checklists, templates, schedules, and downloadable resources', 6, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 7. Education
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Education', 'education', 'Courses, training programmes, and workshops for emergency preparedness', 7, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 8. Podcast & Video
INSERT INTO sections (title, slug, description, display_order, is_active)
VALUES ('Podcast & Video', 'media', 'Podcasts, videos, documentaries, and interviews on preparedness topics', 8, true)
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ============================================
-- CLEAN UP OLD SECTIONS (OPTIONAL)
-- ============================================
-- If you have old sections that don't match the above, you can delete them
-- Uncomment the lines below to remove sections not in your current structure

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
-- VIEW UPDATED SECTIONS
-- ============================================

SELECT 
  id,
  title,
  slug,
  description,
  display_order,
  is_active
FROM sections
ORDER BY display_order;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '✅ SECTIONS UPDATED!';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Your sections are now:';
  RAISE NOTICE '   1. Emergency News - Breaking news and alerts';
  RAISE NOTICE '   2. Survival Guides - Emergency planning and survival';
  RAISE NOTICE '   3. Health & Vaccination - Health and first aid';
  RAISE NOTICE '   4. Official Directives - Government guidance';
  RAISE NOTICE '   5. Essential Supplies - Water, food, equipment';
  RAISE NOTICE '   6. Resources - Checklists and templates';
  RAISE NOTICE '   7. Education - Courses and training';
  RAISE NOTICE '   8. Podcast & Video - Media content';
  RAISE NOTICE '';
  RAISE NOTICE '💡 These match your frontend structure!';
  RAISE NOTICE '💡 You can now assign posts to these sections.';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  If you want to remove old sections that are not listed above,';
  RAISE NOTICE '    uncomment the DELETE statement in this script and run again.';
  RAISE NOTICE '';
END $$;
