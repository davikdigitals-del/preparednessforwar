-- ============================================================================
-- FIX MAINTENANCE MODE ISSUES
-- ============================================================================
-- This script fixes common maintenance mode problems

-- 1. Ensure the maintenance_mode table exists with correct structure
CREATE TABLE IF NOT EXISTS public.maintenance_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT false,
  message TEXT DEFAULT 'Site is under maintenance. We will be back soon.',
  estimated_back TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ensure there's at least one row (required for .single() queries)
INSERT INTO maintenance_mode (enabled, message)
VALUES (false, 'Site is under maintenance. We will be back soon.')
ON CONFLICT (id) DO NOTHING;

-- 3. If no rows exist due to missing conflict resolution, force insert one
INSERT INTO maintenance_mode (enabled, message)
SELECT false, 'Site is under maintenance. We will be back soon.'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_mode)
LIMIT 1;

-- 4. Clean up any duplicate rows (keep only the first one)
DELETE FROM maintenance_mode 
WHERE id NOT IN (
  SELECT id 
  FROM maintenance_mode 
  ORDER BY updated_at DESC 
  LIMIT 1
);

-- 5. Enable RLS
ALTER TABLE public.maintenance_mode ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies to recreate them
DROP POLICY IF EXISTS "anyone_can_read_maintenance" ON public.maintenance_mode;
DROP POLICY IF EXISTS "authenticated_can_update_maintenance" ON public.maintenance_mode;

-- 7. Create proper policies
CREATE POLICY "anyone_can_read_maintenance"
ON public.maintenance_mode FOR SELECT
USING (true);

CREATE POLICY "authenticated_can_update_maintenance"
ON public.maintenance_mode FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Grant necessary permissions
GRANT SELECT ON public.maintenance_mode TO anon;
GRANT SELECT ON public.maintenance_mode TO authenticated;
GRANT UPDATE ON public.maintenance_mode TO authenticated;

-- 9. Verify the setup
DO $$
DECLARE
  row_count INTEGER;
  maintenance_enabled BOOLEAN;
BEGIN
  SELECT COUNT(*), COALESCE(bool_or(enabled), false) 
  INTO row_count, maintenance_enabled
  FROM maintenance_mode;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Maintenance Mode Setup Complete';
  RAISE NOTICE '📊 Rows in maintenance_mode table: %', row_count;
  RAISE NOTICE '🔧 Maintenance mode currently: %', 
    CASE WHEN maintenance_enabled THEN 'ENABLED (Site offline)' ELSE 'DISABLED (Site online)' END;
  RAISE NOTICE '============================================';
  
  IF row_count = 0 THEN
    RAISE WARNING '❌ No rows found in maintenance_mode table! This will cause .single() queries to fail.';
  END IF;
END $$;