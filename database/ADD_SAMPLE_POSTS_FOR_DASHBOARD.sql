-- ============================================================================
-- ADD SAMPLE POSTS FOR MEMBER DASHBOARD
-- ============================================================================
-- Run this in Supabase SQL Editor if member dashboard shows "No posts found"
-- This will add sample posts so members can see content
-- ============================================================================

-- Check current post count
SELECT COUNT(*) as total_posts, 
       COUNT(*) FILTER (WHERE is_published = true) as published_posts
FROM posts;

-- If you see 0 posts, run the INSERT statements below

-- ============================================================================
-- Add Sample Posts
-- ============================================================================

INSERT INTO posts (
  title, 
  standfirst, 
  section, 
  category, 
  author, 
  body, 
  image, 
  tags, 
  is_published, 
  published_at,
  read_time,
  view_count
)
VALUES 
  -- Post 1: Breaking News
  (
    'Global Defense Summit Announces New Security Framework',
    'World leaders gather to discuss emerging threats and collaborative defense strategies in an increasingly complex geopolitical landscape.',
    'news',
    'breaking-news',
    'Sarah Mitchell',
    '<h2>Historic Agreement Reached</h2><p>In a landmark decision, defense ministers from 45 nations have agreed to a comprehensive new security framework designed to address 21st-century threats. The agreement, reached after three days of intensive negotiations, represents the most significant shift in global defense cooperation since the end of the Cold War.</p><h3>Key Points of the Framework</h3><ul><li>Enhanced intelligence sharing protocols</li><li>Joint cyber defense initiatives</li><li>Coordinated response to hybrid warfare</li><li>Climate security considerations</li></ul><p>The framework will be implemented in phases over the next 18 months, with initial pilot programs beginning in Q2 2026.</p>',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    ARRAY['defense', 'security', 'international', 'breaking'],
    true,
    NOW() - INTERVAL '2 hours',
    '8 min',
    1247
  ),

  -- Post 2: Military Technology
  (
    'Next-Generation Fighter Jets Enter Production Phase',
    'Advanced stealth technology and AI-assisted systems mark a new era in aerial combat capabilities.',
    'defense',
    'military-tech',
    'James Rodriguez',
    '<h2>Revolutionary Technology</h2><p>The latest generation of fighter aircraft combines cutting-edge stealth capabilities with artificial intelligence to create what military analysts are calling a "game-changing" platform. The new jets feature advanced sensor fusion, autonomous flight capabilities, and unprecedented situational awareness.</p><h3>Technical Specifications</h3><ul><li>Maximum speed: Mach 2.5+</li><li>Range: 2,000+ nautical miles</li><li>Stealth coating: Next-gen radar-absorbent materials</li><li>AI co-pilot system for enhanced decision-making</li></ul><p>Production is expected to ramp up significantly in 2027, with initial deliveries to allied air forces beginning in late 2026.</p>',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    ARRAY['military', 'technology', 'aviation', 'defense'],
    true,
    NOW() - INTERVAL '5 hours',
    '6 min',
    892
  ),

  -- Post 3: NATO Updates
  (
    'NATO Strengthens Eastern Flank with New Deployments',
    'Alliance announces enhanced forward presence in response to evolving security challenges.',
    'geopolitics',
    'nato-updates',
    'Emma Thompson',
    '<h2>Enhanced Deterrence Posture</h2><p>NATO has announced a significant enhancement of its eastern flank defenses, with new multinational battlegroups to be deployed across several member states. The move comes as part of the alliance''s ongoing adaptation to the changing security environment.</p><h3>Deployment Details</h3><ul><li>Four new battlegroups totaling 8,000 troops</li><li>Enhanced air policing missions</li><li>Increased naval presence in the Baltic Sea</li><li>Improved rapid response capabilities</li></ul><p>NATO Secretary General emphasized that these measures are defensive in nature and aimed at ensuring the security of all alliance members.</p>',
    'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800',
    ARRAY['nato', 'alliance', 'defense', 'europe'],
    true,
    NOW() - INTERVAL '1 day',
    '7 min',
    2156
  ),

  -- Post 4: Cybersecurity
  (
    'Major Cyber Defense Initiative Launched to Protect Critical Infrastructure',
    'Government and private sector collaborate on comprehensive cybersecurity framework.',
    'technology',
    'cybersecurity',
    'Michael Chen',
    '<h2>Protecting the Digital Frontier</h2><p>A new public-private partnership has been announced to bolster cybersecurity defenses across critical infrastructure sectors. The initiative brings together government agencies, technology companies, and infrastructure operators to create a unified defense against increasingly sophisticated cyber threats.</p><h3>Program Components</h3><ul><li>24/7 threat monitoring and response center</li><li>AI-powered threat detection systems</li><li>Regular security audits and penetration testing</li><li>Workforce training and certification programs</li></ul><p>The program will initially focus on energy, water, and transportation sectors, with plans to expand to other critical infrastructure areas.</p>',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    ARRAY['cybersecurity', 'technology', 'infrastructure', 'defense'],
    true,
    NOW() - INTERVAL '1 day 6 hours',
    '5 min',
    1543
  ),

  -- Post 5: Intelligence
  (
    'Intelligence Agencies Enhance Cooperation on Emerging Threats',
    'New information-sharing protocols aim to improve response times and threat assessment.',
    'intelligence',
    'analysis',
    'David Park',
    '<h2>Strengthening Intelligence Networks</h2><p>Intelligence agencies from allied nations have agreed to implement enhanced information-sharing protocols designed to improve the speed and accuracy of threat assessments. The new framework leverages advanced data analytics and secure communication channels to facilitate real-time intelligence exchange.</p><h3>Key Improvements</h3><ul><li>Secure cloud-based intelligence platform</li><li>Standardized threat classification system</li><li>Joint analysis teams for complex threats</li><li>Automated alert systems for time-sensitive intelligence</li></ul><p>Officials say the new system will significantly reduce the time between threat detection and coordinated response.</p>',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    ARRAY['intelligence', 'security', 'cooperation', 'analysis'],
    true,
    NOW() - INTERVAL '2 days',
    '9 min',
    987
  ),

  -- Post 6: Training & Readiness
  (
    'Large-Scale Military Exercise Tests Joint Operations Capabilities',
    'Multinational forces conduct comprehensive training across land, sea, and air domains.',
    'defense',
    'training',
    'Colonel Rebecca Hayes',
    '<h2>Exercise Demonstrates Readiness</h2><p>Over 30,000 troops from 15 nations participated in one of the largest military exercises in recent years, testing interoperability and joint operations capabilities across multiple domains. The two-week exercise included complex scenarios designed to challenge command structures and logistics systems.</p><h3>Exercise Highlights</h3><ul><li>Amphibious assault operations</li><li>Air superiority missions</li><li>Cyber defense simulations</li><li>Humanitarian assistance scenarios</li></ul><p>Commanders reported high levels of coordination and praised the professionalism of all participating forces.</p>',
    'https://images.unsplash.com/photo-1579003593419-98f949b9398f?w=800',
    ARRAY['military', 'training', 'exercise', 'readiness'],
    true,
    NOW() - INTERVAL '3 days',
    '6 min',
    1876
  ),

  -- Post 7: Space Security
  (
    'New Space Surveillance System Enhances Orbital Security',
    'Advanced tracking capabilities provide unprecedented awareness of space domain activities.',
    'technology',
    'space',
    'Dr. Lisa Anderson',
    '<h2>Eyes on the Heavens</h2><p>A state-of-the-art space surveillance system has become operational, providing military and civilian authorities with enhanced capabilities to track objects in Earth orbit. The system uses a network of ground-based radars and optical sensors to monitor satellites, debris, and potential threats.</p><h3>System Capabilities</h3><ul><li>Track objects as small as 10cm in low Earth orbit</li><li>Real-time collision warning system</li><li>Automated threat assessment algorithms</li><li>Integration with international space agencies</li></ul><p>The system represents a significant advancement in space situational awareness and will help ensure the safety of critical space assets.</p>',
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    ARRAY['space', 'technology', 'surveillance', 'security'],
    true,
    NOW() - INTERVAL '4 days',
    '7 min',
    1234
  ),

  -- Post 8: Maritime Security
  (
    'Naval Forces Conduct Anti-Piracy Operations in Strategic Waters',
    'International coalition maintains freedom of navigation in critical shipping lanes.',
    'defense',
    'maritime',
    'Admiral John Stevens',
    '<h2>Securing the Seas</h2><p>A multinational naval task force continues its successful anti-piracy operations in key maritime chokepoints, ensuring the safe passage of commercial shipping. The operation has resulted in a significant decrease in piracy incidents and has helped stabilize regional maritime security.</p><h3>Operation Results</h3><ul><li>Zero successful piracy attacks in protected zones</li><li>15 suspected pirate vessels interdicted</li><li>Hundreds of merchant vessels safely escorted</li><li>Enhanced cooperation with regional navies</li></ul><p>The operation will continue indefinitely, with rotating contributions from participating nations.</p>',
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800',
    ARRAY['maritime', 'security', 'naval', 'operations'],
    true,
    NOW() - INTERVAL '5 days',
    '5 min',
    1654
  );

-- ============================================================================
-- Verify posts were added
-- ============================================================================

SELECT 
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE is_published = true) as published_posts,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as newly_added
FROM posts;

-- You should see:
-- total_posts: 8 (or more if you had existing posts)
-- published_posts: 8 (or more)
-- newly_added: 8

-- ============================================================================
-- View the posts
-- ============================================================================

SELECT 
  title,
  section,
  category,
  author,
  published_at,
  view_count,
  is_published
FROM posts
ORDER BY published_at DESC
LIMIT 10;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Now go to your member dashboard and you should see posts!
-- https://your-app.onrender.com/dashboard
-- ============================================================================
