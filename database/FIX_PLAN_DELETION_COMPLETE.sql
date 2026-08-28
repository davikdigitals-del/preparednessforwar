-- ============================================
-- COMPLETE FIX: Allow deletion of subscription plans
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Step 1: Check current constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'user_subscriptions' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'plan_id';

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- Step 3: Recreate with ON DELETE CASCADE
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_id_fkey
  FOREIGN KEY (plan_id)
  REFERENCES public.subscription_plans(id)
  ON DELETE CASCADE;

-- Step 4: Drop existing RLS policies for subscription_plans
DROP POLICY IF EXISTS "Anyone can read plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "plans_select" ON public.subscription_plans;
DROP POLICY IF EXISTS "plans_insert_admin" ON public.subscription_plans;
DROP POLICY IF EXISTS "plans_update_admin" ON public.subscription_plans;
DROP POLICY IF EXISTS "plans_delete_admin" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;

-- Step 5: Create comprehensive RLS policies
-- Allow everyone to read plans
CREATE POLICY "plans_public_read"
  ON public.subscription_plans
  FOR SELECT
  USING (true);

-- Allow admins to insert plans
CREATE POLICY "plans_admin_insert"
  ON public.subscription_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update plans
CREATE POLICY "plans_admin_update"
  ON public.subscription_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete plans
CREATE POLICY "plans_admin_delete"
  ON public.subscription_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Step 6: Verify the fix
SELECT 
    'Foreign Key Constraint' as check_type,
    tc.constraint_name, 
    rc.delete_rule as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'user_subscriptions' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%plan_id%'

UNION ALL

SELECT 
    'RLS Policies' as check_type,
    policyname as constraint_name,
    cmd as status
FROM pg_policies 
WHERE tablename = 'subscription_plans'
ORDER BY check_type, constraint_name;

-- ============================================
-- DONE! You should now be able to delete plans
-- ============================================
