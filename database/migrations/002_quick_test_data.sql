-- Quick Test Data Setup
-- Run this AFTER you have signed in with test@example.com
-- This will use the existing auth user to create profile data

-- Step 1: Get the user_id for test@example.com
-- Run this query first to get the user_id:
-- SELECT id FROM auth.users WHERE email = 'test@example.com';

-- Step 2: Replace 'USER_ID_HERE' with the actual ID from step 1 and run:

DO $$
DECLARE
  test_user_id uuid;
  test_tenant_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  -- Get the user_id for test@example.com
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com' LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Create tenant
    INSERT INTO tenants (id, name, slug, plan, settings)
    VALUES (
      test_tenant_id,
      'Average Joe Construction',
      'average-joe-construction',
      'pro',
      '{"features": ["takeoffs", "customers", "projects"], "max_users": 10}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create profile
    INSERT INTO profiles (user_id, tenant_id, email, full_name, role)
    VALUES (
      test_user_id,
      test_tenant_id,
      'test@example.com',
      'Joe Builder',
      'contractor_admin'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      tenant_id = test_tenant_id,
      full_name = 'Joe Builder',
      role = 'contractor_admin',
      updated_at = NOW();

    -- Create contractor profile
    INSERT INTO contractor_profiles (user_id, tenant_id, business_name, contact_name, email, phone, address, city, state, zip, website, license_number, years_in_business, specialties)
    VALUES (
      test_user_id,
      test_tenant_id,
      'Average Joe Construction LLC',
      'Joe Builder',
      'test@example.com',
      '555-0123',
      '123 Main Street',
      'Dallas',
      'TX',
      '75201',
      'https://averagejoe.example.com',
      'LIC-123456',
      10,
      ARRAY['Roofing', 'Siding', 'General Construction']
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      business_name = 'Average Joe Construction LLC',
      contact_name = 'Joe Builder',
      updated_at = NOW();

    RAISE NOTICE 'Test data created successfully for user %', test_user_id;
  ELSE
    RAISE NOTICE 'User test@example.com not found. Please sign in first.';
  END IF;
END $$;