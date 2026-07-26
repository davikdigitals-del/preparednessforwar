-- ============================================================================
-- FIX VIEWS TRACKING + RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ── 1. RPC function to increment view count (bypasses RLS) ─────────────────
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant anon access so public visitors can increment views
GRANT EXECUTE ON FUNCTION public.increment_post_view(uuid) TO anon, authenticated;

-- ── 2. RPC for media item views ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_media_view(media_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.media_items
  SET views = COALESCE(views, 0) + 1
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_media_view(uuid) TO anon, authenticated;

-- ── 3. Fix posts RLS ────────────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'posts' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.posts', r.policyname); END LOOP;
END $$;

-- Public can read published posts
CREATE POLICY "posts_select_published"
  ON public.posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR is_published = true);

-- Admins can do everything
CREATE POLICY "posts_admin_all"
  ON public.posts FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ── 4. Fix media_items RLS ──────────────────────────────────────────────────
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'media_items' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.media_items', r.policyname); END LOOP;
END $$;

CREATE POLICY "media_select_public"
  ON public.media_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "media_admin_all"
  ON public.media_items FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ── 5. Fix profiles RLS ─────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname); END LOOP;
END $$;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ── 6. Fix notifications RLS ────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', r.policyname); END LOOP;
END $$;

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ── 7. Fix user_roles RLS ───────────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', r.policyname); END LOOP;
END $$;

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ── 8. Verify ───────────────────────────────────────────────────────────────
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name IN ('increment_post_view', 'increment_media_view');

SELECT tablename, count(*) as policy_count
FROM pg_policies WHERE schemaname = 'public'
GROUP BY tablename ORDER BY tablename;
