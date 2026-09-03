-- ============================================================================
-- CREATE QUICK LINK TOPICS TABLE
-- This will allow Admin Posts to render topics from database instead of static file
-- ============================================================================

-- Step 1: Create the quick_link_topics table
CREATE TABLE IF NOT EXISTS public.quick_link_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.nav_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quick_link_topics_section 
ON public.quick_link_topics(section_id);

CREATE INDEX IF NOT EXISTS idx_quick_link_topics_slug 
ON public.quick_link_topics(slug);

-- Step 3: Enable RLS
ALTER TABLE public.quick_link_topics ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies
CREATE POLICY "anyone_can_read_topics"
ON public.quick_link_topics FOR SELECT
USING (true);

CREATE POLICY "authenticated_can_manage_topics"
ON public.quick_link_topics FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 5: Insert topics for existing sections
DO $$
DECLARE
  emergency_id UUID;
  survival_id UUID;
  health_id UUID;
  directives_id UUID;
  resources_id UUID;
  education_id UUID;
  media_id UUID;
  supplies_id UUID;
BEGIN
  -- Get section IDs
  SELECT id INTO emergency_id FROM nav_sections WHERE slug = 'emergency-news';
  SELECT id INTO survival_id FROM nav_sections WHERE slug = 'survival-guides';
  SELECT id INTO health_id FROM nav_sections WHERE slug = 'health';
  SELECT id INTO directives_id FROM nav_sections WHERE slug = 'directives';
  SELECT id INTO resources_id FROM nav_sections WHERE slug = 'resources';
  SELECT id INTO education_id FROM nav_sections WHERE slug = 'education';
  SELECT id INTO media_id FROM nav_sections WHERE slug = 'media';
  SELECT id INTO supplies_id FROM nav_sections WHERE slug = 'supplies';

  -- Emergency News topics
  IF emergency_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (emergency_id, 'Breaking News', 'breaking', 1),
    (emergency_id, 'Live Updates', 'live', 2);
  END IF;

  -- Survival Guides topics
  IF survival_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (survival_id, '72-Hour Kit Builder', 'kit-builder', 1),
    (survival_id, 'Evacuation Planner', 'evacuation-planner', 2);
  END IF;

  -- Health & Wellness topics
  IF health_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (health_id, 'Vaccination Tracker', 'vaccination-tracker', 1),
    (health_id, 'First Aid Guide', 'first-aid-guide', 2);
  END IF;

  -- Official Directives topics
  IF directives_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (directives_id, 'Directive Archive', 'archive', 1),
    (directives_id, 'Country Guidance', 'by-country', 2);
  END IF;

  -- Resources topics
  IF resources_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (resources_id, 'All Downloads', 'all-downloads', 1),
    (resources_id, 'Printable Packs', 'printable-packs', 2);
  END IF;

  -- Education topics
  IF education_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (education_id, 'Browse All Courses', 'all-courses', 1),
    (education_id, 'My Learning', 'my-courses', 2);
  END IF;

  -- Media topics
  IF media_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (media_id, 'Media Hub', 'media-hub', 1),
    (media_id, 'Latest Episodes', 'latest', 2);
  END IF;

  -- Essential Supplies topics
  IF supplies_id IS NOT NULL THEN
    INSERT INTO quick_link_topics (section_id, title, slug, sort_order) VALUES
    (supplies_id, 'Supply Checklist', 'checklist', 1),
    (supplies_id, 'Product Reviews', 'reviews', 2),
    (supplies_id, 'Buying Guides', 'buying-guides', 3);
  END IF;

  RAISE NOTICE '✅ Quick link topics created successfully';
END $$;

-- Step 6: Verify topics were created
SELECT 
  ns.slug as section,
  qlt.title as topic,
  qlt.slug as topic_slug,
  qlt.is_active
FROM quick_link_topics qlt
JOIN nav_sections ns ON ns.id = qlt.section_id
ORDER BY ns.slug, qlt.sort_order;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ QUICK LINK TOPICS TABLE CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was created:';
  RAISE NOTICE '  ✓ quick_link_topics table';
  RAISE NOTICE '  ✓ RLS policies';
  RAISE NOTICE '  ✓ Topics for all sections';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Update AdminPosts.tsx to fetch from this table';
  RAISE NOTICE '';
END $$;
