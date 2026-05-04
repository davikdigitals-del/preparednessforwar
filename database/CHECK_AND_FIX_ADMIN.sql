-- ============================================
-- RUN THIS FIRST - Check & Fix Admin Status
-- ============================================

-- Step 1: See all users and their admin status
SELECT 
    au.email,
    p.id,
    p.is_admin,
    p.role
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC;

-- Step 2: Make ALL existing users admin (run this if you see is_admin = false)
UPDATE public.profiles 
SET is_admin = true, role = 'admin'
WHERE id IN (SELECT id FROM auth.users);

-- Step 3: Verify
SELECT email, is_admin, role 
FROM public.profiles;
