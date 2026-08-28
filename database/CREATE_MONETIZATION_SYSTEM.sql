-- ============================================================================
-- PREPAREDNESS FOR WAR - COMPLETE MONETIZATION SYSTEM
-- ============================================================================
-- This creates:
-- 1. Courses & Training System
-- 2. Affiliate Links System
-- 3. Sponsorship & Ads System
-- 4. Revenue Tracking
-- ============================================================================

-- ============================================================================
-- 1. COURSES SYSTEM
-- ============================================================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  instructor_image_url TEXT,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_free BOOLEAN DEFAULT false,
  
  -- Course details
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
  duration_hours INTEGER,
  language TEXT DEFAULT 'en',
  
  -- Content
  what_you_learn TEXT[], -- Array of learning outcomes
  requirements TEXT[], -- Prerequisites
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Enrollment
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Geographic targeting
  country_codes TEXT[], -- Available in these countries
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Course modules (sections)
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Content
  content_type TEXT CHECK (content_type IN ('video', 'text', 'quiz', 'assignment', 'download')),
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  text_content TEXT,
  downloadable_resources JSONB, -- [{name, url, size}]
  
  -- Settings
  is_preview BOOLEAN DEFAULT false, -- Free preview
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  payment_amount DECIMAL(10,2),
  payment_currency TEXT,
  stripe_payment_id TEXT,
  
  -- Progress
  progress_percentage INTEGER DEFAULT 0,
  completed_lessons UUID[],
  last_accessed_lesson_id UUID,
  
  -- Completion
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  
  -- Timestamps
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For time-limited access
  
  UNIQUE(course_id, user_id)
);

-- Course reviews
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, user_id)
);

-- Course quizzes
CREATE TABLE IF NOT EXISTS course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70, -- Percentage
  questions JSONB NOT NULL, -- [{question, options: [], correct_answer, explanation}]
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES course_quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  
  answers JSONB, -- User's answers
  score INTEGER, -- Percentage
  passed BOOLEAN,
  
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. AFFILIATE LINKS SYSTEM
-- ============================================================================

-- Affiliate products
CREATE TABLE IF NOT EXISTS affiliate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'survival-gear', 'food-supplies', 'medical', 'bunker', etc.
  image_url TEXT,
  
  -- Affiliate details
  affiliate_url TEXT NOT NULL,
  affiliate_network TEXT, -- 'amazon', 'shareasale', 'cj', 'custom'
  commission_rate DECIMAL(5,2), -- Percentage
  
  -- Pricing
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Geographic targeting
  country_codes TEXT[],
  
  -- Stats
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate clicks tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country_code TEXT,
  
  -- Conversion
  converted BOOLEAN DEFAULT false,
  conversion_amount DECIMAL(10,2),
  converted_at TIMESTAMPTZ,
  
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. SPONSORSHIP & ADS SYSTEM
-- ============================================================================

-- Ad spaces (where ads can be placed)
CREATE TABLE IF NOT EXISTS ad_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL, -- 'header', 'sidebar', 'article-top', 'article-bottom', 'between-posts'
  dimensions TEXT, -- '728x90', '300x250', etc.
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsors
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company info
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  logo_url TEXT,
  
  -- Contract
  contract_start_date DATE,
  contract_end_date DATE,
  monthly_fee DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Geographic targeting
  target_countries TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advertisements
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
  ad_space_id UUID REFERENCES ad_spaces(id) ON DELETE CASCADE,
  
  -- Ad content
  title TEXT,
  image_url TEXT,
  destination_url TEXT NOT NULL,
  html_content TEXT, -- For custom HTML ads
  
  -- Scheduling
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Targeting
  target_countries TEXT[],
  target_sections TEXT[], -- Show only in specific sections
  
  -- Priority
  priority INTEGER DEFAULT 0, -- Higher = shown first
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  country_code TEXT,
  
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad clicks tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES advertisements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country_code TEXT,
  
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsored posts
CREATE TABLE IF NOT EXISTS sponsored_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
  
  -- Sponsorship details
  sponsorship_fee DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Display
  sponsor_label TEXT DEFAULT 'Sponsored Content',
  sponsor_disclosure TEXT,
  
  -- Scheduling
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. REVENUE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction type
  transaction_type TEXT CHECK (transaction_type IN ('course_sale', 'subscription', 'affiliate_commission', 'sponsorship', 'advertisement')),
  
  -- Related records
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE SET NULL,
  affiliate_product_id UUID REFERENCES affiliate_products(id) ON DELETE SET NULL,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  ad_id UUID REFERENCES advertisements(id) ON DELETE SET NULL,
  
  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Payment details
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer'
  payment_reference TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  
  -- Geographic
  country_code TEXT,
  
  -- Timestamps
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);

