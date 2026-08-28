-- ============================================
-- UPDATE SECTIONS AND CATEGORIES TO MATCH SITE
-- ============================================
-- This script updates your database to match your frontend structure
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: VIEW CURRENT DATA
-- ============================================

SELECT '=== CURRENT SECTIONS ===' AS info;
SELECT id, title, slug, display_order, is_active FROM sections ORDER BY display_order;

SELECT '=== CURRENT CATEGORIES ===' AS info;
SELECT id, name, title, slug, description FROM categories ORDER BY name;

-- ============================================
-- STEP 2: UPDATE SECTIONS
-- ============================================

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
-- STEP 3: UPDATE CATEGORIES
-- ============================================

-- EMERGENCY NEWS SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('UK Alerts', 'UK Alerts', 'uk-alerts', 'Emergency alerts and updates for the United Kingdom')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('NATO Updates', 'NATO Updates', 'nato-updates', 'NATO alliance updates and civil preparedness information')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Global Situation', 'Global Situation', 'global-situation', 'Global security and emergency situation updates')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Infrastructure Disruptions', 'Infrastructure Disruptions', 'infrastructure', 'Critical infrastructure disruptions and outages')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- SURVIVAL GUIDES SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('Emergency Planning', 'Emergency Planning', 'emergency-planning', 'How to plan for emergencies and disasters')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Evacuation & Shelter', 'Evacuation & Shelter', 'evacuation-shelter', 'Evacuation procedures and shelter guidance')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Home Preparation', 'Home Preparation', 'home-preparation', 'Preparing your home for emergencies')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Urban Survival', 'Urban Survival', 'urban-survival', 'Survival strategies for urban environments')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Rural Survival', 'Rural Survival', 'rural-survival', 'Survival strategies for rural environments')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- HEALTH & VACCINATION SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('Children', 'Children', 'children', 'Health and vaccination guidance for children')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Adults', 'Adults', 'adults', 'Health and vaccination guidance for adults')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Elderly', 'Elderly', 'elderly', 'Health and vaccination guidance for elderly')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('First Aid', 'First Aid', 'first-aid', 'First aid techniques and emergency medical care')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Mental Health', 'Mental Health', 'mental-health', 'Mental health and psychological resilience')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- OFFICIAL DIRECTIVES SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('UK Ministry of Defence', 'UK Ministry of Defence', 'uk-mod', 'Official guidance from UK MOD')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('NATO Civil Preparedness', 'NATO Civil Preparedness', 'nato-civil', 'NATO civil preparedness directives')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('EU Civil Protection', 'EU Civil Protection', 'eu-civil', 'EU civil protection guidance')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Red Cross Guidance', 'Red Cross Guidance', 'red-cross', 'Red Cross emergency guidance')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- ESSENTIAL SUPPLIES SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('Water', 'Water', 'water', 'Water storage and purification')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Food & Rations', 'Food & Rations', 'food-rations', 'Food storage and emergency rations')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Medical & Medicines', 'Medical & Medicines', 'medical', 'Medical supplies and medicines')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Power & Light', 'Power & Light', 'power-light', 'Power generation and lighting solutions')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Communication & Safety', 'Communication & Safety', 'communication', 'Communication equipment and safety gear')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Clothing & Shelter', 'Clothing & Shelter', 'clothing-shelter', 'Protective clothing and shelter materials')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Hygiene & Sanitation', 'Hygiene & Sanitation', 'hygiene', 'Hygiene and sanitation supplies')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- RESOURCES SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('Checklists', 'Checklists', 'checklists', 'Downloadable emergency checklists')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Templates', 'Templates', 'templates', 'Printable templates and forms')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Schedules', 'Schedules', 'schedules', 'Planning schedules and timelines')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Downloads', 'Downloads', 'downloads', 'Downloadable resources and documents')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- EDUCATION SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('Courses', 'Courses', 'courses', 'Emergency preparedness courses')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Training Programmes', 'Training Programmes', 'training', 'Professional training programmes')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Workshops', 'Workshops', 'workshops', 'Hands-on workshops and seminars')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- PODCAST & VIDEO SECTION CATEGORIES
INSERT INTO categories (name, title, slug, description)
VALUES ('Podcasts', 'Podcasts', 'podcasts', 'Audio podcasts on preparedness topics')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Videos', 'Videos', 'videos', 'Educational videos and tutorials')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Documentaries', 'Documentaries', 'documentaries', 'Documentary films and series')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO categories (name, title, slug, description)
VALUES ('Interviews', 'Interviews', 'interviews', 'Expert interviews and discussions')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title, description = EXCLUDED.description;

-- ============================================
-- STEP 4: VIEW UPDATED DATA
-- ============================================

SELECT '=== UPDATED SECTIONS ===' AS info;
SELECT id, title, slug, display_order, is_active FROM sections ORDER BY display_order;

SELECT '=== UPDATED CATEGORIES ===' AS info;
SELECT id, name, title, slug FROM categories ORDER BY name;

-- ============================================
-- STEP 5: SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '✅ SECTIONS & CATEGORIES UPDATED!';
  RAISE NOTICE '✅ ================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 8 SECTIONS CREATED:';
  RAISE NOTICE '   1. Emergency News (4 categories)';
  RAISE NOTICE '   2. Survival Guides (5 categories)';
  RAISE NOTICE '   3. Health & Vaccination (5 categories)';
  RAISE NOTICE '   4. Official Directives (4 categories)';
  RAISE NOTICE '   5. Essential Supplies (7 categories)';
  RAISE NOTICE '   6. Resources (4 categories)';
  RAISE NOTICE '   7. Education (3 categories)';
  RAISE NOTICE '   8. Podcast & Video (4 categories)';
  RAISE NOTICE '';
  RAISE NOTICE '📂 36 CATEGORIES CREATED';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Your database now matches your frontend!';
  RAISE NOTICE '💡 You can now create posts and assign them to these sections/categories.';
  RAISE NOTICE '';
END $$;
