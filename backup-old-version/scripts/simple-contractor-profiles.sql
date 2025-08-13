-- Simple contractor_profiles table creation
-- Run this in Supabase SQL Editor

-- 1. Create the table
CREATE TABLE public.contractor_profiles (
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

-- 2. Enable RLS
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view own contractor profile" ON public.contractor_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own contractor profile" ON public.contractor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own contractor profile" ON public.contractor_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own contractor profile" ON public.contractor_profiles
  FOR DELETE USING (user_id = auth.uid());

-- 4. Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.contractor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contractor_profiles TO authenticated;

-- Success message
SELECT 'contractor_profiles table created successfully!' as result;