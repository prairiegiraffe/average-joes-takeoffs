import { supabase, isSupabaseConfigured, type ContractorProfile } from './supabase'
import { authService } from './authService'
import type { ContractorProfile as LocalContractorProfile } from '../types'

// Service for managing contractor profiles with Supabase integration
export class ContractorProfileService {
  private useSupabase: boolean

  constructor() {
    this.useSupabase = isSupabaseConfigured()
  }

  // Get contractor profile for current user
  async getProfile(): Promise<LocalContractorProfile | null> {
    console.log('🔍 ContractorProfileService.getProfile() called')
    console.log('🔧 useSupabase:', this.useSupabase)
    
    if (this.useSupabase) {
      try {
        const user = await authService.getCurrentUser()
        console.log('👤 Current user:', user)
        
        if (!user) {
          console.log('❌ No authenticated user, falling back to localStorage')
          return this.getProfileFromLocalStorage()
        }

        console.log('🔍 Querying Supabase for user_id:', user.id)
        const { data, error } = await supabase
          .from('contractor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        console.log('📊 Supabase query result:', { data, error })

        if (error || !data) {
          console.log('❌ No profile in Supabase, falling back to localStorage')
          return this.getProfileFromLocalStorage()
        }

        console.log('✅ Found profile in Supabase, converting to local format')
        return this.convertSupabaseToLocal(data)
      } catch (error) {
        console.error('❌ Error fetching contractor profile:', error)
        return this.getProfileFromLocalStorage()
      }
    }

    console.log('📱 Using localStorage (Supabase not configured)')
    return this.getProfileFromLocalStorage()
  }

  // Create or update contractor profile
  async saveProfile(profile: LocalContractorProfile): Promise<boolean> {
    console.log('💾 ContractorProfileService.saveProfile() called with:', profile)
    console.log('🔧 useSupabase:', this.useSupabase)
    
    if (this.useSupabase) {
      try {
        const user = await authService.getCurrentUser()
        console.log('👤 Current user for save:', user)
        
        if (!user) {
          console.log('❌ No authenticated user, saving to localStorage only')
          return this.saveProfileToLocalStorage(profile)
        }

        if (!user.tenantId) {
          console.log('❌ User has no tenantId, saving to localStorage only')
          return this.saveProfileToLocalStorage(profile)
        }

        // Convert local format to Supabase format
        const supabaseProfile = this.convertLocalToSupabase(profile, user.id, user.tenantId)
        console.log('🔄 Converted profile for Supabase:', supabaseProfile)

        // Check if profile exists
        console.log('🔍 Checking if profile exists for user_id:', user.id)
        const { data: existingProfile, error: checkError } = await supabase
          .from('contractor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        console.log('📊 Existing profile check:', { existingProfile, checkError })

        let result
        if (existingProfile) {
          console.log('📝 Updating existing profile')
          result = await supabase
            .from('contractor_profiles')
            .update(supabaseProfile)
            .eq('user_id', user.id)
        } else {
          console.log('➕ Creating new profile')
          result = await supabase
            .from('contractor_profiles')
            .insert([supabaseProfile])
        }

        console.log('📊 Save result:', result)

        if (result.error) {
          console.error('❌ Error saving contractor profile to Supabase:', result.error)
          return this.saveProfileToLocalStorage(profile)
        }

        console.log('✅ Successfully saved to Supabase')
        // Also save to localStorage as backup
        this.saveProfileToLocalStorage(profile)
        return true
      } catch (error) {
        console.error('❌ Exception saving contractor profile:', error)
        return this.saveProfileToLocalStorage(profile)
      }
    }

    console.log('📱 Saving to localStorage only (Supabase not configured)')
    return this.saveProfileToLocalStorage(profile)
  }

  // Delete contractor profile
  async deleteProfile(): Promise<boolean> {
    if (this.useSupabase) {
      try {
        const user = await authService.getCurrentUser()
        if (!user) return false

        const { error } = await supabase
          .from('contractor_profiles')
          .delete()
          .eq('user_id', user.id)

        if (error) {
          console.error('Error deleting contractor profile:', error)
          return false
        }

        // Also remove from localStorage
        localStorage.removeItem('contractorProfile')
        return true
      } catch (error) {
        console.error('Error deleting contractor profile:', error)
        return false
      }
    }

    // Remove from localStorage
    localStorage.removeItem('contractorProfile')
    return true
  }

  // Convert Supabase format to local format
  private convertSupabaseToLocal(supabaseProfile: ContractorProfile): LocalContractorProfile {
    return {
      businessName: supabaseProfile.business_name,
      contactName: supabaseProfile.contact_name,
      email: supabaseProfile.email,
      phone: supabaseProfile.phone,
      address: supabaseProfile.address,
      city: supabaseProfile.city,
      state: supabaseProfile.state,
      zip: supabaseProfile.zip,
      website: supabaseProfile.website || '',
      licenseNumber: supabaseProfile.license_number,
      yearsInBusiness: supabaseProfile.years_in_business,
      specialties: supabaseProfile.specialties,
      documents: {
        w9: [],
        license: [],
        insurance: [],
        certificates: []
      }
    }
  }

  // Convert local format to Supabase format
  private convertLocalToSupabase(
    localProfile: LocalContractorProfile, 
    userId: string, 
    tenantId: string
  ): Omit<ContractorProfile, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: userId,
      tenant_id: tenantId,
      business_name: localProfile.businessName,
      contact_name: localProfile.contactName,
      email: localProfile.email,
      phone: localProfile.phone,
      address: localProfile.address,
      city: localProfile.city,
      state: localProfile.state,
      zip: localProfile.zip,
      website: localProfile.website || null,
      license_number: localProfile.licenseNumber,
      years_in_business: localProfile.yearsInBusiness,
      specialties: localProfile.specialties
    }
  }

  // Fallback methods for localStorage
  private getProfileFromLocalStorage(): LocalContractorProfile | null {
    try {
      const savedProfile = localStorage.getItem('contractorProfile')
      if (savedProfile) {
        return JSON.parse(savedProfile)
      }
    } catch (error) {
      console.error('Error parsing localStorage profile:', error)
    }
    return null
  }

  private saveProfileToLocalStorage(profile: LocalContractorProfile): boolean {
    try {
      localStorage.setItem('contractorProfile', JSON.stringify(profile))
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  }

  // Get default profile structure
  getDefaultProfile(): LocalContractorProfile {
    return {
      businessName: "Average Joe's Takeoffs",
      contactName: 'John Smith',
      email: 'john@averagejoestakeoffs.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      website: '',
      licenseNumber: 'CLB123456',
      yearsInBusiness: 15,
      specialties: ['Roofing', 'Siding', 'Windows'],
      documents: {
        w9: [],
        license: [],
        insurance: [],
        certificates: []
      }
    }
  }
}

// Export singleton instance
export const contractorProfileService = new ContractorProfileService()