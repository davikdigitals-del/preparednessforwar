-- ============================================
-- COMPLETE DATABASE SETUP - SINGLE FILE
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This combines schema + sample data in one file
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean start)
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_revisions CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
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
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS newsletter_campaigns CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS search_queries CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE TABLE profiles (
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

CREATE TABLE user_preferences (
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

CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'bookmark', 'share', 'comment', 'like')),
  post_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SECTIONS & CATEGORIES
-- ============================================

CREATE TABLE sections (
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

CREATE TABLE categories (
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

-- ============================================
-- 3. POSTS & CONTENT
-- ============================================

CREATE TABLE posts (
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
  seo_keywords TEXT[]
);

CREATE TABLE post_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  edited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'insightful', 'helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ============================================
-- 4. MEDIA & FILES
-- ============================================

CREATE TABLE media_items (
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

CREATE TABLE library_items (
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

CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  bucket TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ENCYCLOPAEDIA
-- ============================================

CREATE TABLE encyclopaedia_entries (
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

-- ============================================
-- 6. ALERTS & NOTIFICATIONS
-- ============================================

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT TRUE,
  country_codes TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. BANNER & PAGES
-- ============================================

CREATE TABLE banner_settings (
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

CREATE TABLE pages (
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

-- ============================================
-- 8. NEWSLETTER
-- ============================================

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE newsletter_campaigns (
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

-- ============================================
-- 9. ANALYTICS
-- ============================================

CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. COUNTRIES
-- ============================================

CREATE TABLE countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT,
  is_nato BOOLEAN DEFAULT FALSE,
  region TEXT,
  timezone TEXT
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  interval TEXT NOT NULL DEFAULT 'month',
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_section ON posts(section);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned);
CREATE INDEX idx_posts_country_codes ON posts USING GIN(country_codes);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_media_items_type ON media_items(type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_alerts_is_active ON alerts(is_active);

-- ============================================
-- INSERT SAMPLE DATA
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
  ('community', 'Community', 'Community updates and news', 8);

-- Insert countries
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
  ('SE', 'Sweden', '🇸🇪', true);

-- Insert sample posts
INSERT INTO posts (title, standfirst, body, section, category, author, image, tags, country_codes, status, is_pinned, view_count, read_time, published_at) VALUES
('Emergency Preparedness: Essential Guide', 'A comprehensive guide to emergency preparedness.', 'In times of crisis, being prepared can make all the difference...', 'emergency', 'alerts', 'John Smith', 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800', ARRAY['emergency', 'preparedness'], ARRAY['US', 'GB', 'FR'], 'published', true, 1247, '8 min', NOW()),
('Survival Skills: Wilderness Navigation', 'Learn essential wilderness navigation techniques.', 'Wilderness navigation is a critical survival skill...', 'survival', 'wilderness', 'Sarah Johnson', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', ARRAY['survival', 'navigation'], ARRAY['US', 'CA'], 'published', false, 892, '12 min', NOW()),
('First Aid Essentials', 'Critical first aid knowledge that could save lives.', 'First aid knowledge is invaluable in emergencies...', 'health', 'first-aid', 'Dr. Emily Brown', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800', ARRAY['health', 'first-aid'], ARRAY['US', 'GB'], 'published', true, 2156, '15 min', NOW());

-- Insert sample media
INSERT INTO media_items (title, description, type, url, thumbnail, duration, author, tags, views) VALUES
('Emergency Response Training', 'Comprehensive video guide on emergency response.', 'video', 'https://www.youtube.com/watch?v=example', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400', '24:35', 'Training Dept', ARRAY['training', 'emergency'], 3421),
('Survival Skills Podcast', 'Interview with wilderness survival expert.', 'podcast', 'https://example.com/podcast', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc478?w=400', '45:20', 'Podcast Network', ARRAY['podcast', 'survival'], 1876);

-- Insert sample library items
INSERT INTO library_items (title, author, category, description, file_url, cover_color, format, pages) VALUES
('Emergency Preparedness Handbook', 'NATO Civil Defense', 'Emergency', 'Comprehensive guide to emergency preparedness.', 'https://example.com/handbook.pdf', 'bg-red-600', 'PDF', 156),
('Wilderness Survival Manual', 'Sarah Johnson', 'Survival', 'Essential wilderness survival techniques.', 'https://example.com/survival.pdf', 'bg-green-700', 'PDF', 243);

-- Insert sample encyclopaedia entries
INSERT INTO encyclopaedia_entries (title, letter, content) VALUES
('Alert System', 'A', 'The Alert System is a coordinated network for disseminating emergency information...'),
('Bunker', 'B', 'A bunker is a reinforced underground structure designed to protect occupants...'),
('Civil Defense', 'C', 'Civil Defense encompasses the organization and training of civilians...');

-- Insert sample alerts
INSERT INTO alerts (text, priority, is_active) VALUES
('System maintenance scheduled tonight', 'low', true),
('New security protocols in effect', 'medium', true),
('Severe weather warning', 'high', true);

-- Insert banner
INSERT INTO banner_settings (enabled, text, priority) VALUES
(true, 'Stay informed with the latest updates', 'high');

-- Insert subscription plans
INSERT INTO subscription_plans (name, slug, price, currency, interval, features, is_active) VALUES
('Free', 'free', 0, 'GBP', 'month', ARRAY['Access to all free articles', 'Just In feed', 'Emergency alerts', 'Basic library access'], true),
('Premium Monthly', 'premium-monthly', 9.99, 'GBP', 'month', ARRAY['All free features', 'Premium articles & guides', 'Exclusive videos & podcasts', 'Full library access', 'Country-specific content', 'No ads'], true),
('Premium Annual', 'premium-annual', 89.99, 'GBP', 'year', ARRAY['All Premium Monthly features', '2 months free', 'Priority support', 'Early access to new content'], true);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All tables created and sample data loaded!';
  RAISE NOTICE 'Your application is ready to use.';
  RAISE NOTICE '========================================';
END $$;
