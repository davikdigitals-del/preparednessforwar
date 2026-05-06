-- Add Posts with Correct Column Names
-- This matches your actual posts table structure

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
  status
) VALUES
-- Emergency News Posts
('Severe Weather Alert: Storm System Approaching Eastern Regions', 
 'Major storm warning issued for eastern areas', 
 'A major storm system is expected to impact eastern regions over the next 48 hours. Residents should prepare emergency kits and stay informed through official channels. The storm is predicted to bring heavy rainfall, strong winds, and potential flooding. Emergency services are on high alert and evacuation orders may be issued for low-lying areas.',
 'emergency', 'natural-disasters', 'Weather Team',
 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
 ARRAY['weather', 'storm', 'emergency'], 1250, true, 'published'),

('Earthquake Preparedness: Essential Steps for Your Family',
 'Complete earthquake safety guide',
 'Learn critical earthquake preparedness measures to protect your family and property during seismic events. This comprehensive guide covers everything from creating an emergency kit to securing your home and developing a family communication plan.',
 'emergency', 'natural-disasters', 'Safety Team',
 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
 ARRAY['earthquake', 'safety', 'preparedness'], 890, true, 'published'),

('Wildfire Season: How to Protect Your Home',
 'Wildfire protection strategies',
 'With wildfire season approaching, learn essential steps to protect your property and create defensible space. Our experts share proven techniques for reducing fire risk and preparing your home for potential wildfire threats.',
 'emergency', 'natural-disasters', 'Fire Safety Expert',
 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
 ARRAY['wildfire', 'fire-safety', 'protection'], 670, true, 'published'),

('Flood Warning Systems: What You Need to Know',
 'Flood warning guide',
 'Understanding flood warning systems can save lives. Learn how to interpret alerts and take appropriate action when flood warnings are issued in your area. Know the difference between watches, warnings, and emergency declarations.',
 'emergency', 'natural-disasters', 'Emergency Services',
 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
 ARRAY['flood', 'warning', 'safety'], 540, true, 'published'),

-- Preparedness Posts
('Building Your 72-Hour Emergency Kit: Complete Checklist',
 'Essential emergency kit items',
 'A comprehensive guide to assembling a 72-hour emergency kit that will sustain your family during disasters. Learn what supplies are essential, how to store them properly, and when to rotate items for maximum effectiveness.',
 'preparedness', 'emergency-kits', 'Preparedness Expert',
 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
 ARRAY['emergency-kit', 'preparedness', 'supplies'], 1450, true, 'published'),

('Water Storage and Purification: Ultimate Guide',
 'Water preparedness essentials',
 'Learn proper water storage techniques and purification methods to ensure safe drinking water in emergencies. Discover the best containers, treatment options, and long-term storage solutions for your family.',
 'preparedness', 'water', 'Survival Specialist',
 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
 ARRAY['water', 'purification', 'storage'], 980, true, 'published'),

('Food Storage Basics: Long-Term Preservation Methods',
 'Food storage fundamentals',
 'Master the art of long-term food storage with proper preservation techniques and rotation strategies. Learn which foods store best, how to prevent spoilage, and create a sustainable food storage system.',
 'preparedness', 'food-storage', 'Food Safety Expert',
 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
 ARRAY['food', 'storage', 'preservation'], 820, true, 'published'),

('Home Security: Protecting Your Property During Crisis',
 'Home security strategies',
 'Essential home security measures to protect your family and property during emergency situations. Learn about physical security, surveillance systems, and crisis-specific protection strategies.',
 'preparedness', 'security', 'Security Consultant',
 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',
 ARRAY['security', 'home-protection', 'crisis'], 710, true, 'published'),

-- Training Posts
('First Aid Fundamentals: Life-Saving Skills Everyone Should Know',
 'Basic first aid training',
 'Master essential first aid skills that could save a life in critical emergency situations. Learn CPR, wound care, fracture management, and how to respond to common medical emergencies.',
 'training', 'first-aid', 'Medical Instructor',
 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
 ARRAY['first-aid', 'medical', 'training'], 1350, true, 'published'),

('Self-Defense Training: Basic Techniques for Personal Safety',
 'Self-defense basics',
 'Learn fundamental self-defense techniques to protect yourself and your loved ones. This course covers situational awareness, basic strikes, escapes, and de-escalation strategies.',
 'training', 'self-defense', 'Defense Instructor',
 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
 ARRAY['self-defense', 'safety', 'training'], 1100, true, 'published'),

