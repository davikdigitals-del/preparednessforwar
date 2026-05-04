-- ============================================
-- FIX: Allow deletion of subscription plans
-- ============================================
-- Problem: Cannot delete plans because user_subscriptions 
-- has a foreign key without ON DELETE CASCADE

-- Solution: Drop and recreate the foreign key constraint
-- with CASCADE or SET NULL behavior

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

-- Step 2: Recreate with ON DELETE CASCADE
-- This will automatically delete user subscriptions when a plan is deleted
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_id_fkey
  FOREIGN KEY (plan_id)
  REFERENCES public.subscription_plans(id)
  ON DELETE CASCADE;

-- Alternative Step 2 (if you prefer to keep subscriptions):
-- This will set plan_id to NULL when a plan is deleted
-- Uncomment the lines below and comment out the CASCADE version above
/*
ALTER TABLE public.user_subscriptions
  ALTER COLUMN plan_id DROP NOT NULL;

ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_id_fkey
  FOREIGN KEY (plan_id)
  REFERENCES public.subscription_plans(id)
  ON DELETE SET NULL;
*/

-- Step 3: Update RLS policies to allow admins to delete plans
DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;

CREATE POLICY "Admins can manage plans"
  ON public.subscription_plans
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE is_admin = true
    )
  );

-- ============================================
-- DONE! You can now delete subscription plans
-- ============================================
