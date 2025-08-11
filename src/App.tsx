import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser, isSuperAdmin, isContractor } from './utils/auth';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import RoofingCalculator from './components/RoofingCalculator';
import { Profile } from './pages/Profile';
import { Customers } from './pages/Customers';
import { Distributors } from './pages/Distributors';
import { Subcontractors } from './pages/Subcontractors';
import { Manufacturers } from './pages/Manufacturers';
import { Takeoffs } from './pages/Takeoffs';
import GenericHardware from './pages/GenericHardware';
import { ThemeProvider } from './contexts/ThemeContext';

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
  { name: 'Manufacturers', href: '/manufacturers', icon: '🏢' },
  { name: 'Subcontractors', href: '/subcontractors', icon: '👷' },
  { name: 'Takeoffs', href: '/takeoffs', icon: '📊' },
];

// Sidebar Component
const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  
  // Add click handler to detect navigation issues
  const handleNavClick = (e) => {
    const href = e.currentTarget.getAttribute('href') || e.currentTarget.closest('a')?.getAttribute('href');
    const currentPath = location.pathname;
    
    if (href && href !== currentPath) {
      // Different route clicked, check if navigation actually happens
      setTimeout(() => {
        if (window.location.pathname === currentPath) {
          // Navigation failed, force refresh
          console.log('Navigation failed, triggering router refresh');
          window.dispatchEvent(new Event('routerRefresh'));
        }
      }, 200);
    } else if (href && href === currentPath) {
      // Same route clicked, force refresh immediately
      window.dispatchEvent(new Event('routerRefresh'));
    }
  };
  
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800 dark:bg-gray-950">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-white text-xl font-bold">
              Average Joe's Takeoffs
            </h1>
          </div>
          
          {/* User info */}
          {user && (
            <div className="px-4 py-3 border-b border-gray-700 dark:border-gray-800">
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {isSuperAdmin(user) ? '👑' : '🏗️'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{user.company}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-gray-900 dark:bg-gray-800 text-white'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Version Number */}
          <div className="px-4 pb-2">
            <div className="text-xs text-white font-medium">
              Version 1.5.0
            </div>
            <div className="text-xs text-gray-300">
              Roofing & Siding Calculators
            </div>
          </div>
          
          {/* Logout button */}
          <div className="px-2 pb-4">
            <button
              onClick={onLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white"
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
  
  // Add click handler to detect navigation issues  
  const handleNavClick = (e) => {
    const href = e.currentTarget.getAttribute('href') || e.currentTarget.closest('a')?.getAttribute('href');
    const currentPath = location.pathname;
    
    if (href && href !== currentPath) {
      // Different route clicked, check if navigation actually happens
      setTimeout(() => {
        if (window.location.pathname === currentPath) {
          // Navigation failed, force refresh
          console.log('Mobile navigation failed, triggering router refresh');
          window.dispatchEvent(new Event('routerRefresh'));
        }
      }, 200);
    } else if (href && href === currentPath) {
      // Same route clicked, force refresh immediately
      window.dispatchEvent(new Event('routerRefresh'));
    }
  };
  
  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="bg-gray-800 dark:bg-gray-950 border-b border-gray-700 dark:border-gray-800">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-white text-lg font-bold">
              Average Joe's Takeoffs
            </h1>
            {user && (
              <p className="text-xs text-gray-400 dark:text-gray-500">{user.company}</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 dark:text-gray-500 hover:text-white"
          >
            <span className="text-xl">🚪</span>
          </button>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 dark:bg-gray-950 border-t border-gray-700 dark:border-gray-800 z-10">
        <div className="px-2 py-2">
          <div className="flex justify-around">
            {mobileNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={`flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium ${
                  location.pathname === item.href
                    ? 'text-white bg-gray-900 dark:bg-gray-800'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-300'
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
const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [lastRoute, setLastRoute] = useState(location.pathname);
  const [routeChangeCount, setRouteChangeCount] = useState(0);
  
  // Detect navigation issues and auto-refresh
  useEffect(() => {
    if (location.pathname !== lastRoute) {
      setLastRoute(location.pathname);
      setRouteChangeCount(0);
    } else {
      // Same route but useEffect triggered - potential issue
      setRouteChangeCount(prev => {
        const newCount = prev + 1;
        if (newCount > 2) {
          // Navigation seems stuck, trigger refresh
          console.log('Navigation stuck detected, refreshing router');
          window.dispatchEvent(new Event('routerRefresh'));
          return 0;
        }
        return newCount;
      });
    }
  }, [location.pathname, lastRoute]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <MobileNav user={user} onLogout={onLogout} />
        <main key={location.pathname} className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
};

// Placeholder pages



const Insurance = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Insurance</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Insurance management coming soon...</p>
    </div>
  </div>
);


const Home = () => {
  const [businessStats, setBusinessStats] = useState({
    totalRevenue: 0,
    activeProjects: 0,
    completedProjects: 0,
    activeLeads: 0,
    pendingTakeoffs: 0,
    totalCustomers: 0,
    avgProjectValue: 0,
    monthlyRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Load real business data
  useEffect(() => {
    const loadBusinessData = () => {
      try {
        // Load customers data
        const customersData = localStorage.getItem('averageJoeCustomers');
        const customers = customersData ? JSON.parse(customersData) : [];

        // Load takeoffs data  
        const takeoffsData = localStorage.getItem('takeoffs');
        const takeoffs = takeoffsData ? JSON.parse(takeoffsData) : [];

        // Load distributors data
        const distributorsData = localStorage.getItem('averageJoeDistributors');
        const distributors = distributorsData ? JSON.parse(distributorsData) : [];

        // Load subcontractors data
        const subcontractorsData = localStorage.getItem('subcontractors');
        const subcontractors = subcontractorsData ? JSON.parse(subcontractorsData) : [];

        // Calculate business metrics
        const activeProjects = customers.filter(c => c.status === 'active_project').length;
        const completedProjects = customers.filter(c => c.status === 'closed_project').length;
        const activeLeads = customers.filter(c => c.status === 'active_lead').length;
        const totalRevenue = customers.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);
        const avgProjectValue = customers.length > 0 ? totalRevenue / customers.length : 0;
        
        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = customers
          .filter(c => {
            const date = new Date(c.lastContact);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

        setBusinessStats({
          totalRevenue,
          activeProjects,
          completedProjects, 
          activeLeads,
          pendingTakeoffs: takeoffs.filter(t => t.status === 'draft' || t.status === 'in_progress').length,
          totalCustomers: customers.length,
          avgProjectValue,
          monthlyRevenue
        });

        // Generate recent activity
        const activity = [
          ...customers.slice(-3).map(c => ({
            type: 'customer',
            title: `New customer: ${c.name}`,
            description: `${c.projectType} project - ${formatCurrency(c.estimatedValue)}`,
            date: c.createdDate,
            status: c.status,
            id: c.id,
            navigateTo: '/customers'
          })),
          ...takeoffs.slice(-2).map(t => ({
            type: 'takeoff',
            title: `Takeoff ${t.status}: ${t.name}`,
            description: t.customerName ? `For ${t.customerName}` : 'Internal project',
            date: t.updatedDate,
            status: t.status,
            id: t.id,
            navigateTo: '/takeoffs'
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        setRecentActivity(activity);

        // Generate alerts
        const newAlerts = [];
        
        // Overdue tasks
        const overdueTakeoffs = takeoffs.filter(t => {
          if (t.status === 'in_progress') {
            const daysSince = Math.floor((new Date() - new Date(t.updatedDate)) / (1000 * 60 * 60 * 24));
            return daysSince > 7;
          }
          return false;
        });
        
        if (overdueTakeoffs.length > 0) {
          newAlerts.push({
            type: 'warning',
            title: `${overdueTakeoffs.length} overdue takeoff${overdueTakeoffs.length > 1 ? 's' : ''}`,
            description: 'Some takeoffs have been in progress for over a week'
          });
        }

        // Expiring documents
        const expiringSoonSubcontractors = subcontractors.filter(s => s.insuranceStatus === 'expiring_soon');
        if (expiringSoonSubcontractors.length > 0) {
          // If there's just one, include their ID for direct navigation
          const firstExpiring = expiringSoonSubcontractors[0];
          newAlerts.push({
            type: 'warning', 
            title: `${expiringSoonSubcontractors.length} contractor${expiringSoonSubcontractors.length > 1 ? 's' : ''} with expiring insurance`,
            description: 'Review and update insurance documentation',
            targetId: expiringSoonSubcontractors.length === 1 ? firstExpiring.id : undefined,
            targetType: 'subcontractor'
          });
        }

        // Hot leads (recent active leads)
        const hotLeads = customers.filter(c => {
          if (c.status === 'active_lead') {
            const daysSince = Math.floor((new Date() - new Date(c.lastContact)) / (1000 * 60 * 60 * 24));
            return daysSince <= 3;
          }
          return false;
        }).length;

        if (hotLeads > 0) {
          newAlerts.push({
            type: 'success',
            title: `${hotLeads} hot lead${hotLeads > 1 ? 's' : ''} to follow up`,
            description: 'Recently contacted leads ready for conversion'
          });
        }

        setAlerts(newAlerts);

      } catch (error) {
        console.error('Error loading business data:', error);
      }
    };

    loadBusinessData();
  }, []);

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
      case 'completed': 
      case 'closed_project':
      case 'active_project': return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'active_lead': return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'dead_lead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'customer': return '👤';
      case 'takeoff': return '📊';
      case 'project': return '🏗️';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Business Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/customers" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pipeline Value</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(businessStats.totalRevenue)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Across all projects • Click to view</div>
              </div>
            </div>
          </Link>

          <Link to="/customers" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🏗️</div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{businessStats.activeProjects}</div>
                <div className="text-xs text-green-600 dark:text-green-400">{businessStats.completedProjects} completed • Click to view</div>
              </div>
            </div>
          </Link>

          <Link to="/customers" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🎯</div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Leads</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{businessStats.activeLeads}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">{businessStats.totalCustomers} total customers • Click to view</div>
              </div>
            </div>
          </Link>

          <Link to="/takeoffs" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📊</div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Takeoffs</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{businessStats.pendingTakeoffs}</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Need attention • Click to view</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/takeoffs" className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">New Takeoff</span>
            </Link>
            
            <Link to="/customers" className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Add Customer</span>
            </Link>
            
            <Link to="/manufacturers" className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <div className="text-2xl mb-2">🏢</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Manufacturers</span>
            </Link>
            
            <Link to="/distributors" className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
              <div className="text-2xl mb-2">🚚</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Distributors</span>
            </Link>
            
            <Link to="/subcontractors" className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
              <div className="text-2xl mb-2">👷</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Subcontractors</span>
            </Link>
            
            <Link to="/profile" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="text-2xl mb-2">⚙️</div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <Link
                      key={index}
                      to={activity.type === 'customer' ? `${activity.navigateTo}?customerId=${activity.id}&action=view` : 
                          activity.type === 'takeoff' ? `${activity.navigateTo}?takeoffId=${activity.id}&action=view` : 
                          activity.navigateTo}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0 text-lg">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(activity.date)}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">Click to view →</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Start by adding customers or creating takeoffs</p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts & Tasks */}
          <div className="space-y-6">
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alerts</h3>
                </div>
                <div className="p-4 space-y-3">
                  {alerts.map((alert, index) => {
                    // Determine navigation target based on alert type and specific IDs
                    const getNavigationTarget = (alert: any) => {
                      if (alert.targetType === 'subcontractor' && alert.targetId) {
                        return `/subcontractors?subcontractorId=${alert.targetId}&action=view`;
                      }
                      if (alert.targetType === 'takeoff' && alert.targetId) {
                        return `/takeoffs?takeoffId=${alert.targetId}&action=view`;
                      }
                      if (alert.targetType === 'customer' && alert.targetId) {
                        return `/customers?customerId=${alert.targetId}&action=view`;
                      }
                      
                      // Fallback to generic navigation
                      if (alert.title.includes('contractor') && alert.title.includes('insurance')) {
                        return '/subcontractors';
                      }
                      if (alert.title.includes('overdue takeoff')) {
                        return '/takeoffs';
                      }
                      if (alert.title.includes('hot lead')) {
                        return '/customers';
                      }
                      return '/';
                    };

                    const navigationTarget = getNavigationTarget(alert);

                    return (
                      <Link
                        key={index}
                        to={navigationTarget}
                        className={`block p-3 rounded-lg border-l-4 hover:shadow-md transition-all cursor-pointer ${
                          alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' :
                          alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-400 hover:bg-green-100 dark:hover:bg-green-900/30' :
                          'bg-blue-50 dark:bg-blue-900/20 border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 text-lg mr-3">
                            {alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✅' : 'ℹ️'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.title}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 ml-2">Click to view →</p>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">This Month</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(businessStats.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Project Value</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(businessStats.avgProjectValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {businessStats.totalCustomers > 0 ? Math.round((businessStats.activeProjects / businessStats.totalCustomers) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routerKey, setRouterKey] = useState(0);

  // Check for existing user on app load
  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setIsLoading(false);
  }, []);

  // Force router refresh if it gets stuck
  useEffect(() => {
    const handleRouterRefresh = () => {
      setRouterKey(prev => prev + 1);
    };
    
    window.addEventListener('routerRefresh', handleRouterRefresh);
    return () => window.removeEventListener('routerRefresh', handleRouterRefresh);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <ThemeProvider>
      {/* Loading state */}
      {isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl font-bold mb-4">Average Joe's Takeoffs</div>
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      )}

      {/* Not logged in - show login */}
      {!isLoading && !user && <Login onLogin={handleLogin} />}

      {/* Super Admin gets admin dashboard */}
      {!isLoading && user && isSuperAdmin(user) && (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}

      {/* Contractors get the regular app */}
      {!isLoading && user && !isSuperAdmin(user) && (
        <Router key={routerKey}>
          <Layout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/distributors" element={<Distributors />} />
              <Route path="/manufacturers" element={<Manufacturers />} />
              <Route path="/manufacturers/generic-hardware" element={<GenericHardware />} />
              <Route path="/subcontractors" element={<Subcontractors />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/takeoffs" element={<Takeoffs />} />
              <Route path="/calculator" element={<RoofingCalculator />} />
            </Routes>
          </Layout>
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;
