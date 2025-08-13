import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a function to get Supabase client
export function getSupabaseClient(): SupabaseClient | null {
  // Validate URL and key
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing')
    return null
  }

  // Check if URL is valid
  try {
    new URL(supabaseUrl)
  } catch (e) {
    console.error('Invalid Supabase URL:', supabaseUrl)
    return null
  }

  // Check if key looks valid (basic JWT structure)
  if (!supabaseKey.includes('.') || supabaseKey.length < 100) {
    console.error('Invalid Supabase key format')
    return null
  }

  try {
    // Create client with explicit options
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
    
    return client
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

// Create singleton instance
let _supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!_supabaseClient) {
    _supabaseClient = getSupabaseClient()
  }
  return _supabaseClient
}

// Check if properly configured
export function isSupabaseReady(): boolean {
  return getSupabase() !== null
}