-- ============================================
-- ⚠️ STEP 2: RUN THIS FILE SECOND! ⚠️
-- ============================================
-- This is sample-data.sql with a clear name
-- Run this AFTER STEP_1_RUN_THIS_FIRST.sql
-- ============================================

-- Check if schema was run first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'standfirst'
  ) THEN
    RAISE EXCEPTION '❌ ERROR: You must run STEP_1_RUN_THIS_FIRST.sql before this file!';
  END IF;
  
  RAISE NOTICE '✅ Schema check passed! Loading sample data...';
END $$;

-- ============================================
-- 1. SAMPLE POSTS
-- ============================================

INSERT INTO posts (
  title, 
  standfirst, 
  body, 
  section, 
  category, 
  author, 
  image, 
  tags, 
  country_codes,
  status, 
  is_pinned, 
  view_count,
  read_time,
  published_at
) VALUES
(
  'Emergency Preparedness: Essential Guide for NATO Members',
  'A comprehensive guide to emergency preparedness covering essential supplies, communication protocols, and safety procedures.',
  'In times of crisis, being prepared can make all the difference. This guide covers everything you need to know about emergency preparedness, from building your emergency kit to establishing communication protocols with your family and community. We''ll explore essential supplies, evacuation procedures, and how to stay informed during emergencies.',
  'emergency',
  'alerts',
  'John Smith',
  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800',
  ARRAY['emergency', 'preparedness', 'safety', 'nato'],
  ARRAY['US', 'GB', 'FR', 'DE', 'CA'],
  'published',
  true,
  1247,
  '8 min',
  NOW() - INTERVAL '1 day'
),
(
  'Survival Skills: Wilderness Navigation Basics',
  'Learn essential wilderness navigation techniques using map, compass, and natural landmarks.',
  'Wilderness navigation is a critical survival skill. This article teaches you how to read topographic maps, use a compass effectively, and navigate using natural landmarks like the sun, stars, and terrain features. Whether you''re hiking, camping, or in an emergency situation, these skills could save your life.',
  'survival',
  'wilderness',
  'Sarah Johnson',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
  ARRAY['survival', 'navigation', 'wilderness', 'skills'],
  ARRAY['US', 'CA', 'NO', 'SE', 'FI'],
  'published',
  false,
  892,
  '12 min',
  NOW() - INTERVAL '2 days'
),
(
  'First Aid Essentials: What Every Household Should Know',
  'Critical first aid knowledge and techniques that could save lives in emergency situations.',
  'First aid knowledge is invaluable in emergencies. This comprehensive guide covers CPR, treating wounds, managing shock, handling fractures, and responding to common medical emergencies. We''ll also discuss what should be in your first aid kit and how to maintain it.',
  'health',
  'first-aid',
  'Dr. Emily Brown',
  'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
  ARRAY['health', 'first-aid', 'medical', 'emergency'],
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES'],
  'published',
  true,
  2156,
  '15 min',
  NOW() - INTERVAL '3 days'
),
(
  'NATO Security Protocols: Updated Guidelines for 2026',
  'Latest security protocols and guidelines for NATO member countries and personnel.',
  'NATO has released updated security protocols for 2026, addressing emerging threats and incorporating lessons learned from recent operations. This directive outlines new procedures for information security, physical security measures, and coordination between member nations.',
  'directives',
  'nato-updates',
  'NATO Command',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800',
  ARRAY['nato', 'security', 'protocols', 'official'],
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL', 'NL', 'BE', 'CZ'],
  'published',
  true,
  3421,
  '10 min',
  NOW() - INTERVAL '4 days'
),
(
  'Food Storage and Preservation: Long-Term Strategies',
  'Effective methods for storing and preserving food for extended periods during emergencies.',
  'Proper food storage is essential for emergency preparedness. Learn about different preservation methods including canning, dehydration, and vacuum sealing. We''ll cover optimal storage conditions, shelf life expectations, and how to rotate your emergency food supply.',
  'supplies',
  'food',
  'Maria Garcia',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
  ARRAY['food', 'storage', 'preservation', 'supplies'],
  ARRAY['US', 'GB', 'FR', 'DE', 'IT'],
  'published',
  false,
  654,
  '9 min',
  NOW() - INTERVAL '5 days'
),
(
  'Emergency Communication: Staying Connected When Networks Fail',
  'Alternative communication methods and technologies for emergency situations.',
  'When traditional communication networks fail, having alternative methods is crucial. This guide explores ham radio, satellite phones, mesh networks, and other communication technologies. Learn how to set up emergency communication plans with your family and community.',
  'resources',
  'communication',
  'Alex Thompson',
  'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=800',
  ARRAY['communication', 'technology', 'emergency', 'radio'],
  ARRAY['US', 'CA', 'GB', 'DE'],
  'published',
  false,
  478,
  '11 min',
  NOW() - INTERVAL '6 days'
),
(
  'Civil Defense Training: New Programs Available',
  'Comprehensive training programs now available for civilians in NATO member countries.',
  'New civil defense training programs are being rolled out across NATO member countries. These programs cover emergency response, first aid, search and rescue basics, and community coordination. Find out how to enroll in programs in your area.',
  'education',
  'training',
  'Training Institute',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  ARRAY['training', 'education', 'civil-defense', 'programs'],
  ARRAY['US', 'GB', 'FR', 'DE', 'PL', 'CZ'],
  'published',
  false,
  1089,
  '7 min',
  NOW() - INTERVAL '7 days'
),
(
  'Community Resilience: Building Stronger Neighborhoods',
  'How communities can work together to improve resilience and emergency preparedness.',
  'Strong communities are more resilient in times of crisis. Learn how to organize neighborhood emergency response teams, establish communication networks, share resources, and create mutual aid agreements. Real-world examples from communities across NATO countries.',
  'community',
  'local-news',
  'Community Reporter',
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
  ARRAY['community', 'resilience', 'cooperation', 'local'],
  ARRAY['US', 'GB', 'CA', 'NL', 'BE'],
  'published',
  false,
  723,
  '6 min',
  NOW() - INTERVAL '8 days'
),
(
  'Water Purification: Essential Techniques for Survival',
  'Methods for purifying water in emergency situations when clean water is unavailable.',
  'Access to clean water is critical for survival. This guide covers multiple water purification methods including boiling, chemical treatment, filtration, and UV purification. Learn which methods work best in different situations and how to build emergency water filters.',
  'survival',
  'water',
  'Sarah Johnson',
  'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
  ARRAY['water', 'purification', 'survival', 'health'],
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES'],
  'published',
  false,
  945,
  '10 min',
  NOW() - INTERVAL '9 days'
),
(
  'Shelter Building: Techniques for Harsh Environments',
  'How to construct emergency shelters in various environments and weather conditions.',
  'Knowing how to build emergency shelter can save your life in extreme conditions. This comprehensive guide covers shelter construction for different environments: forests, deserts, mountains, and urban areas. Learn about materials, insulation, and location selection.',
  'survival',
  'shelter',
  'Mike Anderson',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
  ARRAY['shelter', 'survival', 'construction', 'wilderness'],
  ARRAY['US', 'CA', 'NO', 'SE', 'FI', 'IS'],
  'published',
  false,
  567,
  '13 min',
  NOW() - INTERVAL '10 days'
);

