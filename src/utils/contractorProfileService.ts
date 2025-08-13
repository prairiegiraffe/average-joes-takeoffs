import { supabase, isSupabaseConfigured, type ContractorProfile } from './supabase'
import { authService } from './authService'
import type { ContractorProfile as LocalContractorProfile } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim().replace(/\s+/g, '') || '';

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

        // Handle localStorage users
        let queryUserId = user.id;
        if (user.id.startsWith('contractor-') || user.id.startsWith('admin-')) {
          console.log('⚠️ Using localStorage mock user - returning localStorage data');
          return this.getProfileFromLocalStorage();
        }

        console.log('🔍 Querying Supabase for user_id:', queryUserId)
        
        // Try querying without .single() first to see if records exist
        const { data: allData, error: listError } = await supabase
          .from('contractor_profiles')
          .select('*')
          .eq('user_id', queryUserId)
        
        console.log('📊 Supabase list query result:', { allData, listError, count: allData?.length })
        
        if (listError) {
          console.error('❌ Supabase list query error:', listError)
          console.log('🔄 Trying direct REST API as fallback...')
          
          // Try direct REST API call
          try {
            const profile = await this.getProfileDirectly(queryUserId)
            if (profile) {
              console.log('✅ Got profile via direct API:', profile)
              return this.convertSupabaseToLocal(profile)
            }
          } catch (directError) {
            console.error('❌ Direct API also failed:', directError)
          }
          
          return this.getProfileFromLocalStorage()
        }
        
        if (!allData || allData.length === 0) {
          console.log('❌ No profile records found in Supabase, falling back to localStorage')
          return this.getProfileFromLocalStorage()
        }
        
        // Use the first record if multiple exist
        const data = allData[0]
        const error = null

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

        // For localStorage users (mock users), create a real user in Supabase first
        let actualUserId = user.id;
        let actualTenantId = user.tenantId;

        // Check if this is a mock user from localStorage
        if (user.id.startsWith('contractor-') || user.id.startsWith('admin-')) {
          console.log('⚠️ Using localStorage mock user - Supabase requires real authentication');
          console.log('💡 To use Supabase:');
          console.log('   1. Create a user in Supabase Dashboard > Authentication');
          console.log('   2. Or run the simple-test-profile.sql script');
          return this.saveProfileToLocalStorage(profile);
        }

        if (!actualTenantId) {
          // Get default tenant
          const { data: defaultTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('name', 'Default Tenant')
            .single();
          
          actualTenantId = defaultTenant?.id;
          
          if (!actualTenantId) {
            console.log('❌ No default tenant found, saving to localStorage only')
            return this.saveProfileToLocalStorage(profile)
          }
        }

        // Convert local format to Supabase format
        const supabaseProfile = this.convertLocalToSupabase(profile, actualUserId, actualTenantId)
        console.log('🔄 Converted profile for Supabase:', supabaseProfile)

        // Check if profile exists
        console.log('🔍 Checking if profile exists for user_id:', actualUserId)
        const { data: existingProfile, error: checkError } = await supabase
          .from('contractor_profiles')
          .select('id')
          .eq('user_id', actualUserId)
          .single()

        console.log('📊 Existing profile check:', { existingProfile, checkError })

        let result
        if (existingProfile) {
          console.log('📝 Updating existing profile')
          result = await supabase
            .from('contractor_profiles')
            .update(supabaseProfile)
            .eq('user_id', actualUserId)
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
    console.log('🔄 Converting Supabase profile to local format:', supabaseProfile);
    
    const converted = {
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
    };
    
    console.log('✅ Converted profile:', converted);
    return converted;
  }

  // Direct REST API call to get profile (bypassing SDK)
  private async getProfileDirectly(userId: string): Promise<ContractorProfile | null> {
    try {
      const tokenData = localStorage.getItem('supabase.auth.token');
      if (!tokenData) {
        console.log('No auth token available for direct API call');
        return null;
      }

      const { currentSession } = JSON.parse(tokenData);
      const cleanKey = SUPABASE_KEY.trim().replace(/\s+/g, '');
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/contractor_profiles?user_id=eq.${userId}&select=*`, {
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${currentSession.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      if (!response.ok) {
        console.error('Direct API response not ok:', response.status, response.statusText);
        return null;
      }

      const profiles = await response.json();
      return profiles[0] || null;
    } catch (error) {
      console.error('Direct profile fetch error:', error);
      return null;
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