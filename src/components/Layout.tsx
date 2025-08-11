import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <MobileHeader />
        
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-10">
          <MobileNavigation />
        </div>
      </div>
    </div>
  );
};