-- ============================================
-- 2. SAMPLE MEDIA ITEMS
-- ============================================

INSERT INTO media_items (
  title,
  description,
  type,
  url,
  thumbnail,
  duration,
  author,
  tags,
  country_codes,
  views,
  published_at
) VALUES
(
  'Emergency Response Training Video',
  'Comprehensive video guide on emergency response procedures for civilians.',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400',
  '24:35',
  'Training Department',
  ARRAY['training', 'emergency', 'video'],
  ARRAY['US', 'GB', 'FR', 'DE'],
  3421,
  NOW() - INTERVAL '5 days'
),
(
  'Survival Skills Podcast: Episode 12',
  'Interview with wilderness survival expert discussing essential skills.',
  'podcast',
  'https://example.com/podcast/ep12',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
  '45:20',
  'Survival Podcast Network',
  ARRAY['podcast', 'survival', 'interview'],
  ARRAY['US', 'CA', 'GB'],
  1876,
  NOW() - INTERVAL '3 days'
),
(
  'First Aid Basics: CPR Demonstration',
  'Step-by-step video demonstration of proper CPR technique.',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
  '12:15',
  'Dr. Emily Brown',
  ARRAY['first-aid', 'cpr', 'medical', 'training'],
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES'],
  5234,
  NOW() - INTERVAL '7 days'
),
(
  'NATO Security Briefing: Monthly Update',
  'Monthly security briefing covering current threats and protocols.',
  'podcast',
  'https://example.com/podcast/nato-briefing',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400',
  '32:45',
  'NATO Communications',
  ARRAY['nato', 'security', 'briefing', 'official'],
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL'],
  2987,
  NOW() - INTERVAL '2 days'
),
(
  'Water Purification Methods Explained',
  'Detailed video showing various water purification techniques.',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
  '18:30',
  'Sarah Johnson',
  ARRAY['water', 'purification', 'survival', 'tutorial'],
  ARRAY['US', 'GB', 'CA'],
  1654,
  NOW() - INTERVAL '6 days'
),
(
  'Community Preparedness Podcast',
  'Discussion on building resilient communities and neighborhood networks.',
  'podcast',
  'https://example.com/podcast/community',
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
  '38:15',
  'Community Network',
  ARRAY['community', 'preparedness', 'podcast'],
  ARRAY['US', 'GB', 'NL', 'BE'],
  892,
  NOW() - INTERVAL '4 days'
);

-- ============================================
-- 3. SAMPLE LIBRARY ITEMS
-- ============================================

