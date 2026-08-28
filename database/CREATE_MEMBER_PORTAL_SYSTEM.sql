-- ============================================================================
-- MEMBER PORTAL SYSTEM - DATABASE SCHEMA
-- Complete offline-capable member portal with reports, notes, and content management
-- ============================================================================

-- ============================================================================
-- MEMBER REPORTS SYSTEM
-- ============================================================================

-- Member Reports Table
CREATE TABLE IF NOT EXISTS member_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  images TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'draft')),
  rejection_reason TEXT,
  admin_notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  upvotes_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Categories
CREATE TABLE IF NOT EXISTS report_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Comments
CREATE TABLE IF NOT EXISTS report_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES member_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Upvotes
CREATE TABLE IF NOT EXISTS report_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES member_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- ============================================================================
-- OFFLINE CONTENT TRACKING
-- ============================================================================

-- Track what content users have downloaded for offline access
CREATE TABLE IF NOT EXISTS offline_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'video', 'podcast', 'library', 'article')),
  content_id UUID NOT NULL,
  content_title TEXT,
  content_size BIGINT, -- Size in bytes
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- ============================================================================
-- PERSONAL NOTES & BUNKER
-- ============================================================================

-- Member Personal Notes
CREATE TABLE IF NOT EXISTS member_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preparedness Checklists
CREATE TABLE IF NOT EXISTS preparedness_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]', -- Array of {id, text, completed, priority}
  category TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MEMBER ACTIVITY TRACKING
-- ============================================================================

-- Track member activity for analytics
CREATE TABLE IF NOT EXISTS member_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Achievements/Badges
CREATE TABLE IF NOT EXISTS member_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Member Reports Indexes
CREATE INDEX IF NOT EXISTS idx_member_reports_user_id ON member_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_member_reports_status ON member_reports(status);
CREATE INDEX IF NOT EXISTS idx_member_reports_category ON member_reports(category);
CREATE INDEX IF NOT EXISTS idx_member_reports_created_at ON member_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_reports_approved_at ON member_reports(approved_at DESC);

-- Offline Content Indexes
CREATE INDEX IF NOT EXISTS idx_offline_content_user_id ON offline_content(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_content_type ON offline_content(content_type);
CREATE INDEX IF NOT EXISTS idx_offline_content_downloaded_at ON offline_content(downloaded_at DESC);

-- Member Notes Indexes
CREATE INDEX IF NOT EXISTS idx_member_notes_user_id ON member_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_member_notes_category ON member_notes(category);
CREATE INDEX IF NOT EXISTS idx_member_notes_created_at ON member_notes(created_at DESC);

-- Activity Indexes
CREATE INDEX IF NOT EXISTS idx_member_activity_user_id ON member_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_member_activity_type ON member_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_member_activity_created_at ON member_activity(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE member_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparedness_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;

-- Member Reports Policies
CREATE POLICY "Users can view their own reports" ON member_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports" ON member_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending/rejected reports" ON member_reports
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'rejected', 'draft'));

CREATE POLICY "Users can delete their own draft reports" ON member_reports
  FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Admins can delete any reports" ON member_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Public can view approved reports" ON member_reports
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can view all reports" ON member_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all reports" ON member_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Report Categories Policies
CREATE POLICY "Anyone can view active categories" ON report_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON report_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Report Comments Policies
CREATE POLICY "Users can view approved comments" ON report_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON report_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON report_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Report Upvotes Policies
CREATE POLICY "Users can view upvotes" ON report_upvotes
  FOR SELECT USING (true);

CREATE POLICY "Users can upvote reports" ON report_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes" ON report_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Offline Content Policies
CREATE POLICY "Users can manage their offline content" ON offline_content
  FOR ALL USING (auth.uid() = user_id);

-- Member Notes Policies
CREATE POLICY "Users can manage their notes" ON member_notes
  FOR ALL USING (auth.uid() = user_id);

-- Preparedness Checklists Policies
CREATE POLICY "Users can manage their checklists" ON preparedness_checklists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view template checklists" ON preparedness_checklists
  FOR SELECT USING (is_template = true);

-- Emergency Contacts Policies
CREATE POLICY "Users can manage their emergency contacts" ON emergency_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Member Activity Policies
CREATE POLICY "Users can view their activity" ON member_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity" ON member_activity
  FOR INSERT WITH CHECK (true);

-- Member Achievements Policies
CREATE POLICY "Users can view their achievements" ON member_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON member_achievements
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- DEFAULT REPORT CATEGORIES
-- ============================================================================

INSERT INTO report_categories (name, slug, description, icon, display_order) VALUES
  ('Threat Report', 'threat-report', 'Report potential threats or security concerns', '⚠️', 1),
  ('Situation Update', 'situation-update', 'Share updates on current situations', '📍', 2),
  ('Resource Review', 'resource-review', 'Review survival gear and resources', '🎒', 3),
  ('Training Experience', 'training-experience', 'Share your training experiences', '🎓', 4),
  ('Emergency Alert', 'emergency-alert', 'Report emergencies or urgent situations', '🚨', 5),
  ('Community Intel', 'community-intel', 'Share intelligence with the community', '🔍', 6),
  ('Preparedness Tip', 'preparedness-tip', 'Share preparedness tips and advice', '💡', 7),
  ('Field Report', 'field-report', 'Report from the field', '📝', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update report updated_at timestamp
CREATE OR REPLACE FUNCTION update_report_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for member_reports
CREATE TRIGGER update_member_reports_updated_at
  BEFORE UPDATE ON member_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_report_updated_at();

-- Trigger for member_notes
CREATE TRIGGER update_member_notes_updated_at
  BEFORE UPDATE ON member_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_report_updated_at();

-- Function to increment report views
CREATE OR REPLACE FUNCTION increment_report_views(report_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE member_reports 
  SET views_count = views_count + 1 
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update upvotes count
CREATE OR REPLACE FUNCTION update_report_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE member_reports 
    SET upvotes_count = upvotes_count + 1 
    WHERE id = NEW.report_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE member_reports 
    SET upvotes_count = upvotes_count - 1 
    WHERE id = OLD.report_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for upvotes
CREATE TRIGGER update_upvotes_count_trigger
  AFTER INSERT OR DELETE ON report_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION update_report_upvotes_count();

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
