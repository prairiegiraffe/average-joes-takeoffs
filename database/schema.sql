-- Average Joe's Takeoffs - Multi-Tenant Database Schema
-- This creates a proper multi-tenant SaaS database structure

-- Enable RLS on all tables by default
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA PUBLIC GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create tenants table first (the foundation of multi-tenancy)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table (extends auth.users with our business logic)
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

-- Create contractor_profiles table (contractor-specific business info)
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

-- Create projects table (tenant-isolated takeoff projects)
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

-- Create customers table (tenant-isolated customer management)
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

-- Enable Row Level Security on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants table
-- Super admins can see all tenants, contractors can only see their own
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

-- RLS Policies for profiles table
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

-- RLS Policies for contractor_profiles table
CREATE POLICY "Users can view own contractor profile" ON public.contractor_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users in same tenant can view contractor profiles" ON public.contractor_profiles
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own contractor profile" ON public.contractor_profiles
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for projects table
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

-- RLS Policies for customers table
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

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_user_id ON public.contractor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_tenant_id ON public.contractor_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Create default "Average Joe's" super admin tenant
INSERT INTO public.tenants (id, name, slug, plan)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Average Joe''s SaaS',
    'average-joes-admin',
    'enterprise'
) ON CONFLICT (slug) DO NOTHING;