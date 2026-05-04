-- ============================================
-- DIAGNOSTIC: Check why plan deletion is failing
-- Run this to see what's wrong
-- ============================================

-- 1. Check if subscription_plans table exists
SELECT 'Table Exists' as check_name, 
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'subscription_plans'
       ) THEN '✓ YES' ELSE '✗ NO' END as status;

-- 2. Check foreign key constraint on user_subscriptions
SELECT 
    '2. Foreign Key Constraint' as check_name,
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS references_table,
    COALESCE(rc.delete_rule, 'NO ACTION') as delete_rule,
    CASE 
      WHEN rc.delete_rule = 'CASCADE' THEN '✓ GOOD (CASCADE)'
      ELSE '✗ BAD (Need CASCADE)' 
    END as status
FROM information_schema.table_constraints AS tc 
LEFT JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'user_subscriptions' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'plan_id';

-- 3. Check RLS is enabled
SELECT 
    '3. RLS Enabled' as check_name,
    tablename,
    CASE WHEN rowsecurity THEN '✓ YES' ELSE '✗ NO' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'subscription_plans';

-- 4. Check RLS policies for subscription_plans
SELECT 
    '4. RLS Policies' as check_name,
    policyname as policy_name,
    cmd as operation,
    CASE 
      WHEN cmd = 'DELETE' AND policyname LIKE '%admin%' THEN '✓ DELETE policy exists'
      WHEN cmd = 'DELETE' THEN '✓ DELETE policy exists'
      ELSE '→ ' || cmd || ' policy'
    END as status
FROM pg_policies 
WHERE tablename = 'subscription_plans'
ORDER BY cmd;

-- 5. Check if there are any plans
SELECT 
    '5. Plans Count' as check_name,
    COUNT(*)::text as count,
    CASE 
      WHEN COUNT(*) > 0 THEN '✓ Plans exist'
      ELSE '✗ No plans found'
    END as status
FROM public.subscription_plans;

-- 6. Check if there are subscriptions linked to plans
SELECT 
    '6. Active Subscriptions' as check_name,
    COUNT(*)::text as count,
    CASE 
      WHEN COUNT(*) > 0 THEN '⚠ Subscriptions exist (will be deleted with CASCADE)'
      ELSE '✓ No subscriptions'
    END as status
FROM public.user_subscriptions;

-- 7. Check current user's admin status (if logged in)
SELECT 
    '7. Current User Admin' as check_name,
    COALESCE(email, 'Not logged in') as user_email,
    COALESCE(is_admin::text, 'N/A') as is_admin,
    CASE 
      WHEN is_admin = true THEN '✓ Is Admin'
      WHEN is_admin = false THEN '✗ Not Admin'
      ELSE '? Not logged in or no profile'
    END as status
FROM public.profiles 
WHERE id = auth.uid();

-- ============================================
-- SUMMARY
-- ============================================
-- Look for any ✗ or ⚠ symbols above
-- Those indicate what needs to be fixed
-- ============================================