('Wilderness Survival: Essential Skills for Outdoor Emergencies',
 'Wilderness survival guide',
 'Critical wilderness survival skills including shelter building, fire starting, and navigation. Learn how to survive in the wild with minimal equipment and find your way back to safety.',
 'training', 'survival-skills', 'Survival Expert',
 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
 ARRAY['wilderness', 'survival', 'outdoor'], 940, true, 'published'),

('CPR and AED Training: Cardiac Emergency Response',
 'CPR training essentials',
 'Learn proper CPR techniques and AED usage to respond effectively to cardiac emergencies. This life-saving training could help you save a family member, friend, or stranger in need.',
 'training', 'first-aid', 'Paramedic',
 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
 ARRAY['cpr', 'aed', 'cardiac'], 870, true, 'published'),

-- More Posts
('Power Outage Preparedness: Stay Safe During Blackouts',
 'Blackout survival tips',
 'Extended power outages can be dangerous. Learn how to prepare and stay safe when the lights go out, including backup power options, food safety, and heating alternatives.',
 'preparedness', 'power', 'Utility Expert',
 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
 ARRAY['power-outage', 'blackout', 'electricity'], 780, true, 'published'),

('Cyber Attack Alert: Protecting Your Digital Assets',
 'Cybersecurity essentials',
 'Recent cyber threats highlight the importance of digital security. Learn how to protect your personal information, secure your devices, and respond to cyber attacks.',
 'emergency', 'cyber-security', 'Cybersecurity Team',
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
 ARRAY['cybersecurity', 'digital', 'protection'], 920, true, 'published'),

('Bug-Out Bag Essentials: What to Pack for Evacuation',
 'Bug-out bag checklist',
 'Create the perfect bug-out bag with this comprehensive packing list for emergency evacuations. Learn what to include, how to organize it, and when to grab it and go.',
 'preparedness', 'emergency-kits', 'Emergency Planner',
 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800',
 ARRAY['bug-out-bag', 'evacuation', 'emergency'], 1200, true, 'published'),

('Fire Safety Training: Prevention and Response',
 'Fire safety fundamentals',
 'Comprehensive fire safety training covering prevention, detection, and proper response techniques. Learn how to use fire extinguishers, create escape plans, and prevent fires.',
 'training', 'fire-safety', 'Fire Safety Officer',
 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
 ARRAY['fire-safety', 'prevention', 'training'], 720, true, 'published'),

('Navigation Skills: Map Reading and Compass Use',
 'Navigation training',
 'Master traditional navigation skills using maps and compasses for emergency situations. Learn to read topographic maps, use a compass, and navigate without GPS.',
 'training', 'survival-skills', 'Navigation Expert',
 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
 ARRAY['navigation', 'maps', 'compass'], 580, true, 'published'),

('Emergency Communication Plans: Staying Connected',
 'Emergency communication strategies',
 'Develop a family communication plan to stay connected when traditional methods fail. Learn about alternative communication methods and emergency contact protocols.',
 'preparedness', 'communication', 'Communications Expert',
 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
 ARRAY['communication', 'emergency', 'family'], 560, true, 'published'),

('Solar Power and Alternative Energy Solutions',
 'Alternative energy guide',
 'Explore solar power and alternative energy solutions for maintaining power during extended outages. Learn about solar panels, generators, and battery backup systems.',
 'preparedness', 'power', 'Energy Expert',
 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
 ARRAY['solar', 'energy', 'power'], 650, true, 'published'),

('Medical Supplies: Building Your Home First Aid Kit',
 'First aid kit essentials',
 'Essential medical supplies and medications to stock for emergency medical situations. Learn what to include in your home first aid kit and how to use each item.',
 'preparedness', 'medical', 'Medical Professional',
 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
 ARRAY['medical', 'first-aid', 'supplies'], 890, true, 'published');

-- Show results
SELECT 
  'Posts Added' as status,
  COUNT(*) as total_posts
FROM posts
WHERE is_published = true;

-- Show sample posts
SELECT 
  title,
  section,
  category,
  author,
  view_count,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 10;

SELECT '✅ Added 20 posts with correct columns! Refresh your homepage.' as result;
