-- ============================================
-- SIMPLE FIX: Just fix the foreign key constraint
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- Step 2: Recreate with ON DELETE CASCADE
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_id_fkey
  FOREIGN KEY (plan_id)
  REFERENCES public.subscription_plans(id)
  ON DELETE CASCADE;

-- Step 3: Verify it worked
SELECT 
    tc.constraint_name, 
    rc.delete_rule as current_rule,
    CASE 
      WHEN rc.delete_rule = 'CASCADE' THEN '✓ FIXED - Can now delete plans'
      ELSE '✗ STILL BROKEN - delete_rule is: ' || rc.delete_rule
    END as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'user_subscriptions' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%plan_id%';

-- ============================================
-- DONE! Try deleting a plan now
-- ============================================
