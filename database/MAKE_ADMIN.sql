-- ============================================
-- MAKE A USER ADMIN
-- Replace 'your@email.com' with your email
-- Run in Supabase SQL Editor
-- ============================================

-- Option A: By email (most reliable)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;

-- Also ensure member role exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'member'
FROM auth.users
WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;

-- Also ensure profile exists
INSERT INTO public.profiles (user_id, email, name)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', split_part(email,'@',1))
FROM auth.users
WHERE email = 'your@email.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify it worked
SELECT u.email, r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'your@email.com';
