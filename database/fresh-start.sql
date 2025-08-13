-- Fresh Start - Clean Database Setup
-- This will drop everything and start fresh
-- ⚠️ WARNING: This will delete all existing data!

-- Drop all existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.contractor_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Drop function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Now create everything fresh
CREATE TABLE public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'contractor_user' CHECK (role IN ('super_admin', 'contractor_admin', 'contractor_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE public.projects (
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

CREATE TABLE public.customers (
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

-- Create default tenant
INSERT INTO public.tenants (id, name, slug, plan)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Average Joe''s SaaS',
    'average-joes-admin',
    'enterprise'
);

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

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
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_contractor_profiles_user_id ON public.contractor_profiles(user_id);
CREATE INDEX idx_contractor_profiles_tenant_id ON public.contractor_profiles(tenant_id);
CREATE INDEX idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);

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