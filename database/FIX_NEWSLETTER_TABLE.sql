-- ============================================================================
-- FIX NEWSLETTER_SUBSCRIBERS TABLE
-- Run this in Supabase SQL Editor to ensure newsletter subscriptions work
-- ============================================================================

-- Create newsletter_subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  preferences JSONB DEFAULT '{"emergencyNews": true, "survivalGuides": true, "weeklyDigest": true}'::jsonb,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "newsletter_anon_insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_select" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_all" ON public.newsletter_subscribers;

-- Policy: Anyone (including anonymous users) can subscribe
CREATE POLICY "newsletter_anon_insert"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Admins can view all subscribers
CREATE POLICY "newsletter_admin_select"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);

-- Policy: Admins can manage all subscribers
CREATE POLICY "newsletter_admin_all"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email 
ON public.newsletter_subscribers(email);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active 
ON public.newsletter_subscribers(is_active) 
WHERE is_active = true;

-- Verify setup
SELECT 
  'newsletter_subscribers table exists' as status,
  COUNT(*) as subscriber_count
FROM public.newsletter_subscribers;

-- Show RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'newsletter_subscribers'
ORDER BY policyname;

-- ============================================================================
-- DONE! Newsletter subscriptions should now work
-- ============================================================================
