import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Users, 
  Truck, 
  Shield, 
  Calculator 
} from 'lucide-react';
import type { NavigationItem } from '../types';

const navigationItems: NavigationItem[] = [
  { id: 'home', name: 'Home', href: '/', icon: Home, current: false },
  { id: 'profile', name: 'Contractor Profile', href: '/profile', icon: User, current: false },
  { id: 'customers', name: 'Customers', href: '/customers', icon: Users, current: false },
  { id: 'distributors', name: 'Distributors', href: '/distributors', icon: Truck, current: false },
  { id: 'insurance', name: 'Insurance', href: '/insurance', icon: Shield, current: false },
  { id: 'takeoffs', name: 'Takeoffs', href: '/takeoffs', icon: Calculator, current: false },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

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
      </div>
    </div>
  );
};