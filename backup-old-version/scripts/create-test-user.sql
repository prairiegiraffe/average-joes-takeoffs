-- Create a test user and contractor profile in Supabase
-- Run this in your Supabase SQL Editor

-- First, create a test user in the auth.users table (this is normally done via registration)
-- You can also do this through the Supabase Auth UI instead

-- For testing, let's insert directly into contractor_profiles for an existing user
-- Replace 'your-user-id-here' with a real user ID from your auth.users table

-- Check if you have any users first:
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- If you have a user, create a contractor profile for them:
-- (Replace the user_id below with a real user ID)

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
  -- Replace this with your actual user ID:
  'your-user-id-here',
  -- Get the default tenant ID:
  (SELECT id FROM public.tenants WHERE name = 'Default Tenant' LIMIT 1),
  'Test Roofing Company',
  'John Smith',
  'test@example.com',
  '(555) 123-4567',
  '123 Main Street',
  'Anytown',
  'CA',
  '12345',
  'www.testroofing.com',
  'CA-LICENSE-12345',
  10,
  ARRAY['Roofing', 'Siding', 'Gutters']
) ON CONFLICT (user_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  contact_name = EXCLUDED.contact_name,
  updated_at = NOW();

-- Verify the profile was created:
SELECT * FROM public.contractor_profiles;