-- Add Posts Manually - Guaranteed to Work
-- Run this in Supabase SQL Editor

-- Insert 20 posts one by one
INSERT INTO posts (title, author, content, excerpt, image_url, is_published) VALUES
('Severe Weather Alert: Storm System Approaching', 'Weather Team', 'A major storm system is expected to impact eastern regions. Residents should prepare emergency kits and stay informed.', 'Major storm warning issued', 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800', true),

('Earthquake Preparedness: Essential Steps', 'Safety Team', 'Learn critical earthquake preparedness measures to protect your family during seismic events.', 'Complete earthquake safety guide', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800', true),

('Building Your 72-Hour Emergency Kit', 'Preparedness Expert', 'A comprehensive guide to assembling a 72-hour emergency kit for your family.', 'Essential emergency kit items', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800', true),

('Water Storage and Purification Guide', 'Survival Specialist', 'Learn proper water storage techniques and purification methods for emergencies.', 'Water preparedness essentials', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', true),

('First Aid Fundamentals: Life-Saving Skills', 'Medical Instructor', 'Master essential first aid skills that could save a life in critical situations.', 'Basic first aid training', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800', true),

('Self-Defense Training: Basic Techniques', 'Defense Instructor', 'Learn fundamental self-defense techniques for personal safety.', 'Self-defense basics', 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800', true),

('Wildfire Season: Protecting Your Home', 'Fire Safety Expert', 'Essential steps to protect your property during wildfire season.', 'Wildfire protection strategies', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', true),

('Flood Warning Systems Explained', 'Emergency Services', 'Understanding flood warning systems can save lives. Learn how to respond.', 'Flood warning guide', 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800', true),

('Power Outage Preparedness Guide', 'Utility Expert', 'Stay safe during extended power outages with these essential tips.', 'Blackout survival tips', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', true),

('Cyber Attack Alert: Digital Security', 'Cybersecurity Team', 'Protect your personal information from recent cyber threats.', 'Cybersecurity essentials', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', true),

('Food Storage Basics: Long-Term Methods', 'Food Safety Expert', 'Master long-term food storage with proper preservation techniques.', 'Food storage fundamentals', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', true),

('Home Security During Crisis', 'Security Consultant', 'Essential home security measures for emergency situations.', 'Home security strategies', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800', true),

('Bug-Out Bag Essentials Checklist', 'Emergency Planner', 'Create the perfect bug-out bag for emergency evacuations.', 'Bug-out bag checklist', 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800', true),

('Solar Power and Alternative Energy', 'Energy Expert', 'Explore alternative energy solutions for extended outages.', 'Alternative energy guide', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', true),

('Medical Supplies: Home First Aid Kit', 'Medical Professional', 'Essential medical supplies to stock for emergencies.', 'First aid kit essentials', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800', true),

('Emergency Communication Plans', 'Communications Expert', 'Develop a family communication plan for emergencies.', 'Emergency communication strategies', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', true),

('CPR and AED Training Guide', 'Paramedic', 'Learn proper CPR techniques and AED usage for cardiac emergencies.', 'CPR training essentials', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', true),

('Wilderness Survival Skills', 'Survival Expert', 'Critical wilderness survival skills including shelter and fire starting.', 'Wilderness survival guide', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800', true),

('Fire Safety Training and Prevention', 'Fire Safety Officer', 'Comprehensive fire safety training covering prevention and response.', 'Fire safety fundamentals', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', true),

('Navigation Skills: Maps and Compass', 'Navigation Expert', 'Master traditional navigation skills for emergency situations.', 'Navigation training', 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800', true);

-- Show results
SELECT 
  'Posts Created' as status,
  COUNT(*) as total
FROM posts
WHERE is_published = true;

-- Show sample
SELECT 
  title,
  author,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;

SELECT '✅ Added 20 posts successfully! Refresh your homepage.' as result;
