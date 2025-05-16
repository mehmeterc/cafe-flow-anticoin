-- Drop existing policies and RLS to modify the table
DROP POLICY IF EXISTS "Public user_profiles are viewable by everyone." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.user_profiles;
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop and recreate the table to ensure it has the correct schema
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Recreate the user_profiles table with the correct schema
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  anticoin_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the policies
CREATE POLICY "Public user_profiles are viewable by everyone." 
ON public.user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Add a comment to explain the table's purpose
COMMENT ON TABLE public.user_profiles IS 'Stores user profile information including AntiCoin balance';

-- Add index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
