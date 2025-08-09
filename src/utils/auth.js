// Simple authentication utilities - no complex Context
export const AUTH_KEY = 'averagejoes_user';

// User types
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CONTRACTOR: 'contractor'
};

// Mock users database (in real SaaS, this would be your backend)
export const MOCK_USERS = {
  // Super Admin account for SaaS company
  'admin@averagejoes.com': {
    id: 'admin-1',
    email: 'admin@averagejoes.com',
    password: 'admin123',
    name: 'AverageJoe Admin',
    role: USER_ROLES.SUPER_ADMIN,
    company: 'Average Joes SaaS',
    tenantId: 'saas-admin',
    createdAt: '2025-01-01'
  },
  
  // Contractor accounts (each is a separate tenant)
  'contractor1@test.com': {
    id: 'contractor-1',
    email: 'contractor1@test.com',
    password: 'contractor123',
    name: 'John Smith',
    role: USER_ROLES.CONTRACTOR,
    company: 'Smith Roofing LLC',
    tenantId: 'tenant-smith-roofing',
    createdAt: '2025-01-15'
  },
  
  'contractor2@demo.com': {
    id: 'contractor-2',
    email: 'contractor2@demo.com',
    password: 'demo123',
    name: 'Sarah Johnson',
    role: USER_ROLES.CONTRACTOR,
    company: 'Johnson Construction',
    tenantId: 'tenant-johnson-const',
    createdAt: '2025-01-20'
  }
};

// Simple login function
export const loginUser = (email, password) => {
  const user = MOCK_USERS[email];
  
  if (user && user.password === password) {
    // Don't store password
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  
  return null;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Logout function
export const logoutUser = () => {
  localStorage.removeItem(AUTH_KEY);
};

// Check if user has specific role
export const hasRole = (user, role) => {
  return user && user.role === role;
};

// Check if user is super admin
export const isSuperAdmin = (user) => {
  return hasRole(user, USER_ROLES.SUPER_ADMIN);
};

// Check if user is contractor
export const isContractor = (user) => {
  return hasRole(user, USER_ROLES.CONTRACTOR);
};

// Get all contractors (for super admin view)
export const getAllContractors = () => {
  return Object.values(MOCK_USERS).filter(user => user.role === USER_ROLES.CONTRACTOR);
};

// SaaS tenant utilities
export const getTenantData = (tenantId) => {
  // In real SaaS, this would fetch tenant-specific data from backend
  // For now, return mock data based on tenant
  return {
    tenantId,
    settings: {
      companyName: MOCK_USERS[Object.keys(MOCK_USERS).find(email => 
        MOCK_USERS[email].tenantId === tenantId
      )]?.company || 'Unknown Company',
      theme: 'default',
      features: ['takeoffs', 'customers', 'insurance']
    }
  };
};