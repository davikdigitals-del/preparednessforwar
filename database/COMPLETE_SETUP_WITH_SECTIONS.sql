-- Complete Setup: Sections, Categories, and Posts
-- This script ensures everything is in place before adding posts

-- ============================================
-- STEP 1: Create Sections (if they don't exist)
-- ============================================

-- Insert sections only if they don't exist
INSERT INTO sections (slug, title, description, is_active, display_order)
SELECT * FROM (VALUES
  ('emergency-news', 'Emergency News', 'Latest emergency alerts and breaking news', true, 1),
  ('preparedness', 'Preparedness', 'Essential preparedness guides and resources', true, 2),
  ('training', 'Training', 'Training programs and skill development', true, 3),
  ('resources', 'Resources', 'Tools and resources for emergency preparedness', true, 4),
  ('community', 'Community', 'Community updates and local preparedness', true, 5)
) AS new_sections(slug, title, description, is_active, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM sections WHERE sections.slug = new_sections.slug
);

SELECT '✅ Step 1: Sections created/verified' as status;

-- ============================================
-- STEP 2: Create Categories (if they don't exist)
-- ============================================

-- Get section IDs for reference
DO $$
DECLARE
  emergency_section_id UUID;
  preparedness_section_id UUID;
  training_section_id UUID;
BEGIN
  -- Get section IDs
  SELECT id INTO emergency_section_id FROM sections WHERE slug = 'emergency-news' LIMIT 1;
  SELECT id INTO preparedness_section_id FROM sections WHERE slug = 'preparedness' LIMIT 1;
  SELECT id INTO training_section_id FROM sections WHERE slug = 'training' LIMIT 1;

  -- Insert categories for Emergency News
  INSERT INTO categories (name, slug, section_id, description)
  SELECT * FROM (VALUES
    ('Natural Disasters', 'natural-disasters', emergency_section_id, 'Earthquakes, floods, hurricanes, and other natural disasters'),
    ('Weather', 'weather', emergency_section_id, 'Weather alerts and forecasts'),
    ('Infrastructure', 'infrastructure', emergency_section_id, 'Power, water, and infrastructure emergencies'),
    ('Cyber Security', 'cyber-security', emergency_section_id, 'Digital threats and cybersecurity alerts')
  ) AS new_cats(name, slug, section_id, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.slug = new_cats.slug
  );

  -- Insert categories for Preparedness
  INSERT INTO categories (name, slug, section_id, description)
  SELECT * FROM (VALUES
    ('Emergency Kits', 'emergency-kits', preparedness_section_id, 'Building and maintaining emergency kits'),
    ('Water', 'water', preparedness_section_id, 'Water storage and purification'),
    ('Food Storage', 'food-storage', preparedness_section_id, 'Long-term food storage solutions'),
    ('Security', 'security', preparedness_section_id, 'Home and personal security'),
    ('Power', 'power', preparedness_section_id, 'Alternative power and energy solutions'),
    ('Communication', 'communication', preparedness_section_id, 'Emergency communication systems'),
    ('Medical', 'medical', preparedness_section_id, 'Medical supplies and health preparedness')
  ) AS new_cats(name, slug, section_id, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.slug = new_cats.slug
  );

  -- Insert categories for Training
  INSERT INTO categories (name, slug, section_id, description)
  SELECT * FROM (VALUES
    ('First Aid', 'first-aid', training_section_id, 'First aid and medical training'),
    ('Self Defense', 'self-defense', training_section_id, 'Self-defense and personal protection'),
    ('Survival Skills', 'survival-skills', training_section_id, 'Wilderness and urban survival skills'),
    ('Fire Safety', 'fire-safety', training_section_id, 'Fire prevention and response training')
  ) AS new_cats(name, slug, section_id, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.slug = new_cats.slug
  );

END $$;

SELECT '✅ Step 2: Categories created/verified' as status;

-- ============================================
-- STEP 3: Add Posts
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
  view_count,
  is_published,
  status,
  is_pinned
) VALUES
-- Emergency News Posts
('Severe Weather Alert: Storm System Approaching Eastern Regions', 
 'Major storm warning issued for eastern areas', 
 'A major storm system is expected to impact eastern regions over the next 48 hours. Residents should prepare emergency kits and stay informed through official channels. Local authorities recommend securing outdoor items, stocking up on essential supplies, and having evacuation plans ready. The storm is expected to bring heavy rainfall, strong winds up to 70 mph, and potential flooding in low-lying areas.',
 'emergency-news', 'weather', 'Weather Team',
 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
 ARRAY['weather', 'storm', 'emergency'], 1250, true, 'published', true),  -- ← PINNED

('Earthquake Preparedness: Essential Steps for Your Family',
 'Complete earthquake safety guide',
 'Learn critical earthquake preparedness measures to protect your family and property during seismic events. This comprehensive guide covers everything from securing furniture and creating emergency kits to developing family communication plans. Understand the "Drop, Cover, and Hold On" technique and learn what to do immediately after an earthquake strikes.',
 'emergency-news', 'natural-disasters', 'Safety Team',
 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
 ARRAY['earthquake', 'safety'], 890, true, 'published', true),  -- ← PINNED

('Wildfire Season: How to Protect Your Home',
 'Wildfire protection strategies',
 'With wildfire season approaching, learn essential steps to protect your property and create defensible space. This guide covers vegetation management, fire-resistant building materials, and evacuation planning. Create a 30-foot defensible space around your home by removing dead vegetation, trimming trees, and using fire-resistant landscaping materials.',
 'emergency-news', 'natural-disasters', 'Fire Safety Expert',
 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
 ARRAY['wildfire', 'fire-safety'], 670, true, 'published', false),

('Flood Warning Systems: What You Need to Know',
 'Understanding flood alerts and warnings',
 'Understanding flood warning systems can save lives. Learn how to interpret alerts and take appropriate action. This article explains the difference between flood watches and warnings, how to receive alerts, and what actions to take at each warning level. Know your flood zone and have an evacuation route planned.',
 'emergency-news', 'weather', 'Emergency Services',
 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
 ARRAY['flood', 'warning'], 540, true, 'published', false),

('Power Outage Preparedness: Stay Safe During Blackouts',
 'Blackout survival tips',
 'Extended power outages can be dangerous. Learn how to prepare and stay safe when the lights go out. This guide covers backup power options, food safety during outages, staying warm or cool without electricity, and maintaining communication. Keep flashlights, batteries, and a battery-powered radio readily accessible.',
 'emergency-news', 'infrastructure', 'Utility Expert',
 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
 ARRAY['power-outage', 'blackout'], 780, true, 'published', false),

-- Preparedness Posts
('Building Your 72-Hour Emergency Kit: Complete Checklist',
 'Essential emergency kit items',
 'A comprehensive guide to assembling a 72-hour emergency kit that will sustain your family during disasters. Your kit should include water (one gallon per person per day), non-perishable food, first aid supplies, medications, flashlights, batteries, radio, cash, important documents, and personal hygiene items. Customize your kit based on family needs including infants, elderly, or pets.',
 'preparedness', 'emergency-kits', 'Preparedness Expert',
 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
 ARRAY['emergency-kit', 'preparedness'], 1450, true, 'published', true),  -- ← PINNED

('Water Storage and Purification: Ultimate Guide',
 'Water preparedness essentials',
 'Learn proper water storage techniques and purification methods to ensure safe drinking water in emergencies. Store at least one gallon per person per day for drinking and sanitation. Use food-grade water storage containers and rotate your supply every six months. Learn multiple purification methods including boiling, chemical treatment, and filtration systems.',
 'preparedness', 'water', 'Survival Specialist',
 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
 ARRAY['water', 'purification'], 980, true, 'published', true),  -- ← PINNED

('Food Storage Basics: Long-Term Preservation Methods',
 'Food storage fundamentals',
 'Master the art of long-term food storage with proper preservation techniques and rotation strategies. Learn about freeze-dried foods, canned goods, and proper storage conditions. Implement the FIFO (First In, First Out) method to rotate your supplies. Store foods your family actually eats and consider dietary restrictions and preferences.',
 'preparedness', 'food-storage', 'Food Safety Expert',
 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
 ARRAY['food', 'storage'], 820, true, 'published', false),

('Home Security: Protecting Your Property During Crisis',
 'Home security strategies',
 'Essential home security measures to protect your family and property during emergency situations. Install quality locks, motion-sensor lights, and security cameras. Develop a family security plan and establish safe rooms. Learn about perimeter security, window reinforcement, and communication protocols with neighbors.',
 'preparedness', 'security', 'Security Consultant',
 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',
 ARRAY['security', 'home-protection'], 710, true, 'published', false),

('Bug-Out Bag Essentials: What to Pack for Evacuation',
 'Bug-out bag checklist',
 'Create the perfect bug-out bag with this comprehensive packing list for emergency evacuations. Your bag should be lightweight yet contain everything needed for 72 hours away from home. Include shelter materials, water purification, fire-starting tools, navigation equipment, first aid, food, and important documents in waterproof containers.',
 'preparedness', 'emergency-kits', 'Emergency Planner',
 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800',
 ARRAY['bug-out-bag', 'evacuation'], 1200, true, 'published', false),

-- Training Posts
('First Aid Fundamentals: Life-Saving Skills Everyone Should Know',
 'Basic first aid training',
 'Master essential first aid skills that could save a life in critical emergency situations. Learn how to treat wounds, control bleeding, recognize signs of shock, and respond to common medical emergencies. This course covers CPR basics, choking response, burn treatment, and fracture stabilization. Every family member should know these fundamental skills.',
 'training', 'first-aid', 'Medical Instructor',
 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
 ARRAY['first-aid', 'medical'], 1350, true, 'published', true),  -- ← PINNED

('Self-Defense Training: Basic Techniques for Personal Safety',
 'Self-defense basics',
 'Learn fundamental self-defense techniques to protect yourself and your loved ones. This training covers situational awareness, de-escalation strategies, and physical defense techniques. Understand legal aspects of self-defense and learn how to assess threats. Practice basic strikes, blocks, and escape techniques that work in real-world situations.',
 'training', 'self-defense', 'Defense Instructor',
 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
 ARRAY['self-defense', 'safety'], 1100, true, 'published', true),  -- ← PINNED

('Wilderness Survival: Essential Skills for Outdoor Emergencies',
 'Wilderness survival guide',
 'Critical wilderness survival skills including shelter building, fire starting, and navigation. Learn the survival priorities: shelter, water, fire, and food. Master primitive fire-starting techniques, construct emergency shelters from natural materials, and navigate using the sun and stars. Understand how to signal for rescue and find safe water sources.',
 'training', 'survival-skills', 'Survival Expert',
 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
 ARRAY['wilderness', 'survival'], 940, true, 'published', false),

('CPR and AED Training: Cardiac Emergency Response',
 'CPR training essentials',
 'Learn proper CPR techniques and AED usage to respond effectively to cardiac emergencies. This training covers adult, child, and infant CPR, proper compression depth and rate, rescue breathing, and automated external defibrillator operation. Understand the chain of survival and how your quick action can save lives. Certification courses available.',
 'training', 'first-aid', 'Paramedic',
 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
 ARRAY['cpr', 'aed'], 870, true, 'published', false),

('Fire Safety Training: Prevention and Response',
 'Fire safety fundamentals',
 'Comprehensive fire safety training covering prevention, detection, and proper response techniques. Learn about fire extinguisher types and usage, escape planning, smoke alarm maintenance, and fire prevention in the home. Practice the PASS technique (Pull, Aim, Squeeze, Sweep) and establish family fire drills. Know when to fight a fire and when to evacuate.',
 'training', 'fire-safety', 'Fire Safety Officer',
 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
 ARRAY['fire-safety', 'prevention'], 720, true, 'published', false),

('Navigation Skills: Map Reading and Compass Use',
 'Navigation training',
 'Master traditional navigation skills using maps and compasses for emergency situations. Learn to read topographic maps, use a compass for direction finding, and navigate without GPS. Understand map symbols, contour lines, and how to determine your location. Practice triangulation and dead reckoning techniques.',
 'training', 'survival-skills', 'Navigation Expert',
 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
 ARRAY['navigation', 'maps'], 580, true, 'published', false),

-- Additional Posts
('Cyber Attack Alert: Protecting Your Digital Assets',
 'Cybersecurity essentials',
 'Recent cyber threats highlight the importance of digital security. Learn how to protect your personal information, secure your devices, and recognize phishing attempts. Use strong passwords, enable two-factor authentication, keep software updated, and back up important data regularly. Understand ransomware threats and how to prevent them.',
 'emergency-news', 'cyber-security', 'Cybersecurity Team',
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
 ARRAY['cybersecurity', 'digital'], 920, true, 'published', false),

('Solar Power and Alternative Energy Solutions',
 'Alternative energy guide',
 'Explore solar power and alternative energy solutions for maintaining power during extended outages. Learn about solar panel systems, battery storage, generators, and hybrid solutions. Calculate your power needs and choose the right system for your home. Understand installation requirements, maintenance, and cost considerations.',
 'preparedness', 'power', 'Energy Expert',
 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
 ARRAY['solar', 'energy'], 650, true, 'published', false),

('Emergency Communication Plans: Staying Connected',
 'Emergency communication strategies',
 'Develop a family communication plan to stay connected when traditional methods fail. Establish out-of-area contacts, learn about emergency communication devices like ham radios and satellite phones, and understand how to use social media during disasters. Create a communication card for each family member with important contacts and meeting locations.',
 'preparedness', 'communication', 'Communications Expert',
 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
 ARRAY['communication', 'emergency'], 560, true, 'published', false),

('Medical Supplies: Building Your Home First Aid Kit',
 'First aid kit essentials',
 'Essential medical supplies and medications to stock for emergency medical situations. Your kit should include bandages, gauze, antiseptics, pain relievers, prescription medications, medical tools, and emergency medications. Consider special needs like insulin, EpiPens, or specific prescriptions. Keep a detailed inventory and check expiration dates regularly.',
 'preparedness', 'medical', 'Medical Professional',
 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
 ARRAY['medical', 'first-aid'], 890, true, 'published', false);

SELECT '✅ Step 3: Posts added successfully' as status;

-- ============================================
-- STEP 4: Verification
-- ============================================

-- Show results
SELECT 
  '📊 SETUP COMPLETE' as status,
  (SELECT COUNT(*) FROM sections WHERE is_active = true) as active_sections,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM posts WHERE is_published = true) as published_posts;

-- Show posts by section
SELECT 
  '📈 Posts by Section' as report,
  section,
  COUNT(*) as post_count
FROM posts
WHERE is_published = true
GROUP BY section
ORDER BY post_count DESC;

-- Show sample posts
SELECT 
  '📝 Sample Posts' as report,
  title,
  section,
  category,
  view_count
FROM posts
WHERE is_published = true
ORDER BY created_at DESC
LIMIT 10;

SELECT '✅ COMPLETE! Refresh your homepage at http://localhost:8080' as final_message;
