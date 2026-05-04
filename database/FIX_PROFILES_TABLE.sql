-- ============================================
-- FIX PROFILES TABLE STRUCTURE
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check current profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check if we have the wrong structure (separate id and user_id)
DO $$
BEGIN
    -- If profiles has both 'id' and 'user_id' columns, we need to fix it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'id'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Found incorrect profiles structure with both id and user_id';
        
        -- Drop the old table
        DROP TABLE IF EXISTS public.profiles CASCADE;
        
        -- Create the correct structure
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'editor')),
            country TEXT,
            is_admin BOOLEAN DEFAULT FALSE,
            avatar_url TEXT,
            bio TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Public profiles are viewable by everyone"
            ON public.profiles FOR SELECT
            USING (true);

        CREATE POLICY "Users can update own profile"
            ON public.profiles FOR UPDATE
            USING (auth.uid() = id);
            
        CREATE POLICY "Users can insert own profile"
            ON public.profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
        
        RAISE NOTICE 'Profiles table recreated with correct structure';
    ELSE
        RAISE NOTICE 'Profiles table structure looks correct';
    END IF;
END $$;

-- Step 3: Create trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, country)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'country', 'GB')
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the fix
SELECT 
    'Profiles Table Structure' as check_name,
    column_name,
    data_type,
    CASE 
        WHEN column_name = 'id' AND data_type = 'uuid' THEN '✓ Correct'
        WHEN column_name = 'user_id' THEN '✗ Should not exist'
        ELSE '→ ' || column_name
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- DONE! Profiles table should now work correctly
-- ============================================
