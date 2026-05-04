-- ============================================
-- 🎯 COMPLETE DATABASE SETUP - ALL IN ONE FILE
-- ============================================
-- This file contains EVERYTHING you need:
-- ✅ Schema (all tables)
-- ✅ Auth roles & RLS policies  
-- ✅ Sample data (10 posts, 6 media, etc.)
-- ✅ Functions & triggers
-- ✅ Indexes for performance
--
-- Just run THIS ONE FILE and you're done!
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 0: DROP EXISTING TABLES (CLEAN START)
-- ============================================
-- ⚠️ WARNING: This deletes all existing data!
-- This ensures we start fresh with the correct schema

DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_revisions CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS media_items CASCADE;
DROP TABLE IF EXISTS library_items CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS encyclopaedia_entries CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS banner_settings CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS newsletter_campaigns CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS search_queries CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- PART 1: CREATE ALL TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'editor')),
  country TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  newsletter_subscribed BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'bookmark', 'share', 'comment', 'like')),
  post_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table (WITH section and standfirst columns!)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  standfirst TEXT,
  body TEXT,
  section TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  image TEXT,
  thumbnail TEXT,
  tags TEXT[] DEFAULT '{}',
  country_codes TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  read_time TEXT DEFAULT '5 min',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Post revisions
CREATE TABLE IF NOT EXISTS post_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  edited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'insightful', 'helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Sections
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, slug)
);

-- Media items
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'podcast', 'image', 'audio')),
  url TEXT,
  thumbnail TEXT,
  file_size BIGINT,
  duration TEXT,
  author TEXT,
  tags TEXT[] DEFAULT '{}',
  country_codes TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library items
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  cover_image_url TEXT,
  cover_color TEXT DEFAULT 'bg-primary',
  format TEXT DEFAULT 'PDF',
  pages INTEGER,
  file_size BIGINT,
  country_codes TEXT[] DEFAULT '{}',
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File uploads
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  bucket TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encyclopaedia entries
CREATE TABLE IF NOT EXISTS encyclopaedia_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  letter TEXT NOT NULL CHECK (letter ~ '^[A-Z]$'),
  content TEXT NOT NULL,
  related_entries UUID[],
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT TRUE,
  country_codes TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banner settings
CREATE TABLE IF NOT EXISTS banner_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT TRUE,
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'high' CHECK (priority IN ('low', 'medium', 'high')),
  background_color TEXT,
  text_color TEXT,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Static pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Newsletter campaigns
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page views
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search queries
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT,
  is_nato BOOLEAN DEFAULT FALSE,
  region TEXT,
  timezone TEXT
);

-- User roles table for auth
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================
-- PART 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_section ON posts(section);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_posts_country_codes ON posts USING GIN(country_codes);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_post_id ON user_activity(post_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_published_at ON media_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);

