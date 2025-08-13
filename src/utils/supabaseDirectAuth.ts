// Direct Supabase Auth API calls without SDK
// This bypasses the SDK fetch issues

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim().replace(/\s+/g, '') || '';

export interface AuthResponse {
  user?: any;
  session?: any;
  error?: string;
}

export async function signInDirectly(email: string, password: string): Promise<AuthResponse> {
  try {
    // Debug log environment variables
    console.log('Direct auth - SUPABASE_URL:', SUPABASE_URL);
    console.log('Direct auth - SUPABASE_KEY length:', SUPABASE_KEY?.length || 0);
    console.log('Direct auth - Email:', email);
    
    // Validate inputs
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured');
    }

    // Validate URL format
    if (!SUPABASE_URL.startsWith('https://')) {
      throw new Error('Invalid Supabase URL format');
    }

    // Validate key format (basic JWT structure)
    if (!SUPABASE_KEY.includes('.') || SUPABASE_KEY.length < 100) {
      throw new Error('Invalid Supabase key format');
    }

    const cleanKey = SUPABASE_KEY.trim().replace(/\s+/g, '');
    const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': cleanKey,
      'Authorization': `Bearer ${cleanKey}`
    };
    const body = JSON.stringify({
      email,
      password,
      gotrue_meta_security: {}
    });

    console.log('Direct auth - About to fetch:', url);
    console.log('Direct auth - Headers:', headers);

    // Make direct API call to Supabase Auth
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
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
    
    // If fetch fails, try XMLHttpRequest as fallback
    if (error.message?.includes('fetch')) {
      console.log('Fetch failed, trying XMLHttpRequest...');
      return signInWithXHR(email, password);
    }
    
    return { error: error.message || 'Network error' };
  }
}

// Fallback using XMLHttpRequest
function signInWithXHR(email: string, password: string): Promise<AuthResponse> {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
      
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('apikey', SUPABASE_KEY.trim().replace(/\s+/g, ''));
      xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY.trim().replace(/\s+/g, '')}`);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            
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
            
            resolve({
              user: data.user,
              session: {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                user: data.user
              }
            });
          } catch (parseError) {
            resolve({ error: 'Failed to parse response' });
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            resolve({ error: error.error_description || error.msg || 'Authentication failed' });
          } catch {
            resolve({ error: `HTTP ${xhr.status}: ${xhr.statusText}` });
          }
        }
      };
      
      xhr.onerror = function() {
        resolve({ error: 'Network error with XMLHttpRequest' });
      };
      
      const body = JSON.stringify({
        email,
        password,
        gotrue_meta_security: {}
      });
      
      xhr.send(body);
    } catch (error: any) {
      resolve({ error: error.message || 'XMLHttpRequest setup failed' });
    }
  });
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