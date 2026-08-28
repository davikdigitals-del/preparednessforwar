
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  country TEXT DEFAULT 'GB',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  standfirst TEXT DEFAULT '',
  section TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  image TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  view_count INT NOT NULL DEFAULT 0,
  read_time TEXT DEFAULT '5 min',
  is_pinned BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft','archived')),
  body TEXT DEFAULT '',
  created_by UUID
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Banner settings table
CREATE TABLE public.banner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT true,
  text TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'high' CHECK (priority IN ('high','medium','low'))
);
ALTER TABLE public.banner_settings ENABLE ROW LEVEL SECURITY;

-- Media items table
CREATE TABLE public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('podcast','video')),
  duration TEXT DEFAULT '',
  views INT DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  thumbnail TEXT DEFAULT '',
  url TEXT DEFAULT '',
  author TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}'
);
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Library items table
CREATE TABLE public.library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  category TEXT DEFAULT '',
  pages INT DEFAULT 0,
  format TEXT DEFAULT 'PDF',
  description TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  cover_color TEXT DEFAULT 'bg-primary'
);
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- Encyclopaedia entries table
CREATE TABLE public.encyclopaedia_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  letter TEXT NOT NULL,
  content TEXT DEFAULT ''
);
ALTER TABLE public.encyclopaedia_entries ENABLE ROW LEVEL SECURITY;

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'system' CHECK (type IN ('post','alert','system'))
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles
CREATE POLICY "Roles viewable by everyone" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert own member role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'member');

-- Posts
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Admins can insert posts" ON public.posts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posts" ON public.posts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posts" ON public.posts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Alerts
CREATE POLICY "Alerts viewable by everyone" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Admins can insert alerts" ON public.alerts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update alerts" ON public.alerts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete alerts" ON public.alerts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Banner
CREATE POLICY "Banner viewable by everyone" ON public.banner_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert banner" ON public.banner_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update banner" ON public.banner_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Media
CREATE POLICY "Media viewable by everyone" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert media" ON public.media_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update media" ON public.media_items FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete media" ON public.media_items FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Library
CREATE POLICY "Library viewable by everyone" ON public.library_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert library" ON public.library_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update library" ON public.library_items FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete library" ON public.library_items FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Encyclopaedia
CREATE POLICY "Encyclopaedia viewable by everyone" ON public.encyclopaedia_entries FOR SELECT USING (true);
CREATE POLICY "Admins can insert encyclopaedia" ON public.encyclopaedia_entries FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update encyclopaedia" ON public.encyclopaedia_entries FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete encyclopaedia" ON public.encyclopaedia_entries FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ===== TRIGGERS =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default banner row
INSERT INTO public.banner_settings (enabled, text, priority)
VALUES (true, 'ALERT: Power disruptions reported across Northern Europe — stay informed', 'high');

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.banner_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
