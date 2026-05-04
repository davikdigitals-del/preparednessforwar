-- ============================================
-- REPORTS & MODERATION SETUP
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text NOT NULL CHECK (type IN ('post', 'comment', 'user', 'other')),
  reason            text NOT NULL,
  description       text NOT NULL,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  priority          text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reported_by       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_item_id  uuid,
  reported_item_type text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  resolved_at       timestamptz,
  resolved_by       uuid REFERENCES auth.users(id),
  resolution_notes  text
);

-- 2. Create comments table (if not exists)
CREATE TABLE IF NOT EXISTS public.comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content     text NOT NULL,
  is_approved boolean DEFAULT false,
  is_flagged  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- 3. Create user_bans table
CREATE TABLE IF NOT EXISTS public.user_bans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by   uuid NOT NULL REFERENCES auth.users(id),
  reason      text NOT NULL,
  expires_at  timestamptz,
  is_permanent boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. Create moderation_log table
CREATE TABLE IF NOT EXISTS public.moderation_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action      text NOT NULL,
  target_type text NOT NULL,
  target_id   uuid NOT NULL,
  moderator_id uuid NOT NULL REFERENCES auth.users(id),
  reason      text,
  details     jsonb,
  created_at  timestamptz DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

-- 6. Reports policies
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reported_by);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete reports"
  ON public.reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Comments policies
CREATE POLICY "Anyone can view approved comments"
  ON public.comments FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 8. User bans policies
CREATE POLICY "Admins can view bans"
  ON public.user_bans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage bans"
  ON public.user_bans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Moderation log policies
CREATE POLICY "Admins can view moderation log"
  ON public.moderation_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create log entries"
  ON public.moderation_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 10. Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON public.reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON public.comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_is_flagged ON public.comments(is_flagged);

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_expires_at ON public.user_bans(expires_at);

CREATE INDEX IF NOT EXISTS idx_moderation_log_target ON public.moderation_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_moderator ON public.moderation_log(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_created_at ON public.moderation_log(created_at DESC);

-- 11. Create functions

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_bans
    WHERE user_id = user_uuid
      AND (is_permanent = true OR expires_at > now())
  );
$$;

-- Function to log moderation action
CREATE OR REPLACE FUNCTION public.log_moderation_action(
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_reason text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.moderation_log (
    action,
    target_type,
    target_id,
    moderator_id,
    reason,
    details
  ) VALUES (
    p_action,
    p_target_type,
    p_target_id,
    auth.uid(),
    p_reason,
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to auto-flag content with multiple reports
CREATE OR REPLACE FUNCTION public.check_report_threshold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report_count integer;
BEGIN
  -- Count reports for this item
  SELECT COUNT(*) INTO v_report_count
  FROM public.reports
  WHERE reported_item_id = NEW.reported_item_id
    AND reported_item_type = NEW.reported_item_type
    AND status IN ('pending', 'reviewing');
  
  -- If 3+ reports, auto-escalate to high priority
  IF v_report_count >= 3 THEN
    UPDATE public.reports
    SET priority = 'high'
    WHERE reported_item_id = NEW.reported_item_id
      AND reported_item_type = NEW.reported_item_type
      AND priority != 'critical';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 12. Ensure update_updated_at_column exists (safe to run even if already defined)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 13. Create triggers
DROP TRIGGER IF EXISTS trigger_check_report_threshold ON public.reports;
CREATE TRIGGER trigger_check_report_threshold
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.check_report_threshold();

-- Update updated_at on reports
DROP TRIGGER IF EXISTS trigger_reports_updated_at ON public.reports;
CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at on comments
DROP TRIGGER IF EXISTS trigger_comments_updated_at ON public.comments;
CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- DONE. Reports and moderation system ready.
-- ============================================

-- Sample report (optional - for testing)
/*
INSERT INTO public.reports (
  type,
  reason,
  description,
  priority,
  reported_by,
  reported_item_id,
  reported_item_type
) VALUES (
  'post',
  'Inappropriate Content',
  'This post contains misleading information.',
  'high',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.posts LIMIT 1),
  'post'
);
*/
