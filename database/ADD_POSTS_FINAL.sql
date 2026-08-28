-- Add Posts - Final Working Version
-- This provides all required NOT NULL columns

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
 'A major storm system is expected to impact eastern regions over the next 48 hours. Residents should prepare emergency kits and stay informed through official channels.',
 'emergency-news', 'natural-disasters', 'Weather Team',
 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
 ARRAY['weather', 'storm', 'emergency'], 1250, true, 'published'),

('Earthquake Preparedness: Essential Steps for Your Family',
 'Complete earthquake safety guide',
 'Learn critical earthquake preparedness measures to protect your family and property during seismic events.',
 'emergency-news', 'natural-disasters', 'Safety Team',
 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
 ARRAY['earthquake', 'safety'], 890, true, 'published'),

('Wildfire Season: How to Protect Your Home',
 'Wildfire protection strategies',
 'With wildfire season approaching, learn essential steps to protect your property and create defensible space.',
 'emergency-news', 'natural-disasters', 'Fire Safety Expert',
 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
 ARRAY['wildfire', 'fire-safety'], 670, true, 'published'),

('Flood Warning Systems: What You Need to Know',
 'Flood warning guide',
 'Understanding flood warning systems can save lives. Learn how to interpret alerts and take appropriate action.',
 'emergency-news', 'weather', 'Emergency Services',
 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
 ARRAY['flood', 'warning'], 540, true, 'published'),

('Power Outage Preparedness: Stay Safe During Blackouts',
 'Blackout survival tips',
 'Extended power outages can be dangerous. Learn how to prepare and stay safe when the lights go out.',
 'emergency-news', 'infrastructure', 'Utility Expert',
 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
 ARRAY['power-outage', 'blackout'], 780, true, 'published'),

-- Preparedness Posts
('Building Your 72-Hour Emergency Kit: Complete Checklist',
 'Essential emergency kit items',
 'A comprehensive guide to assembling a 72-hour emergency kit that will sustain your family during disasters.',
 'preparedness', 'emergency-kits', 'Preparedness Expert',
 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
 ARRAY['emergency-kit', 'preparedness'], 1450, true, 'published'),

('Water Storage and Purification: Ultimate Guide',
 'Water preparedness essentials',
 'Learn proper water storage techniques and purification methods to ensure safe drinking water in emergencies.',
 'preparedness', 'water', 'Survival Specialist',
 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
 ARRAY['water', 'purification'], 980, true, 'published'),

('Food Storage Basics: Long-Term Preservation Methods',
 'Food storage fundamentals',
 'Master the art of long-term food storage with proper preservation techniques and rotation strategies.',
 'preparedness', 'food-storage', 'Food Safety Expert',
 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
 ARRAY['food', 'storage'], 820, true, 'published'),

('Home Security: Protecting Your Property During Crisis',
 'Home security strategies',
 'Essential home security measures to protect your family and property during emergency situations.',
 'preparedness', 'security', 'Security Consultant',
 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',
 ARRAY['security', 'home-protection'], 710, true, 'published'),

('Bug-Out Bag Essentials: What to Pack for Evacuation',
 'Bug-out bag checklist',
 'Create the perfect bug-out bag with this comprehensive packing list for emergency evacuations.',
 'preparedness', 'emergency-kits', 'Emergency Planner',
 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800',
 ARRAY['bug-out-bag', 'evacuation'], 1200, true, 'published'),

-- Training Posts
('First Aid Fundamentals: Life-Saving Skills Everyone Should Know',
 'Basic first aid training',
 'Master essential first aid skills that could save a life in critical emergency situations.',
 'training', 'first-aid', 'Medical Instructor',
 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
 ARRAY['first-aid', 'medical'], 1350, true, 'published'),

('Self-Defense Training: Basic Techniques for Personal Safety',
 'Self-defense basics',
 'Learn fundamental self-defense techniques to protect yourself and your loved ones.',
 'training', 'self-defense', 'Defense Instructor',
 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
 ARRAY['self-defense', 'safety'], 1100, true, 'published'),

('Wilderness Survival: Essential Skills for Outdoor Emergencies',
 'Wilderness survival guide',
 'Critical wilderness survival skills including shelter building, fire starting, and navigation.',
 'training', 'survival-skills', 'Survival Expert',
 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
 ARRAY['wilderness', 'survival'], 940, true, 'published'),

('CPR and AED Training: Cardiac Emergency Response',
 'CPR training essentials',
 'Learn proper CPR techniques and AED usage to respond effectively to cardiac emergencies.',
 'training', 'first-aid', 'Paramedic',
 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
 ARRAY['cpr', 'aed'], 870, true, 'published'),

('Fire Safety Training: Prevention and Response',
 'Fire safety fundamentals',
 'Comprehensive fire safety training covering prevention, detection, and proper response techniques.',
 'training', 'fire-safety', 'Fire Safety Officer',
 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
 ARRAY['fire-safety', 'prevention'], 720, true, 'published'),

('Navigation Skills: Map Reading and Compass Use',
 'Navigation training',
 'Master traditional navigation skills using maps and compasses for emergency situations.',
 'training', 'survival-skills', 'Navigation Expert',
 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
 ARRAY['navigation', 'maps'], 580, true, 'published'),

-- More Posts
('Cyber Attack Alert: Protecting Your Digital Assets',
 'Cybersecurity essentials',
 'Recent cyber threats highlight the importance of digital security. Learn how to protect your personal information.',
 'emergency-news', 'cyber-security', 'Cybersecurity Team',
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
 ARRAY['cybersecurity', 'digital'], 920, true, 'published'),

('Solar Power and Alternative Energy Solutions',
 'Alternative energy guide',
 'Explore solar power and alternative energy solutions for maintaining power during extended outages.',
 'preparedness', 'power', 'Energy Expert',
 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
 ARRAY['solar', 'energy'], 650, true, 'published'),

('Emergency Communication Plans: Staying Connected',
 'Emergency communication strategies',
 'Develop a family communication plan to stay connected when traditional methods fail.',
 'preparedness', 'communication', 'Communications Expert',
 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
 ARRAY['communication', 'emergency'], 560, true, 'published'),

('Medical Supplies: Building Your Home First Aid Kit',
 'First aid kit essentials',
 'Essential medical supplies and medications to stock for emergency medical situations.',
 'preparedness', 'medical', 'Medical Professional',
 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
 ARRAY['medical', 'first-aid'], 890, true, 'published');

-- Show results
SELECT 
  'Posts Added' as status,
  COUNT(*) as total_posts,
  COUNT(DISTINCT section) as sections_used,
  COUNT(DISTINCT category) as categories_used
FROM posts
WHERE is_published = true;

-- Show posts by section
SELECT 
  section,
  COUNT(*) as post_count
FROM posts
WHERE is_published = true
GROUP BY section
ORDER BY post_count DESC;

-- Show sample posts
SELECT 
  title,
  section,
  category,
  view_count
FROM posts
ORDER BY created_at DESC
LIMIT 10;

SELECT '✅ Added 20 posts successfully! Refresh your homepage at http://localhost:8080' as result;
