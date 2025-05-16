-- Add missing columns to checkins table
ALTER TABLE public.checkins 
ADD COLUMN IF NOT EXISTS anticoin_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS minutes_spent INTEGER DEFAULT 0;

-- Add missing column to anticoins_transactions table
ALTER TABLE public.anticoin_transactions
ADD COLUMN IF NOT EXISTS blockchain_tx_id TEXT;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
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

-- Create policies for user_profiles
CREATE POLICY "Public user_profiles are viewable by everyone." 
ON public.user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);
