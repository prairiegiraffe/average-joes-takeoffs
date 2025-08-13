import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Users, Calculator } from 'lucide-react';

const mobileNavItems = [
  { id: 'home', name: 'Home', href: '/', icon: Home },
  { id: 'profile', name: 'Profile', href: '/profile', icon: User },
  { id: 'customers', name: 'Customers', href: '/customers', icon: Users },
  { id: 'takeoffs', name: 'Takeoffs', href: '/takeoffs', icon: Calculator },
];

export const MobileNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="md:hidden">
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="px-2 py-2">
          <div className="flex justify-around">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`
                    flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium
                    ${isActive
                      ? 'text-white bg-gray-900'
                      : 'text-gray-400 hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};