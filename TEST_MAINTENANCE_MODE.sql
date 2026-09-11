-- ============================================================================
-- TEST MAINTENANCE MODE FUNCTIONALITY
-- ============================================================================
-- Run this script to test if maintenance mode is working correctly

-- 1. Check current state
SELECT 'Current maintenance mode state:' as test_step;
SELECT 
  id, 
  enabled, 
  message, 
  estimated_back, 
  updated_at 
FROM maintenance_mode 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 2. Test enabling maintenance mode
SELECT 'Testing ENABLE maintenance mode:' as test_step;
UPDATE maintenance_mode 
SET 
  enabled = true, 
  message = 'Site is temporarily offline for maintenance. We will be back shortly.',
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify the change
SELECT 
  'After ENABLE - enabled: ' || enabled || ', message: ' || message as result
FROM maintenance_mode 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 3. Test disabling maintenance mode
SELECT 'Testing DISABLE maintenance mode:' as test_step;
UPDATE maintenance_mode 
SET 
  enabled = false, 
  message = 'Site is under maintenance. We will be back soon.',
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify the change
SELECT 
  'After DISABLE - enabled: ' || enabled || ', message: ' || message as result
FROM maintenance_mode 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Test upsert functionality (simulating the app's behavior)
SELECT 'Testing UPSERT functionality:' as test_step;
INSERT INTO maintenance_mode (
  id, 
  enabled, 
  message, 
  estimated_back, 
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', 
  true, 
  'Testing upsert - maintenance mode active', 
  '2 hours', 
  now()
)
ON CONFLICT (id) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  message = EXCLUDED.message,
  estimated_back = EXCLUDED.estimated_back,
  updated_at = EXCLUDED.updated_at;

-- Verify upsert worked
SELECT 
  'After UPSERT - enabled: ' || enabled || ', message: ' || message || ', estimated_back: ' || COALESCE(estimated_back, 'null') as result
FROM maintenance_mode 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 5. Reset to disabled state
SELECT 'Resetting to DISABLED state:' as test_step;
UPDATE maintenance_mode 
SET 
  enabled = false, 
  message = 'Site is under maintenance. We will be back soon.',
  estimated_back = null,
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Final verification
SELECT 
  'FINAL STATE - enabled: ' || enabled || ', ready for use' as result
FROM maintenance_mode 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 6. Permission test
SELECT 'Testing permissions:' as test_step;
SELECT 
  CASE 
    WHEN has_table_privilege('maintenance_mode', 'SELECT') THEN '✅ SELECT allowed'
    ELSE '❌ SELECT denied'
  END as select_permission,
  CASE 
    WHEN has_table_privilege('maintenance_mode', 'UPDATE') THEN '✅ UPDATE allowed'
    ELSE '❌ UPDATE denied'
  END as update_permission;

RAISE NOTICE '============================================';
RAISE NOTICE '✅ Maintenance mode tests completed';
RAISE NOTICE '📝 Check the results above to verify functionality';
RAISE NOTICE '🔧 If all tests show expected results, maintenance mode should work correctly';
RAISE NOTICE '============================================';