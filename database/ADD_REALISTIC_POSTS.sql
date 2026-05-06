-- Add Realistic Posts with Better Titles
-- Run this for more realistic content

DO $$
DECLARE
  v_section_emergency UUID;
  v_section_preparedness UUID;
  v_section_training UUID;
  v_section_intel UUID;
  v_section_community UUID;
  v_category_id UUID;
BEGIN
  -- Get section IDs
  SELECT id INTO v_section_emergency FROM sections WHERE slug LIKE '%emergency%' OR slug LIKE '%news%' LIMIT 1;
  SELECT id INTO v_section_preparedness FROM sections WHERE slug LIKE '%prepared%' OR slug LIKE '%prep%' LIMIT 1;
  SELECT id INTO v_section_training FROM sections WHERE slug LIKE '%train%' OR slug LIKE '%skill%' LIMIT 1;
  SELECT id INTO v_section_intel FROM sections WHERE slug LIKE '%intel%' OR slug LIKE '%threat%' LIMIT 1;
  SELECT id INTO v_section_community FROM sections WHERE slug LIKE '%commun%' OR slug LIKE '%forum%' LIMIT 1;
  
  -- Emergency News Posts
  IF v_section_emergency IS NOT NULL THEN
    SELECT id INTO v_category_id FROM categories WHERE section_id = v_section_emergency LIMIT 1;
    
    INSERT INTO posts (title, author, section_id, category_id, content, excerpt, image_url, is_published, views, published_at) VALUES
    ('Severe Weather Alert: Storm System Approaching Eastern Regions', 'Weather Team', v_section_emergency, v_category_id, 
     'A major storm system is expected to impact eastern regions over the next 48 hours. Residents should prepare emergency kits and stay informed through official channels.',
     'Major storm warning issued for eastern areas', 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800', true, 1250, now() - interval '2 hours'),
    
    ('Earthquake Preparedness: Essential Steps for Your Family', 'Safety Team', v_section_emergency, v_category_id,
     'Learn critical earthquake preparedness measures to protect your family and property during seismic events.',
     'Complete earthquake safety guide', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800', true, 890, now() - interval '5 hours'),
    
    ('Wildfire Season: How to Protect Your Home', 'Fire Safety Expert', v_section_emergency, v_category_id,
     'With wildfire season approaching, learn essential steps to protect your property and create defensible space.',
     'Wildfire protection strategies', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', true, 670, now() - interval '8 hours'),
    
    ('Flood Warning Systems: What You Need to Know', 'Emergency Services', v_section_emergency, v_category_id,
     'Understanding flood warning systems can save lives. Learn how to interpret alerts and take appropriate action.',
     'Flood warning guide', 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800', true, 540, now() - interval '12 hours'),
    
    ('Power Outage Preparedness: Stay Safe During Blackouts', 'Utility Expert', v_section_emergency, v_category_id,
     'Extended power outages can be dangerous. Learn how to prepare and stay safe when the lights go out.',
     'Blackout survival tips', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', true, 780, now() - interval '1 day'),
    
    ('Cyber Attack Alert: Protecting Your Digital Assets', 'Cybersecurity Team', v_section_emergency, v_category_id,
     'Recent cyber threats highlight the importance of digital security. Learn how to protect your personal information.',
     'Cybersecurity essentials', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', true, 920, now() - interval '1 day'),
    
    ('Chemical Spill Response: Community Safety Protocols', 'Hazmat Team', v_section_emergency, v_category_id,
     'In the event of a chemical spill, knowing proper response protocols can prevent injuries and save lives.',
     'Chemical emergency response', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', true, 450, now() - interval '2 days'),
    
    ('Pandemic Preparedness: Lessons Learned and Future Planning', 'Health Officials', v_section_emergency, v_category_id,
     'Drawing from recent experiences, experts share critical pandemic preparedness strategies for families.',
     'Pandemic preparation guide', 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800', true, 1100, now() - interval '2 days');
  END IF;
  
  -- Preparedness Posts
  IF v_section_preparedness IS NOT NULL THEN
    SELECT id INTO v_category_id FROM categories WHERE section_id = v_section_preparedness LIMIT 1;
    
    INSERT INTO posts (title, author, section_id, category_id, content, excerpt, image_url, is_published, views, published_at) VALUES
    ('Building Your 72-Hour Emergency Kit: Complete Checklist', 'Preparedness Expert', v_section_preparedness, v_category_id,
     'A comprehensive guide to assembling a 72-hour emergency kit that will sustain your family during disasters.',
     'Essential emergency kit items', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800', true, 1450, now() - interval '3 hours'),
    
    ('Water Storage and Purification: Ultimate Guide', 'Survival Specialist', v_section_preparedness, v_category_id,
     'Learn proper water storage techniques and purification methods to ensure safe drinking water in emergencies.',
     'Water preparedness essentials', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', true, 980, now() - interval '6 hours'),
    
    ('Food Storage Basics: Long-Term Preservation Methods', 'Food Safety Expert', v_section_preparedness, v_category_id,
     'Master the art of long-term food storage with proper preservation techniques and rotation strategies.',
     'Food storage fundamentals', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', true, 820, now() - interval '10 hours'),
    
    ('Home Security: Protecting Your Property During Crisis', 'Security Consultant', v_section_preparedness, v_category_id,
     'Essential home security measures to protect your family and property during emergency situations.',
     'Home security strategies', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800', true, 710, now() - interval '14 hours'),
    
    ('Bug-Out Bag Essentials: What to Pack for Evacuation', 'Emergency Planner', v_section_preparedness, v_category_id,
     'Create the perfect bug-out bag with this comprehensive packing list for emergency evacuations.',
     'Bug-out bag checklist', 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800', true, 1200, now() - interval '1 day'),
    
    ('Off-Grid Living: Solar Power and Alternative Energy', 'Energy Expert', v_section_preparedness, v_category_id,
     'Explore solar power and alternative energy solutions for maintaining power during extended outages.',
     'Alternative energy guide', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', true, 650, now() - interval '1 day'),
    
    ('Medical Supplies: Building Your Home First Aid Kit', 'Medical Professional', v_section_preparedness, v_category_id,
     'Essential medical supplies and medications to stock for emergency medical situations.',
     'First aid kit essentials', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800', true, 890, now() - interval '2 days'),
    
    ('Communication Plans: Staying Connected in Emergencies', 'Communications Expert', v_section_preparedness, v_category_id,
     'Develop a family communication plan to stay connected when traditional methods fail.',
     'Emergency communication strategies', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', true, 560, now() - interval '2 days');
  END IF;
  
  -- Training Posts
  IF v_section_training IS NOT NULL THEN
    SELECT id INTO v_category_id FROM categories WHERE section_id = v_section_training LIMIT 1;
    
    INSERT INTO posts (title, author, section_id, category_id, content, excerpt, image_url, is_published, views, published_at) VALUES
    ('First Aid Fundamentals: Life-Saving Skills Everyone Should Know', 'Medical Instructor', v_section_training, v_category_id,
     'Master essential first aid skills that could save a life in critical emergency situations.',
     'Basic first aid training', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800', true, 1350, now() - interval '4 hours'),
    
    ('Self-Defense Training: Basic Techniques for Personal Safety', 'Defense Instructor', v_section_training, v_category_id,
     'Learn fundamental self-defense techniques to protect yourself and your loved ones.',
     'Self-defense basics', 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800', true, 1100, now() - interval '7 hours'),
    
    ('Wilderness Survival: Essential Skills for Outdoor Emergencies', 'Survival Expert', v_section_training, v_category_id,
     'Critical wilderness survival skills including shelter building, fire starting, and navigation.',
     'Wilderness survival guide', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800', true, 940, now() - interval '11 hours'),
    
    ('CPR and AED Training: Cardiac Emergency Response', 'Paramedic', v_section_training, v_category_id,
     'Learn proper CPR techniques and AED usage to respond effectively to cardiac emergencies.',
     'CPR training essentials', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', true, 870, now() - interval '15 hours'),
    
    ('Fire Safety Training: Prevention and Response', 'Fire Safety Officer', v_section_training, v_category_id,
     'Comprehensive fire safety training covering prevention, detection, and proper response techniques.',
     'Fire safety fundamentals', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', true, 720, now() - interval '1 day'),
    
    ('Navigation Skills: Map Reading and Compass Use', 'Navigation Expert', v_section_training, v_category_id,
     'Master traditional navigation skills using maps and compasses for emergency situations.',
     'Navigation training', 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800', true, 580, now() - interval '1 day'),
    
    ('Emergency Vehicle Operations: Safe Driving in Crisis', 'Driving Instructor', v_section_training, v_category_id,
     'Learn safe emergency driving techniques for evacuations and crisis situations.',
     'Emergency driving skills', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', true, 490, now() - interval '2 days'),
    
    ('Tactical Awareness: Situational Assessment Training', 'Security Trainer', v_section_training, v_category_id,
     'Develop tactical awareness and situational assessment skills for personal security.',
     'Tactical awareness guide', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800', true, 810, now() - interval '2 days');
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Realistic posts added successfully!';
  RAISE NOTICE '========================================';
END $$;

-- Show summary
SELECT 
  s.title as section,
  COUNT(p.id) as posts
FROM sections s
LEFT JOIN posts p ON s.id = p.section_id AND p.is_published = true
WHERE s.is_active = true
GROUP BY s.id, s.title
ORDER BY s.display_order;

SELECT '✅ Realistic content added! Your homepage sections are now populated.' as status;
