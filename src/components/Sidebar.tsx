import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Users, 
  Truck, 
  Shield, 
  Calculator,
  Building
} from 'lucide-react';
import type { NavigationItem, ContractorProfile } from '../types';
import { getCurrentUser } from '../utils/auth';

const navigationItems: NavigationItem[] = [
  { id: 'home', name: 'Home', href: '/', icon: Home, current: false },
  { id: 'profile', name: 'Contractor Profile', href: '/profile', icon: User, current: false },
  { id: 'customers', name: 'Customers', href: '/customers', icon: Users, current: false },
  { id: 'distributors', name: 'Distributors', href: '/distributors', icon: Truck, current: false },
  { id: 'manufacturers', name: 'Manufacturers', href: '/manufacturers', icon: Building, current: false },
  { id: 'takeoffs', name: 'Takeoffs', href: '/takeoffs', icon: Calculator, current: false },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [contractorProfile, setContractorProfile] = useState<ContractorProfile | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log('Sidebar - currentUser:', currentUser);
    
    // Always show contractor profile, use currentUser data if available
    const completeProfile: ContractorProfile = {
      businessName: currentUser?.company || 'Smith Roofing LLC',
      contactName: currentUser?.name || 'John Smith',
      email: currentUser?.email || 'john@smithroofing.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      website: 'www.smithroofing.com',
      licenseNumber: 'IL-ROOF-12345',
      yearsInBusiness: 8,
      specialties: ['roofing', 'siding', 'gutters'],
      documents: {
        w9: [],
        license: [],
        insurance: [],
        certificates: []
      }
    };
    console.log('Sidebar - setting complete profile:', completeProfile);
    setContractorProfile(completeProfile);
    localStorage.setItem('contractorProfile', JSON.stringify(completeProfile));
  }, []);

  const updatedNavItems = navigationItems.map(item => ({
    ...item,
    current: location.pathname === item.href
  }));

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-white text-xl font-bold">
              Average Joe's Takeoffs
            </h1>
          </div>
          
          {/* DEBUG: Visible indicator for deployment verification */}
          <div className="px-4 py-2 bg-green-600 text-white text-xs">
            Deploy: v1.5.1 - Contractor Info Added
          </div>
          
          {/* Contractor Info Section */}
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="text-white">
              <div className="text-sm font-medium text-gray-300 mb-2">Contractor Info</div>
              {contractorProfile ? (
                <div className="space-y-1 text-xs">
                  <div className="font-medium">{contractorProfile.businessName}</div>
                  <div className="text-gray-400">{contractorProfile.contactName}</div>
                  <div className="text-gray-400">{contractorProfile.address}</div>
                  <div className="text-gray-400">{contractorProfile.city}, {contractorProfile.state} {contractorProfile.zip}</div>
                  <div className="text-gray-400">{contractorProfile.phone}</div>
                  <div className="text-gray-400">{contractorProfile.email}</div>
                  {contractorProfile.website && (
                    <div className="text-gray-400">{contractorProfile.website}</div>
                  )}
                  <div className="text-gray-400">License: {contractorProfile.licenseNumber}</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">Loading contractor info...</div>
              )}
            </div>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {updatedNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${item.current
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Version Number */}
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex items-center w-full">
            <div className="text-xs text-gray-400">
              <div className="font-medium">Version 1.5.1</div>
              <div>With Contractor Info Display</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};