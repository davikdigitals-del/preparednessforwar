-- Sync Categories from mockData.ts to Database
-- This ensures database categories match what's in the code

-- First, get section IDs (assuming sections already exist)
DO $$
DECLARE
  emergency_news_id uuid;
  survival_guides_id uuid;
  health_id uuid;
  directives_id uuid;
  supplies_id uuid;
  resources_id uuid;
  education_id uuid;
  media_id uuid;
BEGIN
  -- Get section IDs
  SELECT id INTO emergency_news_id FROM sections WHERE slug = 'emergency-news';
  SELECT id INTO survival_guides_id FROM sections WHERE slug = 'survival-guides';
  SELECT id INTO health_id FROM sections WHERE slug = 'health';
  SELECT id INTO directives_id FROM sections WHERE slug = 'directives';
  SELECT id INTO supplies_id FROM sections WHERE slug = 'supplies';
  SELECT id INTO resources_id FROM sections WHERE slug = 'resources';
  SELECT id INTO education_id FROM sections WHERE slug = 'education';
  SELECT id INTO media_id FROM sections WHERE slug = 'media';

  -- Emergency News Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (emergency_news_id, 'uk-alerts', 'UK Alerts', 0, true),
    (emergency_news_id, 'nato-updates', 'NATO Updates', 1, true),
    (emergency_news_id, 'global-situation', 'Global Situation', 2, true),
    (emergency_news_id, 'infrastructure', 'Infrastructure Disruptions', 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  -- Survival Guides Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (survival_guides_id, 'emergency-planning', 'Emergency Planning', 0, true),
    (survival_guides_id, 'evacuation-shelter', 'Evacuation & Shelter', 1, true),
    (survival_guides_id, 'home-preparation', 'Home Preparation', 2, true),
    (survival_guides_id, 'urban-survival', 'Urban Survival', 3, true),
    (survival_guides_id, 'rural-survival', 'Rural Survival', 4, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  -- Health & Vaccination Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (health_id, 'children', 'Children', 0, true),
    (health_id, 'adults', 'Adults', 1, true),
    (health_id, 'elderly', 'Elderly', 2, true),
    (health_id, 'first-aid', 'First Aid', 3, true),
    (health_id, 'mental-health', 'Mental Health', 4, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  -- Official Directives Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (directives_id, 'uk-mod', 'UK Ministry of Defence', 0, true),
    (directives_id, 'nato-civil', 'NATO Civil Preparedness', 1, true),
    (directives_id, 'eu-civil', 'EU Civil Protection', 2, true),
    (directives_id, 'red-cross', 'Red Cross Guidance', 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  -- Essential Supplies Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (supplies_id, 'water', 'Water', 0, true),
    (supplies_id, 'food-rations', 'Food & Rations', 1, true),
    (supplies_id, 'medical', 'Medical & Medicines', 2, true),
    (supplies_id, 'power-light', 'Power & Light', 3, true),
    (supplies_id, 'communication', 'Communication & Safety', 4, true),
    (supplies_id, 'clothing-shelter', 'Clothing & Shelter', 5, true),
    (supplies_id, 'hygiene', 'Hygiene & Sanitation', 6, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  -- Resources Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (resources_id, 'checklists', 'Checklists', 0, true),
    (resources_id, 'templates', 'Templates', 1, true),
    (resources_id, 'schedules', 'Schedules', 2, true),
    (resources_id, 'downloads', 'Downloads', 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  -- Education Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (education_id, 'courses', 'Courses', 0, true),
    (education_id, 'training', 'Training Programmes', 1, true),
    (education_id, 'workshops', 'Workshops', 2, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  -- Podcast & Video Categories
  INSERT INTO categories (section_id, slug, title, order_index, is_active)
  VALUES 
    (media_id, 'podcasts', 'Podcasts', 0, true),
    (media_id, 'videos', 'Videos', 1, true),
    (media_id, 'documentaries', 'Documentaries', 2, true),
    (media_id, 'interviews', 'Interviews', 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    section_id = EXCLUDED.section_id,
    order_index = EXCLUDED.order_index;

  RAISE NOTICE 'Categories synced successfully from mockData.ts';
END $$;

-- Verify the sync
SELECT 
  s.title as section,
  c.title as category,
  c.slug,
  c.order_index,
  c.is_active
FROM categories c
JOIN sections s ON c.section_id = s.id
ORDER BY s.display_order, c.order_index;
