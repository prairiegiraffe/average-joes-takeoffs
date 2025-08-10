import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser, isSuperAdmin, isContractor } from './utils/auth';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import RoofingCalculator from './components/RoofingCalculator';
import { Profile } from './pages/Profile';
import { Customers } from './pages/Customers';

const mockProjects = [
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

// Navigation items
const navItems = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Profile', href: '/profile', icon: '👤' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Distributors', href: '/distributors', icon: '🚚' },
  { name: 'Insurance', href: '/insurance', icon: '🛡️' },
  { name: 'Takeoffs', href: '/takeoffs', icon: '📊' },
];

// Sidebar Component
const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-white text-xl font-bold">
              Average Joe's Takeoffs
            </h1>
          </div>
          
          {/* User info */}
          {user && (
            <div className="px-4 py-3 border-b border-gray-700">
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {isSuperAdmin(user) ? '👑' : '🏗️'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.company}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Logout button */}
          <div className="px-2 pb-4">
            <button
              onClick={onLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="mr-3 text-lg">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Navigation
const MobileNav = ({ user, onLogout }) => {
  const location = useLocation();
  const mobileNavItems = navItems.slice(0, 4); // Show first 4 items on mobile
  
  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-white text-lg font-bold">
              Average Joe's Takeoffs
            </h1>
            {user && (
              <p className="text-xs text-gray-400">{user.company}</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-white"
          >
            <span className="text-xl">🚪</span>
          </button>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-10">
        <div className="px-2 py-2">
          <div className="flex justify-around">
            {mobileNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium ${
                  location.pathname === item.href
                    ? 'text-white bg-gray-900'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout Component
const Layout = ({ children, user, onLogout }) => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar user={user} onLogout={onLogout} />
    <div className="md:pl-64 flex flex-col min-h-screen">
      <MobileNav user={user} onLogout={onLogout} />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  </div>
);

// Placeholder pages


const Distributors = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Distributors</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Distributor management coming soon...</p>
    </div>
  </div>
);

const Insurance = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Insurance</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Insurance management coming soon...</p>
    </div>
  </div>
);

const Takeoffs = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <RoofingCalculator />
  </div>
);

const Home = () => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-full">
      {/* Hero Section */}
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
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                Contractor Profile
              </button>
              
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                New Takeoff
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm">{formatDate(project.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-900">
                    <span className="text-lg font-semibold text-green-600">
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

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user on app load
  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl font-bold mb-4">Average Joe's Takeoffs</div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Not logged in - show login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Super Admin gets admin dashboard
  if (isSuperAdmin(user)) {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Contractors get the regular app
  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/distributors" element={<Distributors />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/takeoffs" element={<Takeoffs />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
