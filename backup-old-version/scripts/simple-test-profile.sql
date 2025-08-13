-- Simple test: Create a contractor profile for testing
-- Run this in your Supabase SQL Editor

-- 1. First check if you have any users in auth.users
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;

-- 2. If you have a user, copy their ID and use it below
-- If not, create one through Supabase Dashboard > Authentication > Add User

-- 3. Create a test contractor profile (replace the user_id with a real one from step 1)
INSERT INTO public.contractor_profiles (
  user_id,
  tenant_id,
  business_name,
  contact_name,
  email,
  phone,
  address,
  city,
  state,
  zip,
  website,
  license_number,
  years_in_business,
  specialties
) VALUES (
  -- REPLACE THIS with a real user ID from auth.users:
  (SELECT id FROM auth.users LIMIT 1),
  -- Get the default tenant:
  (SELECT id FROM public.tenants WHERE name = 'Default Tenant' LIMIT 1),
  'Test Roofing Company',
  'John Test User',
  'test@example.com',
  '(555) 123-4567',
  '123 Test Street',
  'Test City',
  'CA',
  '90210',
  'www.testroofing.com',
  'CA-TEST-12345',
  5,
  ARRAY['Roofing', 'Siding', 'Gutters']
);

-- 4. Verify it was created
SELECT * FROM public.contractor_profiles;