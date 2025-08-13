-- Add contractor_profiles table to existing Supabase database
-- Run this script if you already have the base tables set up

-- 1. Create contractor_profiles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.contractor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  website TEXT,
  license_number TEXT NOT NULL,
  years_in_business INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security on contractor_profiles
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for contractor_profiles (only if they don't exist)
DO $$ 
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contractor_profiles' 
    AND policyname = 'Users can view own contractor profile'
  ) THEN
    CREATE POLICY "Users can view own contractor profile" ON public.contractor_profiles
      FOR SELECT USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contractor_profiles' 
    AND policyname = 'Users can create own contractor profile'
  ) THEN
    CREATE POLICY "Users can create own contractor profile" ON public.contractor_profiles
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contractor_profiles' 
    AND policyname = 'Users can update own contractor profile'
  ) THEN
    CREATE POLICY "Users can update own contractor profile" ON public.contractor_profiles
      FOR UPDATE USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contractor_profiles' 
    AND policyname = 'Users can delete own contractor profile'
  ) THEN
    CREATE POLICY "Users can delete own contractor profile" ON public.contractor_profiles
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- 4. Add updated_at trigger (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'handle_updated_at' 
    AND tgrelid = 'public.contractor_profiles'::regclass
  ) THEN
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.contractor_profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 5. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contractor_profiles TO authenticated;

-- Success message
SELECT 'contractor_profiles table and policies created successfully!' as result;