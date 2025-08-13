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
    if (this.useSupabase) {
      try {
        const user = await authService.getCurrentUser()
        if (!user) return this.getProfileFromLocalStorage()

        const { data, error } = await supabase
          .from('contractor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error || !data) {
          // No profile exists, return from localStorage or create default
          return this.getProfileFromLocalStorage()
        }

        // Convert Supabase format to local format
        return this.convertSupabaseToLocal(data)
      } catch (error) {
        console.error('Error fetching contractor profile:', error)
        return this.getProfileFromLocalStorage()
      }
    }

    return this.getProfileFromLocalStorage()
  }

  // Create or update contractor profile
  async saveProfile(profile: LocalContractorProfile): Promise<boolean> {
    if (this.useSupabase) {
      try {
        const user = await authService.getCurrentUser()
        if (!user) {
          // Fall back to localStorage
          return this.saveProfileToLocalStorage(profile)
        }

        // Convert local format to Supabase format
        const supabaseProfile = this.convertLocalToSupabase(profile, user.id, user.tenantId)

        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('contractor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        let result
        if (existingProfile) {
          // Update existing profile
          result = await supabase
            .from('contractor_profiles')
            .update(supabaseProfile)
            .eq('user_id', user.id)
        } else {
          // Create new profile
          result = await supabase
            .from('contractor_profiles')
            .insert([supabaseProfile])
        }

        if (result.error) {
          console.error('Error saving contractor profile:', result.error)
          return this.saveProfileToLocalStorage(profile)
        }

        // Also save to localStorage as backup
        this.saveProfileToLocalStorage(profile)
        return true
      } catch (error) {
        console.error('Error saving contractor profile:', error)
        return this.saveProfileToLocalStorage(profile)
      }
    }

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