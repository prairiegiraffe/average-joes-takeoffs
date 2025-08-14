-- Fix Row Level Security (RLS) policies for profiles table
-- This ensures authenticated users can read their own profiles

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their tenant" ON tenants;

-- Create policy: Users can view their tenant through profile
CREATE POLICY "Users can view their tenant" ON tenants
    FOR SELECT
    USING (
        id IN (
            SELECT tenant_id 
            FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Enable RLS on contractor_profiles table
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own contractor profile" ON contractor_profiles;
DROP POLICY IF EXISTS "Users can update own contractor profile" ON contractor_profiles;

-- Create policy: Users can view their own contractor profile
CREATE POLICY "Users can view own contractor profile" ON contractor_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can update their own contractor profile
CREATE POLICY "Users can update own contractor profile" ON contractor_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);