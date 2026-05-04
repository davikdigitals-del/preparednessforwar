-- ============================================
-- ROLES & AUTH SETUP — NUCLEAR CLEAN VERSION
-- Drops everything first, rebuilds from scratch
-- ============================================

-- Step 1: Drop ALL existing triggers that touch auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_new_user ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Step 2: Drop ALL existing functions that might conflict
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.assign_admin_role() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;

-- Step 3: Drop tables (CASCADE removes dependent policies/constraints)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 4: Drop and recreate the enum
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Step 5: Create profiles table
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL DEFAULT '',
  name       text NOT NULL DEFAULT '',
  country    text DEFAULT 'GB',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 6: Create user_roles table
CREATE TABLE public.user_roles (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);

-- Step 7: Enable RLS
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 8: Profiles policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow service role full access (needed for triggers)
CREATE POLICY "profiles_service_all"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 9: user_roles policies
CREATE POLICY "roles_select_own"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "roles_insert_own"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role full access (needed for triggers)
CREATE POLICY "roles_service_all"
  ON public.user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 10: has_role() helper function
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role    public.app_role
) RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Step 11: assign_admin_role() — call this after signing in to become admin
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to call this function';
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (user_id, email, name)
  SELECT v_uid, email, COALESCE(raw_user_meta_data->>'name', split_part(email,'@',1))
  FROM auth.users WHERE id = v_uid
  ON CONFLICT (user_id) DO NOTHING;

  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'admin')
  ON CONFLICT DO NOTHING;

  -- Also ensure member role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'member')
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

-- Step 12: Auto-create profile + member role on every new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email,'unknown'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'country', 'GB')
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Step 13: Attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SUCCESS! Tables, policies, and functions created.
--
-- TO MAKE YOURSELF ADMIN:
-- 1. Sign in to the site at http://localhost:8080
-- 2. Come back here and run:
--
--    SELECT public.assign_admin_role();
--
-- ============================================
