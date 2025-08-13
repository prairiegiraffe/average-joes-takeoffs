-- Manual fix: Create a contractor profile directly in Supabase
-- Run this in your Supabase SQL Editor to bypass the authentication issues

-- 1. First, create a user in auth.users (or do this via Supabase Auth UI)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'contractor1@test.com',
  crypt('contractor123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"John Smith","company":"Smith Roofing LLC"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Get the user ID we just created
WITH user_data AS (
  SELECT id as user_id FROM auth.users WHERE email = 'contractor1@test.com'
),
tenant_data AS (
  SELECT id as tenant_id FROM public.tenants WHERE name = 'Default Tenant' LIMIT 1
)
-- 3. Create the contractor profile
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
)
SELECT 
  u.user_id,
  t.tenant_id,
  'Smith Roofing LLC',
  'John Smith',
  'contractor1@test.com',
  '(555) 123-4567',
  '123 Main Street',
  'Springfield',
  'IL',
  '62701',
  'www.smithroofing.com',
  'IL-ROOF-12345',
  8,
  ARRAY['Roofing', 'Siding', 'Gutters']
FROM user_data u, tenant_data t
ON CONFLICT (user_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  contact_name = EXCLUDED.contact_name,
  updated_at = NOW();

-- 4. Verify it worked
SELECT 
  cp.*,
  u.email 
FROM public.contractor_profiles cp
JOIN auth.users u ON cp.user_id = u.id
WHERE u.email = 'contractor1@test.com';