-- Affiliate
CREATE INDEX IF NOT EXISTS idx_affiliate_products_active ON affiliate_products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id, clicked_at DESC);

-- Ads
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active, start_date, end_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad ON ad_impressions(ad_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad ON ad_clicks(ad_id, clicked_at DESC);

-- Revenue
CREATE INDEX IF NOT EXISTS idx_revenue_type_date ON revenue_transactions(transaction_type, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_status ON revenue_transactions(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Public can view published courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

-- Public can view course modules/lessons for published courses
CREATE POLICY "Anyone can view published course content"
  ON course_modules FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can view published lessons"
  ON course_lessons FOR SELECT
  USING (is_published = true);

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create enrollments
CREATE POLICY "Users can enroll in courses"
  ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view active affiliate products
CREATE POLICY "Anyone can view active affiliate products"
  ON affiliate_products FOR SELECT
  USING (is_active = true);

-- Public can view active ads
CREATE POLICY "Anyone can view active ads"
  ON advertisements FOR SELECT
  USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update course rating when review is added
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET 
    rating = (SELECT AVG(rating) FROM course_reviews WHERE course_id = NEW.course_id AND is_published = true),
    review_count = (SELECT COUNT(*) FROM course_reviews WHERE course_id = NEW.course_id AND is_published = true)
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_rating
AFTER INSERT OR UPDATE ON course_reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_rating();

-- Update enrollment count
CREATE OR REPLACE FUNCTION update_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET enrollment_count = (SELECT COUNT(*) FROM course_enrollments WHERE course_id = NEW.course_id)
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_count
AFTER INSERT ON course_enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_count();

-- Update affiliate click count
CREATE OR REPLACE FUNCTION update_affiliate_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE affiliate_products
  SET click_count = click_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_clicks
AFTER INSERT ON affiliate_clicks
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_clicks();

-- Update ad impression count
CREATE OR REPLACE FUNCTION update_ad_impressions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE advertisements
  SET impression_count = impression_count + 1
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ad_impressions
AFTER INSERT ON ad_impressions
FOR EACH ROW
EXECUTE FUNCTION update_ad_impressions();

-- Update ad click count
CREATE OR REPLACE FUNCTION update_ad_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE advertisements
  SET click_count = click_count + 1
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ad_clicks
AFTER INSERT ON ad_clicks
FOR EACH ROW
EXECUTE FUNCTION update_ad_clicks();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert default ad spaces
INSERT INTO ad_spaces (name, slug, location, dimensions, description) VALUES
  ('Header Banner', 'header-banner', 'header', '728x90', 'Leaderboard banner at the top of every page'),
  ('Sidebar Top', 'sidebar-top', 'sidebar', '300x250', 'Medium rectangle at the top of sidebar'),
  ('Sidebar Bottom', 'sidebar-bottom', 'sidebar', '300x600', 'Half-page ad at bottom of sidebar'),
  ('Article Top', 'article-top', 'article-top', '728x90', 'Banner above article content'),
  ('Article Bottom', 'article-bottom', 'article-bottom', '728x90', 'Banner below article content'),
  ('Between Posts', 'between-posts', 'between-posts', '300x250', 'Medium rectangle between post listings')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ MONETIZATION SYSTEM CREATED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE '📚 COURSES SYSTEM:';
  RAISE NOTICE '   - courses (main course info)';
  RAISE NOTICE '   - course_modules (course sections)';
  RAISE NOTICE '   - course_lessons (video/text lessons)';
  RAISE NOTICE '   - course_enrollments (student enrollments)';
  RAISE NOTICE '   - course_reviews (ratings & reviews)';
  RAISE NOTICE '   - course_quizzes (assessments)';
  RAISE NOTICE '   - quiz_attempts (student quiz results)';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 AFFILIATE SYSTEM:';
  RAISE NOTICE '   - affiliate_products (products to promote)';
  RAISE NOTICE '   - affiliate_clicks (click tracking)';
  RAISE NOTICE '';
  RAISE NOTICE '📢 ADVERTISING SYSTEM:';
  RAISE NOTICE '   - ad_spaces (ad placement locations)';
  RAISE NOTICE '   - sponsors (sponsor companies)';
  RAISE NOTICE '   - advertisements (active ads)';
  RAISE NOTICE '   - ad_impressions (view tracking)';
  RAISE NOTICE '   - ad_clicks (click tracking)';
  RAISE NOTICE '   - sponsored_posts (sponsored content)';
  RAISE NOTICE '';
  RAISE NOTICE '💰 REVENUE TRACKING:';
  RAISE NOTICE '   - revenue_transactions (all revenue sources)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run this SQL in Supabase SQL Editor';
  RAISE NOTICE '';
END $$;
