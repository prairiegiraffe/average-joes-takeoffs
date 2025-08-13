import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { type NextRequest, type NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createServerSupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value, ...options })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        request.cookies.set({ name, value: '', ...options })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })
}

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          email: string
          full_name: string
          role: 'super_admin' | 'contractor_admin' | 'contractor_user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          email: string
          full_name: string
          role?: 'super_admin' | 'contractor_admin' | 'contractor_user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          email?: string
          full_name?: string
          role?: 'super_admin' | 'contractor_admin' | 'contractor_user'
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'free' | 'pro' | 'enterprise'
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'free' | 'pro' | 'enterprise'
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'free' | 'pro' | 'enterprise'
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      contractor_profiles: {
        Row: {
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
          website: string | null
          license_number: string
          years_in_business: number
          specialties: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          website?: string | null
          license_number: string
          years_in_business: number
          specialties: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          business_name?: string
          contact_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          website?: string | null
          license_number?: string
          years_in_business?: number
          specialties?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}