INSERT INTO library_items (
  title,
  author,
  category,
  description,
  file_url,
  cover_image_url,
  cover_color,
  format,
  pages,
  country_codes
) VALUES
(
  'Emergency Preparedness Handbook',
  'NATO Civil Defense',
  'Emergency',
  'Comprehensive guide to emergency preparedness for civilians.',
  'https://example.com/files/emergency-handbook.pdf',
  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400',
  'bg-red-600',
  'PDF',
  156,
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES']
),
(
  'Wilderness Survival Manual',
  'Sarah Johnson',
  'Survival',
  'Essential wilderness survival techniques and strategies.',
  'https://example.com/files/survival-manual.pdf',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
  'bg-green-700',
  'PDF',
  243,
  ARRAY['US', 'CA', 'NO', 'SE', 'FI']
),
(
  'First Aid Field Guide',
  'Dr. Emily Brown',
  'Health',
  'Quick reference guide for first aid in emergency situations.',
  'https://example.com/files/first-aid-guide.pdf',
  'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400',
  'bg-blue-600',
  'PDF',
  89,
  ARRAY['US', 'GB', 'FR', 'DE']
),
(
  'NATO Security Protocols 2026',
  'NATO Command',
  'Directives',
  'Official security protocols and guidelines for NATO members.',
  'https://example.com/files/nato-protocols.pdf',
  'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400',
  'bg-navy-800',
  'PDF',
  312,
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL', 'NL', 'BE', 'CZ']
),
(
  'Food Storage and Preservation Guide',
  'Maria Garcia',
  'Supplies',
  'Complete guide to long-term food storage and preservation methods.',
  'https://example.com/files/food-storage.pdf',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
  'bg-orange-600',
  'PDF',
  127,
  ARRAY['US', 'GB', 'FR', 'DE', 'IT']
),
(
  'Emergency Communication Systems',
  'Alex Thompson',
  'Resources',
  'Guide to alternative communication methods for emergencies.',
  'https://example.com/files/communication-systems.pdf',
  'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=400',
  'bg-purple-600',
  'PDF',
  178,
  ARRAY['US', 'CA', 'GB', 'DE']
);

-- ============================================
-- 4. SAMPLE ENCYCLOPAEDIA ENTRIES
-- ============================================

INSERT INTO encyclopaedia_entries (title, letter, content) VALUES
(
  'Alert System',
  'A',
  'The Alert System is a coordinated network for disseminating emergency information to NATO member populations. It includes multiple channels: broadcast media, mobile alerts, sirens, and digital platforms. The system uses a priority-based approach with color codes: Green (informational), Yellow (advisory), Orange (warning), and Red (critical emergency).'
),
(
  'Bunker',
  'B',
  'A bunker is a reinforced underground structure designed to protect occupants from various threats including conventional weapons, nuclear fallout, and natural disasters. Modern bunkers include air filtration systems, emergency supplies, communication equipment, and can sustain occupants for extended periods.'
),
(
  'Civil Defense',
  'C',
  'Civil Defense encompasses the organization and training of civilians to protect themselves and support emergency services during crises. This includes emergency response teams, evacuation procedures, shelter management, and community coordination protocols established by NATO member governments.'
),
(
  'Disaster Preparedness',
  'D',
  'Disaster Preparedness involves planning, training, and resource allocation to effectively respond to emergencies. Key components include emergency kits, evacuation plans, communication protocols, and regular drills. NATO promotes standardized preparedness guidelines across member nations.'
),
(
  'Emergency Kit',
  'E',
  'An Emergency Kit is a collection of essential supplies prepared in advance for use during emergencies. Standard contents include water (1 gallon per person per day), non-perishable food, first aid supplies, flashlight, radio, batteries, medications, and important documents.'
),
(
  'First Aid',
  'F',
  'First Aid is immediate care provided to injured or ill persons before professional medical help arrives. Basic first aid includes CPR, wound care, treating shock, managing fractures, and responding to common medical emergencies. NATO recommends all civilians receive basic first aid training.'
);

-- ============================================
-- 5. SAMPLE ALERTS
-- ============================================

INSERT INTO alerts (text, priority, is_active, country_codes) VALUES
(
  'Routine system maintenance scheduled for tonight 2:00-4:00 AM',
  'low',
  true,
  ARRAY['US', 'GB', 'FR', 'DE']
),
(
  'New security protocols in effect as of April 25, 2026',
  'medium',
  true,
  ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL']
),
(
  'Severe weather warning: Heavy storms expected in northern regions',
  'high',
  true,
  ARRAY['NO', 'SE', 'FI', 'IS', 'DK']
);

-- ============================================
-- 6. SAMPLE BANNER SETTINGS
-- ============================================

INSERT INTO banner_settings (enabled, text, priority) VALUES
(true, 'Stay informed with the latest updates from Sentinel Network', 'high');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
DECLARE
  post_count int;
  media_count int;
  library_count int;
  encyc_count int;
BEGIN
  SELECT COUNT(*) INTO post_count FROM posts;
  SELECT COUNT(*) INTO media_count FROM media_items;
  SELECT COUNT(*) INTO library_count FROM library_items;
  SELECT COUNT(*) INTO encyc_count FROM encyclopaedia_entries;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ STEP 2 COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Posts: %', post_count;
  RAISE NOTICE 'Media Items: %', media_count;
  RAISE NOTICE 'Library Items: %', library_count;
  RAISE NOTICE 'Encyclopaedia Entries: %', encyc_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Your Sentinel Network is ready to use!';
  RAISE NOTICE '========================================';
END $$;
