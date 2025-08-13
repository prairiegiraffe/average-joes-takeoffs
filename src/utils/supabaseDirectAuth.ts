// Direct Supabase Auth API calls without SDK
// This bypasses the SDK fetch issues

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface AuthResponse {
  user?: any;
  session?: any;
  error?: string;
}

export async function signInDirectly(email: string, password: string): Promise<AuthResponse> {
  try {
    // Validate inputs
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured');
    }

    // Make direct API call to Supabase Auth
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        email,
        password,
        gotrue_meta_security: {}
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error_description || error.msg || 'Authentication failed' };
    }

    const data = await response.json();
    
    // Store the session
    if (data.access_token) {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user: data.user
        },
        expiresAt: data.expires_at
      }));
    }

    return {
      user: data.user,
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user
      }
    };
  } catch (error: any) {
    console.error('Direct auth error:', error);
    return { error: error.message || 'Network error' };
  }
}

export async function getProfileDirectly(userId: string): Promise<any> {
  try {
    const tokenData = localStorage.getItem('supabase.auth.token');
    if (!tokenData) return null;

    const { currentSession } = JSON.parse(tokenData);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${currentSession.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const profiles = await response.json();
    return profiles[0] || null;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

export async function signOutDirectly(): Promise<void> {
  try {
    const tokenData = localStorage.getItem('supabase.auth.token');
    if (tokenData) {
      const { currentSession } = JSON.parse(tokenData);
      
      // Call sign out endpoint
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${currentSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Sign out error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('averagejoes_user');
  }
}