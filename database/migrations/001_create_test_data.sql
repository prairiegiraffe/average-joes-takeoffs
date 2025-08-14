-- Migration: Create test data for Average Joe's Takeoffs
-- Description: Adds test users, tenants, profiles, and contractor profiles
-- Date: 2025-01-14

-- First, ensure we have a test tenant
INSERT INTO tenants (id, name, slug, plan, settings)
VALUES (
  'test-tenant-001',
  'Average Joe Construction',
  'average-joe-construction',
  'pro',
  '{"features": ["takeoffs", "customers", "projects"], "max_users": 10}'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET updated_at = NOW();

-- Create test user profiles (assuming users already exist in Supabase Auth)
-- You'll need to create the auth users first via Supabase dashboard or API
-- Then run this to create their profiles

-- Example: After creating test@example.com in Supabase Auth, get their user_id and use it here
-- Replace 'YOUR-AUTH-USER-ID' with the actual user_id from auth.users table

-- Test Profile 1: Contractor Admin
-- INSERT INTO profiles (user_id, tenant_id, email, full_name, role)
-- VALUES (
--   'YOUR-AUTH-USER-ID',  -- Replace with actual auth user_id
--   'test-tenant-001',
--   'test@example.com',
--   'Joe Builder',
--   'contractor_admin'
-- )
-- ON CONFLICT (user_id) DO UPDATE
-- SET updated_at = NOW();

-- Test Contractor Profile
-- INSERT INTO contractor_profiles (user_id, tenant_id, business_name, contact_name, email, phone, address, city, state, zip, website, license_number, years_in_business, specialties)
-- VALUES (
--   'YOUR-AUTH-USER-ID',  -- Replace with actual auth user_id
--   'test-tenant-001',
--   'Average Joe Construction LLC',
--   'Joe Builder',
--   'test@example.com',
--   '555-0123',
--   '123 Main Street',
--   'Dallas',
--   'TX',
--   '75201',
--   'https://averagejoe.example.com',
--   'LIC-123456',
--   10,
--   ARRAY['Roofing', 'Siding', 'General Construction']
-- )
-- ON CONFLICT (user_id) DO UPDATE
-- SET updated_at = NOW();

-- Sample test data for customers (create a customers table first if needed)
-- This is placeholder - uncomment and modify when you have the customers table
-- INSERT INTO customers (id, tenant_id, name, email, phone, address, city, state, zip, created_by)
-- VALUES 
--   ('cust-001', 'test-tenant-001', 'John Smith', 'john@example.com', '555-1234', '456 Oak St', 'Dallas', 'TX', '75202', 'YOUR-AUTH-USER-ID'),
--   ('cust-002', 'test-tenant-001', 'Jane Doe', 'jane@example.com', '555-5678', '789 Elm St', 'Plano', 'TX', '75023', 'YOUR-AUTH-USER-ID'),
--   ('cust-003', 'test-tenant-001', 'Bob Wilson', 'bob@example.com', '555-9012', '321 Pine St', 'Frisco', 'TX', '75034', 'YOUR-AUTH-USER-ID')
-- ON CONFLICT DO NOTHING;

-- Sample test data for projects/takeoffs (create tables first if needed)
-- INSERT INTO projects (id, tenant_id, customer_id, name, status, type, created_by)
-- VALUES
--   ('proj-001', 'test-tenant-001', 'cust-001', 'Smith Residence Roof Replacement', 'active', 'roofing', 'YOUR-AUTH-USER-ID'),
--   ('proj-002', 'test-tenant-001', 'cust-002', 'Doe House Siding', 'pending', 'siding', 'YOUR-AUTH-USER-ID'),
--   ('proj-003', 'test-tenant-001', 'cust-003', 'Wilson Stone Veneer', 'completed', 'stone', 'YOUR-AUTH-USER-ID')
-- ON CONFLICT DO NOTHING;