-- ============================================
-- PART 3: CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_items_updated_at ON media_items;
CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_library_items_updated_at ON library_items;
CREATE TRIGGER update_library_items_updated_at BEFORE UPDATE ON library_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_encyclopaedia_entries_updated_at ON encyclopaedia_entries;
CREATE TRIGGER update_encyclopaedia_entries_updated_at BEFORE UPDATE ON encyclopaedia_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_post_views(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending posts
CREATE OR REPLACE FUNCTION get_trending_posts(days INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  post_id UUID,
  title TEXT,
  view_count INTEGER,
  comment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.view_count,
    COUNT(pc.id) as comment_count
  FROM posts p
  LEFT JOIN post_comments pc ON p.id = pc.post_id
  WHERE p.published_at >= NOW() - (days || ' days')::INTERVAL
    AND p.status = 'published'
  GROUP BY p.id, p.title, p.view_count
  ORDER BY p.view_count DESC, comment_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 4: ROW LEVEL SECURITY (RLS) & AUTH
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON post_comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published' OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can insert posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON post_comments FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Authenticated users can insert comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 5: INSERT INITIAL DATA
-- ============================================

-- Insert sections
INSERT INTO sections (slug, title, description, order_index) VALUES
  ('emergency', 'Emergency', 'Critical emergency information and alerts', 1),
  ('survival', 'Survival', 'Survival guides and techniques', 2),
  ('health', 'Health', 'Health and medical information', 3),
  ('directives', 'Directives', 'Official directives and guidelines', 4),
  ('supplies', 'Supplies', 'Supply management and resources', 5),
  ('resources', 'Resources', 'Additional resources and tools', 6),
  ('education', 'Education', 'Educational content and training', 7),
  ('community', 'Community', 'Community updates and news', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert NATO countries
INSERT INTO countries (code, name, flag, is_nato) VALUES
  ('US', 'United States', '🇺🇸', true),
  ('GB', 'United Kingdom', '🇬🇧', true),
  ('FR', 'France', '🇫🇷', true),
  ('DE', 'Germany', '🇩🇪', true),
  ('IT', 'Italy', '🇮🇹', true),
  ('CA', 'Canada', '🇨🇦', true),
  ('ES', 'Spain', '🇪🇸', true),
  ('PL', 'Poland', '🇵🇱', true),
  ('NL', 'Netherlands', '🇳🇱', true),
  ('BE', 'Belgium', '🇧🇪', true),
  ('CZ', 'Czech Republic', '🇨🇿', true),
  ('GR', 'Greece', '🇬🇷', true),
  ('PT', 'Portugal', '🇵🇹', true),
  ('HU', 'Hungary', '🇭🇺', true),
  ('RO', 'Romania', '🇷🇴', true),
  ('BG', 'Bulgaria', '🇧🇬', true),
  ('SK', 'Slovakia', '🇸🇰', true),
  ('HR', 'Croatia', '🇭🇷', true),
  ('LT', 'Lithuania', '🇱🇹', true),
  ('LV', 'Latvia', '🇱🇻', true),
  ('EE', 'Estonia', '🇪🇪', true),
  ('SI', 'Slovenia', '🇸🇮', true),
  ('AL', 'Albania', '🇦🇱', true),
  ('MK', 'North Macedonia', '🇲🇰', true),
  ('ME', 'Montenegro', '🇲🇪', true),
  ('NO', 'Norway', '🇳🇴', true),
  ('IS', 'Iceland', '🇮🇸', true),
  ('LU', 'Luxembourg', '🇱🇺', true),
  ('DK', 'Denmark', '🇩🇰', true),
  ('TR', 'Turkey', '🇹🇷', true),
  ('FI', 'Finland', '🇫🇮', true),
  ('SE', 'Sweden', '🇸🇪', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- PART 6: INSERT SAMPLE DATA
-- ============================================

-- Sample Posts
INSERT INTO posts (title, standfirst, body, section, category, author, image, tags, country_codes, status, is_pinned, view_count, read_time, published_at) VALUES
('Emergency Preparedness: Essential Guide for NATO Members', 'A comprehensive guide to emergency preparedness covering essential supplies, communication protocols, and safety procedures.', 'In times of crisis, being prepared can make all the difference. This guide covers everything you need to know about emergency preparedness, from building your emergency kit to establishing communication protocols with your family and community. We''ll explore essential supplies, evacuation procedures, and how to stay informed during emergencies.', 'emergency', 'alerts', 'John Smith', 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800', ARRAY['emergency', 'preparedness', 'safety', 'nato'], ARRAY['US', 'GB', 'FR', 'DE', 'CA'], 'published', true, 1247, '8 min', NOW() - INTERVAL '1 day'),
('Survival Skills: Wilderness Navigation Basics', 'Learn essential wilderness navigation techniques using map, compass, and natural landmarks.', 'Wilderness navigation is a critical survival skill. This article teaches you how to read topographic maps, use a compass effectively, and navigate using natural landmarks like the sun, stars, and terrain features. Whether you''re hiking, camping, or in an emergency situation, these skills could save your life.', 'survival', 'wilderness', 'Sarah Johnson', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', ARRAY['survival', 'navigation', 'wilderness', 'skills'], ARRAY['US', 'CA', 'NO', 'SE', 'FI'], 'published', false, 892, '12 min', NOW() - INTERVAL '2 days'),
('First Aid Essentials: What Every Household Should Know', 'Critical first aid knowledge and techniques that could save lives in emergency situations.', 'First aid knowledge is invaluable in emergencies. This comprehensive guide covers CPR, treating wounds, managing shock, handling fractures, and responding to common medical emergencies. We''ll also discuss what should be in your first aid kit and how to maintain it.', 'health', 'first-aid', 'Dr. Emily Brown', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800', ARRAY['health', 'first-aid', 'medical', 'emergency'], ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES'], 'published', true, 2156, '15 min', NOW() - INTERVAL '3 days'),
('NATO Security Protocols: Updated Guidelines for 2026', 'Latest security protocols and guidelines for NATO member countries and personnel.', 'NATO has released updated security protocols for 2026, addressing emerging threats and incorporating lessons learned from recent operations. This directive outlines new procedures for information security, physical security measures, and coordination between member nations.', 'directives', 'nato-updates', 'NATO Command', 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800', ARRAY['nato', 'security', 'protocols', 'official'], ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL', 'NL', 'BE', 'CZ'], 'published', true, 3421, '10 min', NOW() - INTERVAL '4 days'),
('Food Storage and Preservation: Long-Term Strategies', 'Effective methods for storing and preserving food for extended periods during emergencies.', 'Proper food storage is essential for emergency preparedness. Learn about different preservation methods including canning, dehydration, and vacuum sealing. We''ll cover optimal storage conditions, shelf life expectations, and how to rotate your emergency food supply.', 'supplies', 'food', 'Maria Garcia', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', ARRAY['food', 'storage', 'preservation', 'supplies'], ARRAY['US', 'GB', 'FR', 'DE', 'IT'], 'published', false, 654, '9 min', NOW() - INTERVAL '5 days'),
('Emergency Communication: Staying Connected When Networks Fail', 'Alternative communication methods and technologies for emergency situations.', 'When traditional communication networks fail, having alternative methods is crucial. This guide explores ham radio, satellite phones, mesh networks, and other communication technologies. Learn how to set up emergency communication plans with your family and community.', 'resources', 'communication', 'Alex Thompson', 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=800', ARRAY['communication', 'technology', 'emergency', 'radio'], ARRAY['US', 'CA', 'GB', 'DE'], 'published', false, 478, '11 min', NOW() - INTERVAL '6 days'),
('Civil Defense Training: New Programs Available', 'Comprehensive training programs now available for civilians in NATO member countries.', 'New civil defense training programs are being rolled out across NATO member countries. These programs cover emergency response, first aid, search and rescue basics, and community coordination. Find out how to enroll in programs in your area.', 'education', 'training', 'Training Institute', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', ARRAY['training', 'education', 'civil-defense', 'programs'], ARRAY['US', 'GB', 'FR', 'DE', 'PL', 'CZ'], 'published', false, 1089, '7 min', NOW() - INTERVAL '7 days'),
('Community Resilience: Building Stronger Neighborhoods', 'How communities can work together to improve resilience and emergency preparedness.', 'Strong communities are more resilient in times of crisis. Learn how to organize neighborhood emergency response teams, establish communication networks, share resources, and create mutual aid agreements. Real-world examples from communities across NATO countries.', 'community', 'local-news', 'Community Reporter', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', ARRAY['community', 'resilience', 'cooperation', 'local'], ARRAY['US', 'GB', 'CA', 'NL', 'BE'], 'published', false, 723, '6 min', NOW() - INTERVAL '8 days'),
('Water Purification: Essential Techniques for Survival', 'Methods for purifying water in emergency situations when clean water is unavailable.', 'Access to clean water is critical for survival. This guide covers multiple water purification methods including boiling, chemical treatment, filtration, and UV purification. Learn which methods work best in different situations and how to build emergency water filters.', 'survival', 'water', 'Sarah Johnson', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', ARRAY['water', 'purification', 'survival', 'health'], ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES'], 'published', false, 945, '10 min', NOW() - INTERVAL '9 days'),
('Shelter Building: Techniques for Harsh Environments', 'How to construct emergency shelters in various environments and weather conditions.', 'Knowing how to build emergency shelter can save your life in extreme conditions. This comprehensive guide covers shelter construction for different environments: forests, deserts, mountains, and urban areas. Learn about materials, insulation, and location selection.', 'survival', 'shelter', 'Mike Anderson', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', ARRAY['shelter', 'survival', 'construction', 'wilderness'], ARRAY['US', 'CA', 'NO', 'SE', 'FI', 'IS'], 'published', false, 567, '13 min', NOW() - INTERVAL '10 days');

-- Sample Media Items
INSERT INTO media_items (title, description, type, url, thumbnail, duration, author, tags, country_codes, views, published_at) VALUES
('Emergency Response Training Video', 'Comprehensive video guide on emergency response procedures for civilians.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400', '24:35', 'Training Department', ARRAY['training', 'emergency', 'video'], ARRAY['US', 'GB', 'FR', 'DE'], 3421, NOW() - INTERVAL '5 days'),
('Survival Skills Podcast: Episode 12', 'Interview with wilderness survival expert discussing essential skills.', 'podcast', 'https://example.com/podcast/ep12', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400', '45:20', 'Survival Podcast Network', ARRAY['podcast', 'survival', 'interview'], ARRAY['US', 'CA', 'GB'], 1876, NOW() - INTERVAL '3 days'),
('First Aid Basics: CPR Demonstration', 'Step-by-step video demonstration of proper CPR technique.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400', '12:15', 'Dr. Emily Brown', ARRAY['first-aid', 'cpr', 'medical', 'training'], ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES'], 5234, NOW() - INTERVAL '7 days'),
('NATO Security Briefing: Monthly Update', 'Monthly security briefing covering current threats and protocols.', 'podcast', 'https://example.com/podcast/nato-briefing', 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400', '32:45', 'NATO Communications', ARRAY['nato', 'security', 'briefing', 'official'], ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL'], 2987, NOW() - INTERVAL '2 days'),
('Water Purification Methods Explained', 'Detailed video showing various water purification techniques.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', '18:30', 'Sarah Johnson', ARRAY['water', 'purification', 'survival', 'tutorial'], ARRAY['US', 'GB', 'CA'], 1654, NOW() - INTERVAL '6 days'),
('Community Preparedness Podcast', 'Discussion on building resilient communities and neighborhood networks.', 'podcast', 'https://example.com/podcast/community', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400', '38:15', 'Community Network', ARRAY['community', 'preparedness', 'podcast'], ARRAY['US', 'GB', 'NL', 'BE'], 892, NOW() - INTERVAL '4 days');

-- Sample Library Items
INSERT INTO library_items (title, author, category, description, file_url, cover_image_url, cover_color, format, pages, country_codes) VALUES
('Emergency Preparedness Handbook', 'NATO Civil Defense', 'Emergency', 'Comprehensive guide to emergency preparedness for civilians.', 'https://example.com/files/emergency-handbook.pdf', 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400', 'bg-red-600', 'PDF', 156, ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES']),
('Wilderness Survival Manual', 'Sarah Johnson', 'Survival', 'Essential wilderness survival techniques and strategies.', 'https://example.com/files/survival-manual.pdf', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', 'bg-green-700', 'PDF', 243, ARRAY['US', 'CA', 'NO', 'SE', 'FI']),
('First Aid Field Guide', 'Dr. Emily Brown', 'Health', 'Quick reference guide for first aid in emergency situations.', 'https://example.com/files/first-aid-guide.pdf', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', 'bg-blue-600', 'PDF', 89, ARRAY['US', 'GB', 'FR', 'DE']),
('NATO Security Protocols 2026', 'NATO Command', 'Directives', 'Official security protocols and guidelines for NATO members.', 'https://example.com/files/nato-protocols.pdf', 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400', 'bg-navy-800', 'PDF', 312, ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL', 'NL', 'BE', 'CZ']),
('Food Storage and Preservation Guide', 'Maria Garcia', 'Supplies', 'Complete guide to long-term food storage and preservation methods.', 'https://example.com/files/food-storage.pdf', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 'bg-orange-600', 'PDF', 127, ARRAY['US', 'GB', 'FR', 'DE', 'IT']),
('Emergency Communication Systems', 'Alex Thompson', 'Resources', 'Guide to alternative communication methods for emergencies.', 'https://example.com/files/communication-systems.pdf', 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=400', 'bg-purple-600', 'PDF', 178, ARRAY['US', 'CA', 'GB', 'DE']);

-- Sample Encyclopaedia Entries
INSERT INTO encyclopaedia_entries (title, letter, content) VALUES
('Alert System', 'A', 'The Alert System is a coordinated network for disseminating emergency information to NATO member populations. It includes multiple channels: broadcast media, mobile alerts, sirens, and digital platforms. The system uses a priority-based approach with color codes: Green (informational), Yellow (advisory), Orange (warning), and Red (critical emergency).'),
('Bunker', 'B', 'A bunker is a reinforced underground structure designed to protect occupants from various threats including conventional weapons, nuclear fallout, and natural disasters. Modern bunkers include air filtration systems, emergency supplies, communication equipment, and can sustain occupants for extended periods.'),
('Civil Defense', 'C', 'Civil Defense encompasses the organization and training of civilians to protect themselves and support emergency services during crises. This includes emergency response teams, evacuation procedures, shelter management, and community coordination protocols established by NATO member governments.'),
('Disaster Preparedness', 'D', 'Disaster Preparedness involves planning, training, and resource allocation to effectively respond to emergencies. Key components include emergency kits, evacuation plans, communication protocols, and regular drills. NATO promotes standardized preparedness guidelines across member nations.'),
('Emergency Kit', 'E', 'An Emergency Kit is a collection of essential supplies prepared in advance for use during emergencies. Standard contents include water (1 gallon per person per day), non-perishable food, first aid supplies, flashlight, radio, batteries, medications, and important documents.'),
('First Aid', 'F', 'First Aid is immediate care provided to injured or ill persons before professional medical help arrives. Basic first aid includes CPR, wound care, treating shock, managing fractures, and responding to common medical emergencies. NATO recommends all civilians receive basic first aid training.');

-- Sample Alerts
INSERT INTO alerts (text, priority, is_active, country_codes) VALUES
('Routine system maintenance scheduled for tonight 2:00-4:00 AM', 'low', true, ARRAY['US', 'GB', 'FR', 'DE']),
('New security protocols in effect as of April 25, 2026', 'medium', true, ARRAY['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL']),
('Severe weather warning: Heavy storms expected in northern regions', 'high', true, ARRAY['NO', 'SE', 'FI', 'IS', 'DK']);

-- Sample Banner
INSERT INTO banner_settings (enabled, text, priority) VALUES
(true, 'Stay informed with the latest updates from Sentinel Network', 'high');

-- ============================================
-- FINAL SUCCESS MESSAGE
-- ============================================

DO $$
DECLARE
  post_count int;
  media_count int;
  library_count int;
  encyc_count int;
  country_count int;
  section_count int;
BEGIN
  SELECT COUNT(*) INTO post_count FROM posts;
  SELECT COUNT(*) INTO media_count FROM media_items;
  SELECT COUNT(*) INTO library_count FROM library_items;
  SELECT COUNT(*) INTO encyc_count FROM encyclopaedia_entries;
  SELECT COUNT(*) INTO country_count FROM countries;
  SELECT COUNT(*) INTO section_count FROM sections;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables Created: ✅';
  RAISE NOTICE 'Indexes Created: ✅';
  RAISE NOTICE 'Functions Created: ✅';
  RAISE NOTICE 'RLS Policies Created: ✅';
  RAISE NOTICE 'Auth Roles Configured: ✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sample Data Loaded:';
  RAISE NOTICE '  Posts: %', post_count;
  RAISE NOTICE '  Media Items: %', media_count;
  RAISE NOTICE '  Library Items: %', library_count;
  RAISE NOTICE '  Encyclopaedia Entries: %', encyc_count;
  RAISE NOTICE '  Countries: %', country_count;
  RAISE NOTICE '  Sections: %', section_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Your Sentinel Network is ready to use!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Sign up a user in your app';
  RAISE NOTICE '2. Run this to make them admin:';
  RAISE NOTICE '   UPDATE profiles SET is_admin = true WHERE email = ''your-email@example.com'';';
  RAISE NOTICE '3. Start building!';
  RAISE NOTICE '========================================';
END $$;
