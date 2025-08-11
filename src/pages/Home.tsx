import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calculator, Clock, DollarSign } from 'lucide-react';
import type { Project } from '../types';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Johnson Residence Roof',
    date: '2025-08-05',
    amount: 15750,
    status: 'completed'
  },
  {
    id: '2',
    name: 'Maple Street Commercial',
    date: '2025-08-03',
    amount: 32400,
    status: 'in_progress'
  },
  {
    id: '3',
    name: 'Oak Valley Subdivision',
    date: '2025-08-01',
    amount: 8900,
    status: 'pending'
  }
];

export const Home: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-full">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Average Joe's Takeoffs
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Professional roofing estimates and contractor management made simple
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Link
                to="/profile"
                className="group bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
              >
                <User className="h-6 w-6" />
                <span>Contractor Profile</span>
              </Link>
              
              <Link
                to="/takeoffs"
                className="group bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
              >
                <Calculator className="h-6 w-6" />
                <span>New Takeoff</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {project.name}
                  </h3>
                  <span
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${getStatusColor(project.status)}
                    `}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDate(project.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-900">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-lg font-semibold">
                      {formatCurrency(project.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};