import React from 'react';

export const MobileHeader: React.FC = () => {
  return (
    <div className="md:hidden bg-gray-800 border-b border-gray-700">
      <div className="px-4 py-3">
        <h1 className="text-white text-lg font-bold">
          Average Joe's Takeoffs
        </h1>
      </div>
    </div>
  );
};