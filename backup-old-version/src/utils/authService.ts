import { supabase, isSupabaseConfigured, type Profile } from './supabase'
import { 
  loginUser as localLoginUser, 
  getCurrentUser as localGetCurrentUser,
  logoutUser as localLogoutUser,
  MOCK_USERS,
  USER_ROLES 
} from './auth'

// Hybrid authentication service that works with both localStorage and Supabase
export class AuthService {
  private useSupabase: boolean

  constructor() {
    this.useSupabase = isSupabaseConfigured()
  }

  // Login method - tries Supabase first, falls back to localStorage
  async login(email: string, password: string) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          // If Supabase login fails, try localStorage fallback
          return this.loginWithLocalStorage(email, password)
        }

        if (data.user) {
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError || !profile) {
            console.error('Profile fetch error:', profileError)
            return this.loginWithLocalStorage(email, password)
          }

          return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            company: profile.company,
            tenantId: profile.tenant_id,
            createdAt: profile.created_at
          }
        }
      } catch (error) {
        console.error('Supabase login error:', error)
        // Fallback to localStorage
        return this.loginWithLocalStorage(email, password)
      }
    }

    // Use localStorage authentication
    return this.loginWithLocalStorage(email, password)
  }

  // Logout method
  async logout() {
    if (this.useSupabase) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Supabase logout error:', error)
      }
    }
    
    // Always clear localStorage as well
    localLogoutUser()
  }

  // Get current user
  async getCurrentUser() {
    if (this.useSupabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          return this.getCurrentUserFromLocalStorage()
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          return this.getCurrentUserFromLocalStorage()
        }

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          company: profile.company,
          tenantId: profile.tenant_id,
          createdAt: profile.created_at
        }
      } catch (error) {
        console.error('Supabase getCurrentUser error:', error)
        return this.getCurrentUserFromLocalStorage()
      }
    }

    return this.getCurrentUserFromLocalStorage()
  }

  // Register new user (Supabase only)
  async register(email: string, password: string, name: string, company?: string) {
    if (!this.useSupabase) {
      throw new Error('Registration requires Supabase configuration')
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company
          }
        }
      })

      if (error) throw error

      return data.user
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Check authentication status
  async isAuthenticated() {
    const user = await this.getCurrentUser()
    return !!user
  }

  // Get user role
  async getUserRole() {
    const user = await this.getCurrentUser()
    return user?.role || null
  }

  // Private methods for localStorage fallback
  private loginWithLocalStorage(email: string, password: string) {
    return localLoginUser(email, password)
  }

  private getCurrentUserFromLocalStorage() {
    return localGetCurrentUser()
  }

  // Check if user has specific role
  async hasRole(role: string) {
    const user = await this.getCurrentUser()
    return user?.role === role
  }

  // Check if user is super admin
  async isSuperAdmin() {
    return this.hasRole(USER_ROLES.SUPER_ADMIN)
  }

  // Check if user is contractor
  async isContractor() {
    return this.hasRole(USER_ROLES.CONTRACTOR)
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export compatibility functions for existing code
export const loginUser = (email: string, password: string) => authService.login(email, password)
export const getCurrentUser = () => authService.getCurrentUser()
export const logoutUser = () => authService.logout()
export const hasRole = (user: any, role: string) => user?.role === role
export const isSuperAdmin = (user: any) => hasRole(user, USER_ROLES.SUPER_ADMIN)
export const isContractor = (user: any) => hasRole(user, USER_ROLES.CONTRACTOR)