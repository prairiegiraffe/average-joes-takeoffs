-- Create Test User and Profile
-- Run this AFTER creating the user through Supabase Auth (sign up in the app)

-- First, check if the user exists in auth.users
-- SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Create a test contractor tenant (if it doesn't exist)
INSERT INTO public.tenants (id, name, slug, plan)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test Contractor LLC',
    'test-contractor',
    'pro'
) ON CONFLICT (slug) DO NOTHING;

-- Create profile for the test user
-- Replace 'USER_ID_FROM_AUTH_USERS' with the actual user_id from auth.users
-- Example:
-- INSERT INTO public.profiles (user_id, tenant_id, email, full_name, role)
-- VALUES (
--     'USER_ID_FROM_SIGNUP',  -- Replace with actual user_id from auth.users
--     '11111111-1111-1111-1111-111111111111',
--     'test@example.com',
--     'Test User',
--     'contractor_admin'
-- );

-- Create contractor profile
-- INSERT INTO public.contractor_profiles (user_id, tenant_id, business_name, contact_name, email, phone, address, city, state, zip, license_number, years_in_business, specialties)
-- VALUES (
--     'USER_ID_FROM_SIGNUP',  -- Replace with actual user_id
--     '11111111-1111-1111-1111-111111111111',
--     'Test Roofing Company',
--     'Test User',
--     'test@example.com',
--     '(555) 123-4567',
--     '123 Test St',
--     'Test City',
--     'CA',
--     '12345',
--     'LICENSE-123',
--     5,
--     ARRAY['Roofing', 'Siding']
-- );

-- Check the results
-- SELECT * FROM public.profiles WHERE email = 'test@example.com';
-- SELECT * FROM public.contractor_profiles WHERE email = 'test@example.com';