-- ============================================================================
-- CREATE MAINTENANCE MODE TABLE
-- ============================================================================

-- Create table
CREATE TABLE IF NOT EXISTS public.maintenance_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT false,
  message TEXT DEFAULT 'Site is under maintenance. We will be back soon.',
  estimated_back TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default row
INSERT INTO maintenance_mode (enabled, message)
VALUES (false, 'Site is under maintenance. We will be back soon.')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.maintenance_mode ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "anyone_can_read_maintenance"
ON public.maintenance_mode FOR SELECT
USING (true);

CREATE POLICY "authenticated_can_update_maintenance"
ON public.maintenance_mode FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ Maintenance mode table created successfully';
  RAISE NOTICE 'Maintenance mode is currently DISABLED';
END $$;
