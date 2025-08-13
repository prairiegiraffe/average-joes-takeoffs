-- Safe Migration Script - Handles Existing Tables
-- Run this in Supabase SQL Editor

-- First, let's see what we have
-- (You can run this first to check)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Super admins can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own contractor profile" ON public.contractor_profiles;
DROP POLICY IF EXISTS "Users in same tenant can view contractor profiles" ON public.contractor_profiles;
DROP POLICY IF EXISTS "Users can manage own contractor profile" ON public.contractor_profiles;
DROP POLICY IF EXISTS "Users can view projects in their tenant" ON public.projects;
DROP POLICY IF EXISTS "Users can manage projects in their tenant" ON public.projects;
DROP POLICY IF EXISTS "Users can view customers in their tenant" ON public.customers;
DROP POLICY IF EXISTS "Users can manage customers in their tenant" ON public.customers;

-- Add missing columns to existing tables
-- Add slug column to tenants if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'slug') THEN
        ALTER TABLE public.tenants ADD COLUMN slug TEXT;
    END IF;
END $$;

-- Make slug unique if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'slug') THEN
        -- First update any null slugs
        UPDATE public.tenants SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
        -- Then make it unique
        ALTER TABLE public.tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, skip
    NULL;
END $$;

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'contractor_user' CHECK (role IN ('super_admin', 'contractor_admin', 'contractor_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contractor_profiles table if it doesn't exist
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

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL CHECK (project_type IN ('roofing', 'siding', 'stone', 'mixed')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
    data JSONB DEFAULT '{}',
    estimated_value DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create default tenant (with proper error handling)
INSERT INTO public.tenants (id, name, slug, plan)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Average Joe''s SaaS',
    'average-joes-admin',
    'enterprise'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    plan = EXCLUDED.plan;

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers before creating new ones
DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_contractor_profiles_updated_at ON public.contractor_profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;

-- Create triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_contractor_profiles_updated_at BEFORE UPDATE ON public.contractor_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON public.contractor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_tenant_id ON public.contractor_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Super admins can view all tenants" ON public.tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Users can view their own tenant" ON public.tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p2
            WHERE p2.user_id = auth.uid() 
            AND p2.role = 'super_admin'
        )
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own contractor profile" ON public.contractor_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users in same tenant can view contractor profiles" ON public.contractor_profiles
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own contractor profile" ON public.contractor_profiles
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view projects in their tenant" ON public.projects
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage projects in their tenant" ON public.projects
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view customers in their tenant" ON public.customers
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage customers in their tenant" ON public.customers
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );