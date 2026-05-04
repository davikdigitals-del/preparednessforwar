-- Country targeting and richer content metadata
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS country_codes text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.media_items
  ADD COLUMN IF NOT EXISTS country_codes text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.library_items
  ADD COLUMN IF NOT EXISTS country_codes text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS cover_image_url text NOT NULL DEFAULT ''::text;

-- Secure admin bootstrap: allow first admin self-promotion, then only admins can promote themselves
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_assign boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  can_assign := public.has_role(auth.uid(), 'admin')
    OR NOT EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE role = 'admin'
    );

  IF NOT can_assign THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_admin_role() TO authenticated;

-- Storage bucket for post/library/media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-files', 'content-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for content-files bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view content-files'
  ) THEN
    CREATE POLICY "Public can view content-files"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'content-files');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload content-files'
  ) THEN
    CREATE POLICY "Admins can upload content-files"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update content-files'
  ) THEN
    CREATE POLICY "Admins can update content-files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete content-files'
  ) THEN
    CREATE POLICY "Admins can delete content-files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;