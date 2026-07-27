-- ============================================================================
-- FIX ALL ADMIN RLS POLICIES
-- Covers every table used in admin pages
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Helper: admin check
-- EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)

-- ── POSTS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='posts' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.posts',r.policyname); END LOOP; END $$;
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT TO anon, authenticated USING (status='published' OR is_published=true);
CREATE POLICY "posts_admin_read" ON public.posts FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "posts_admin_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "posts_admin_update" ON public.posts FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "posts_admin_delete" ON public.posts FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── MEDIA ITEMS ───────────────────────────────────────────────────────────────
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='media_items' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.media_items',r.policyname); END LOOP; END $$;
CREATE POLICY "media_public_read" ON public.media_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "media_admin_insert" ON public.media_items FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "media_admin_update" ON public.media_items FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "media_admin_delete" ON public.media_items FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── ALERTS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='alerts' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.alerts',r.policyname); END LOOP; END $$;
CREATE POLICY "alerts_public_read" ON public.alerts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "alerts_admin_insert" ON public.alerts FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "alerts_admin_update" ON public.alerts FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "alerts_admin_delete" ON public.alerts FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── LIBRARY ITEMS ─────────────────────────────────────────────────────────────
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='library_items' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.library_items',r.policyname); END LOOP; END $$;
CREATE POLICY "library_public_read" ON public.library_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "library_admin_insert" ON public.library_items FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "library_admin_update" ON public.library_items FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "library_admin_delete" ON public.library_items FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── COURSES ───────────────────────────────────────────────────────────────────
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='courses' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.courses',r.policyname); END LOOP; END $$;
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "courses_admin_insert" ON public.courses FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "courses_admin_update" ON public.courses FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "courses_admin_delete" ON public.courses FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── COUNTRIES ─────────────────────────────────────────────────────────────────
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='countries' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.countries',r.policyname); END LOOP; END $$;
CREATE POLICY "countries_public_read" ON public.countries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "countries_admin_insert" ON public.countries FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "countries_admin_update" ON public.countries FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "countries_admin_delete" ON public.countries FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── ENCYCLOPAEDIA ENTRIES ─────────────────────────────────────────────────────
ALTER TABLE public.encyclopaedia_entries ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='encyclopaedia_entries' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.encyclopaedia_entries',r.policyname); END LOOP; END $$;
CREATE POLICY "enc_public_read" ON public.encyclopaedia_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "enc_admin_insert" ON public.encyclopaedia_entries FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "enc_admin_update" ON public.encyclopaedia_entries FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "enc_admin_delete" ON public.encyclopaedia_entries FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── PROFILES ──────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='profiles' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles',r.policyname); END LOOP; END $$;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid()=id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid()=id OR EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (auth.uid()=id OR EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='notifications' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications',r.policyname); END LOOP; END $$;
CREATE POLICY "notif_read" ON public.notifications FOR SELECT TO authenticated USING (user_id=auth.uid() OR user_id IS NULL);
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id=auth.uid() OR user_id IS NULL);
CREATE POLICY "notif_admin_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));
CREATE POLICY "notif_admin_delete" ON public.notifications FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── USER ROLES ────────────────────────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='user_roles' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles',r.policyname); END LOOP; END $$;
CREATE POLICY "roles_read" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── NAV SECTIONS & CATEGORIES ─────────────────────────────────────────────────
ALTER TABLE public.nav_sections ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='nav_sections' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.nav_sections',r.policyname); END LOOP; END $$;
CREATE POLICY "nav_sections_read" ON public.nav_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "nav_sections_admin" ON public.nav_sections FOR ALL TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

ALTER TABLE public.nav_categories ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='nav_categories' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.nav_categories',r.policyname); END LOOP; END $$;
CREATE POLICY "nav_categories_read" ON public.nav_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "nav_categories_admin" ON public.nav_categories FOR ALL TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── BANNER SETTINGS ───────────────────────────────────────────────────────────
ALTER TABLE public.banner_settings ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='banner_settings' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.banner_settings',r.policyname); END LOOP; END $$;
CREATE POLICY "banner_public_read" ON public.banner_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "banner_admin" ON public.banner_settings FOR ALL TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── SUBSCRIPTION PLANS ────────────────────────────────────────────────────────
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename='subscription_plans' AND schemaname='public' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscription_plans',r.policyname); END LOOP; END $$;
CREATE POLICY "plans_public_read" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "plans_admin" ON public.subscription_plans FOR ALL TO authenticated USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true)) WITH CHECK (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

-- ── VIEW COUNT RPC FUNCTIONS ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id uuid)
RETURNS void AS $$ BEGIN UPDATE public.posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = post_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.increment_post_view(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_media_view(media_id uuid)
RETURNS void AS $$ BEGIN UPDATE public.media_items SET views = COALESCE(views, 0) + 1 WHERE id = media_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.increment_media_view(uuid) TO anon, authenticated;

-- ── VERIFY ────────────────────────────────────────────────────────────────────
SELECT tablename, count(*) as policies
FROM pg_policies WHERE schemaname='public'
GROUP BY tablename ORDER BY tablename;
