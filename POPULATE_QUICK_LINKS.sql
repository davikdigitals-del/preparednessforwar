-- Populate Quick Links (nav_tools) with useful navigation shortcuts
-- This will add practical quick links under each section in the mega menu

-- First, ensure nav_tools table exists
CREATE TABLE IF NOT EXISTS nav_tools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL,
  section_id UUID REFERENCES nav_sections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slug, section_id)
);

-- Clear existing quick links to start fresh
DELETE FROM nav_tools;

-- Get section IDs for reference
DO $$
DECLARE
    emergency_news_id UUID;
    survival_guides_id UUID;
    health_id UUID;
    directives_id UUID;
    resources_id UUID;
    education_id UUID;
    media_id UUID;
BEGIN
    -- Get section IDs
    SELECT id INTO emergency_news_id FROM nav_sections WHERE slug = 'emergency-news' LIMIT 1;
    SELECT id INTO survival_guides_id FROM nav_sections WHERE slug = 'survival-guides' LIMIT 1;
    SELECT id INTO health_id FROM nav_sections WHERE slug = 'health' LIMIT 1;
    SELECT id INTO directives_id FROM nav_sections WHERE slug = 'directives' LIMIT 1;
    SELECT id INTO resources_id FROM nav_sections WHERE slug = 'resources' LIMIT 1;
    SELECT id INTO education_id FROM nav_sections WHERE slug = 'education' LIMIT 1;
    SELECT id INTO media_id FROM nav_sections WHERE slug = 'media' LIMIT 1;

    -- Emergency News Quick Links
    IF emergency_news_id IS NOT NULL THEN
        INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
        ('Breaking News', 'breaking', emergency_news_id, 1),
        ('Weather Alerts', 'weather-alerts', emergency_news_id, 2),
        ('Threat Level Updates', 'threat-levels', emergency_news_id, 3),
        ('Emergency Broadcasts', 'broadcasts', emergency_news_id, 4),
        ('NATO Updates', 'nato-updates', emergency_news_id, 5);
    END IF;

    -- Survival Guides Quick Links  
    IF survival_guides_id IS NOT NULL THEN
        INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
        ('Bug-Out Bags', 'bug-out-bags', survival_guides_id, 1),
        ('Water Purification', 'water-purification', survival_guides_id, 2),
        ('Fire Starting', 'fire-starting', survival_guides_id, 3),
        ('Shelter Building', 'shelter-building', survival_guides_id, 4),
        ('Food Storage', 'food-storage', survival_guides_id, 5),
        ('Navigation Skills', 'navigation', survival_guides_id, 6);
    END IF;

    -- Health & Wellness Quick Links
    IF health_id IS NOT NULL THEN
        INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
        ('First Aid Basics', 'first-aid', health_id, 1),
        ('Medical Supplies', 'medical-supplies', health_id, 2),
        ('Mental Health', 'mental-health', health_id, 3),
        ('Fitness Training', 'fitness', health_id, 4),
        ('Nutrition Planning', 'nutrition', health_id, 5);
    END IF;

    -- Official Directives Quick Links
    IF directives_id IS NOT NULL THEN
        INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
        ('Government Alerts', 'government-alerts', directives_id, 1),
        ('Evacuation Orders', 'evacuations', directives_id, 2),
        ('Emergency Protocols', 'protocols', directives_id, 3),
        ('Legal Guidelines', 'legal', directives_id, 4),
        ('Contact Authorities', 'contacts', directives_id, 5);
    END IF;

    -- Resources Quick Links
    IF resources_id IS NOT NULL THEN
        INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
        ('Emergency Kits', 'emergency-kits', resources_id, 1),
        ('Supply Checklists', 'checklists', resources_id, 2),
        ('Recommended Gear', 'gear', resources_id, 3),
        ('Download Center', 'downloads', resources_id, 4),
        ('Reference Charts', 'charts', resources_id, 5);
    END IF;

    -- Education Quick Links
    IF education_id IS NOT NULL THEN
        INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
        ('Survival Courses', 'survival-courses', education_id, 1),
        ('Tactical Training', 'tactical-training', education_id, 2),
        ('Emergency Response', 'emergency-response', education_id, 3),
        ('Certification Programs', 'certifications', education_id, 4),
        ('Skills Assessment', 'assessment', education_id, 5);
    END IF;

    -- Podcast & Video Quick Links
    IF media_id IS NOT NULL THEN
        INSERT INTO nav_tools (title, slug, section_id, sort_order) VALUES
        ('Latest Episodes', 'latest', media_id, 1),
        ('Expert Interviews', 'interviews', media_id, 2),
        ('Training Videos', 'training-videos', media_id, 3),
        ('Live Streams', 'live', media_id, 4),
        ('Documentary Series', 'documentaries', media_id, 5);
    END IF;

END $$;

-- Verify the quick links were created
SELECT 
  ns.title as section_name,
  COUNT(nt.id) as quick_links_added,
  STRING_AGG(nt.title, ', ' ORDER BY nt.sort_order) as link_titles
FROM nav_sections ns
LEFT JOIN nav_tools nt ON ns.id = nt.section_id
WHERE ns.is_active = true
GROUP BY ns.id, ns.title
ORDER BY ns.sort_order;