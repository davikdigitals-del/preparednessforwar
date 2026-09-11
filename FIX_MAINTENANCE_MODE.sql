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

-- 2. Clean up any existing rows to avoid conflicts
DELETE FROM maintenance_mode;

-- 3. Insert the fixed maintenance mode row with predictable ID
INSERT INTO maintenance_mode (id, enabled, message, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', false, 'Site is under maintenance. We will be back soon.', now())
ON CONFLICT (id) DO UPDATE SET
  message = EXCLUDED.message,
  updated_at = EXCLUDED.updated_at;

-- 4. Enable RLS
ALTER TABLE public.maintenance_mode ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to recreate them
DROP POLICY IF EXISTS "anyone_can_read_maintenance" ON public.maintenance_mode;
DROP POLICY IF EXISTS "authenticated_can_update_maintenance" ON public.maintenance_mode;

-- 6. Create proper policies
CREATE POLICY "anyone_can_read_maintenance"
ON public.maintenance_mode FOR SELECT
USING (true);

CREATE POLICY "authenticated_can_update_maintenance"
ON public.maintenance_mode FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_maintenance"
ON public.maintenance_mode FOR INSERT
TO authenticated
WITH CHECK (true);

-- 7. Grant necessary permissions
GRANT SELECT ON public.maintenance_mode TO anon;
GRANT SELECT ON public.maintenance_mode TO authenticated;
GRANT UPDATE ON public.maintenance_mode TO authenticated;
GRANT INSERT ON public.maintenance_mode TO authenticated;

-- 8. Verify the setup
DO $$
DECLARE
  row_count INTEGER;
  maintenance_enabled BOOLEAN;
  fixed_id_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO row_count FROM maintenance_mode;
  SELECT enabled INTO maintenance_enabled FROM maintenance_mode WHERE id = '00000000-0000-0000-0000-000000000001';
  SELECT EXISTS(SELECT 1 FROM maintenance_mode WHERE id = '00000000-0000-0000-0000-000000000001') INTO fixed_id_exists;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Maintenance Mode Setup Complete';
  RAISE NOTICE '📊 Rows in maintenance_mode table: %', row_count;
  RAISE NOTICE '🆔 Fixed ID row exists: %', fixed_id_exists;
  RAISE NOTICE '🔧 Maintenance mode currently: %', 
    CASE WHEN maintenance_enabled THEN 'ENABLED (Site offline)' ELSE 'DISABLED (Site online)' END;
  RAISE NOTICE '============================================';
  
  IF row_count = 0 THEN
    RAISE WARNING '❌ No rows found in maintenance_mode table! This should not happen.';
  END IF;
  
  IF NOT fixed_id_exists THEN
    RAISE WARNING '❌ Fixed ID row not found! Maintenance mode may not work correctly.';
  END IF;
END $$;