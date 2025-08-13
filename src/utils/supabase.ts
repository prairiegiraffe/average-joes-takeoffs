import { createClient } from '@supabase/supabase-js'

// Environment variables - you'll get these from your Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-project-url'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for TypeScript
export interface Tenant {
  id: string
  name: string
  domain?: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  settings?: Record<string, any>
}

export interface Profile {
  id: string
  user_id: string
  tenant_id: string
  email: string
  name: string
  role: 'super_admin' | 'contractor' | 'user'
  company?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  tenant_id: string
  user_id: string
  name: string
  type: 'roofing' | 'siding' | 'stone' | 'mixed'
  data: Record<string, any>
  amount?: number
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface ContractorProfile {
  id: string
  user_id: string
  tenant_id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  website?: string
  license_number: string
  years_in_business: number
  specialties: string[]
  created_at: string
  updated_at: string
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'your-project-url' && supabaseKey !== 'your-anon-key'
}