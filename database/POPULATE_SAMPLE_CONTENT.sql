-- Populate Sample Content for All Sections
-- Run this in Supabase SQL Editor to add posts to your sections

-- This will create 8 posts per section to populate your homepage

DO $$
DECLARE
  v_section_id UUID;
  v_category_id UUID;
  v_section_record RECORD;
  v_category_record RECORD;
  v_counter INTEGER;
BEGIN
  -- Loop through all active sections
  FOR v_section_record IN 
    SELECT id, slug, title FROM sections WHERE is_active = true ORDER BY display_order
  LOOP
    RAISE NOTICE 'Processing section: %', v_section_record.title;
    
    -- Get first category for this section
    SELECT id INTO v_category_id 
    FROM categories 
    WHERE section_id = v_section_record.id 
    LIMIT 1;
    
    -- Skip if no category found
    IF v_category_id IS NULL THEN
      RAISE NOTICE 'No category found for section %, skipping', v_section_record.title;
      CONTINUE;
    END IF;
    
    -- Insert 8 posts for this section
    FOR v_counter IN 1..8 LOOP
      INSERT INTO posts (
        title,
        author,
        section_id,
        category_id,
        content,
        excerpt,
        image_url,
        is_published,
        views,
        published_at,
        created_at
      ) VALUES (
        v_section_record.title || ' - Article ' || v_counter,
        'Editorial Team',
        v_section_record.id,
        v_category_id,
        'This is a comprehensive article about ' || v_section_record.title || '. ' ||
        'It provides detailed information and insights on this important topic. ' ||
        'Our team has researched extensively to bring you the most accurate and up-to-date information. ' ||
        'Stay informed and prepared with our expert analysis and practical advice. ' ||
        'This article covers essential aspects that everyone should know about ' || v_section_record.title || '.',
        'Essential information about ' || v_section_record.title || ' - Article ' || v_counter,
        CASE 
          WHEN v_counter % 8 = 1 THEN 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
          WHEN v_counter % 8 = 2 THEN 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800'
          WHEN v_counter % 8 = 3 THEN 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800'
          WHEN v_counter % 8 = 4 THEN 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'
          WHEN v_counter % 8 = 5 THEN 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800'
          WHEN v_counter % 8 = 6 THEN 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800'
          WHEN v_counter % 8 = 7 THEN 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800'
          ELSE 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
        END,
        true,
        (random() * 1000)::INTEGER, -- Random view count
        now() - (v_counter || ' hours')::interval,
        now() - (v_counter || ' hours')::interval
      );
    END LOOP;
    
    RAISE NOTICE 'Inserted 8 posts for section: %', v_section_record.title;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sample content population complete!';
  RAISE NOTICE '========================================';
END $$;

-- Show summary of posts per section
SELECT 
  s.title as section,
  COUNT(p.id) as post_count
FROM sections s
LEFT JOIN posts p ON s.id = p.section_id
WHERE s.is_active = true
GROUP BY s.id, s.title
ORDER BY s.display_order;

-- Show total posts created
SELECT 
  'Total Posts' as metric,
  COUNT(*) as count
FROM posts
WHERE is_published = true;

-- Success message
SELECT '✅ Sample content added! Refresh your homepage to see the sections populated.' as status;
