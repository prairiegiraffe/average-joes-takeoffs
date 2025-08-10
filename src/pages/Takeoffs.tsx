import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, DollarSign, MapPin, User, FileText, Play, Building, Package, Palette } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import RoofingCalculator from '../components/RoofingCalculator';
import SidingCalculator from '../components/SidingCalculator';
import type { TakeoffProject, TakeoffType, TakeoffStatus, Customer, Manufacturer, ManufacturerSelection, ManufacturerCategory } from '../types';

// Takeoff type configurations
const TAKEOFF_TYPES: { id: TakeoffType; name: string; icon: string; color: string; description: string }[] = [
  { id: 'roofing', name: 'Roofing', icon: '🏠', color: 'bg-blue-100 text-blue-800', description: 'Complete roofing takeoff with elevation workflow' },
  { id: 'siding', name: 'Siding', icon: '🏘️', color: 'bg-teal-100 text-teal-800', description: 'Siding material and labor estimation' },
  { id: 'windows', name: 'Windows', icon: '🪟', color: 'bg-cyan-100 text-cyan-800', description: 'Window installation and replacement' },
  { id: 'gutters', name: 'Gutters', icon: '🌧️', color: 'bg-indigo-100 text-indigo-800', description: 'Gutter system installation and repair' },
  { id: 'insulation', name: 'Insulation', icon: '🧊', color: 'bg-purple-100 text-purple-800', description: 'Insulation installation and upgrades' },
  { id: 'flooring', name: 'Flooring', icon: '🏗️', color: 'bg-orange-100 text-orange-800', description: 'Flooring installation and refinishing' },
  { id: 'drywall', name: 'Drywall', icon: '🧱', color: 'bg-gray-100 text-gray-800', description: 'Drywall installation and finishing' },
  { id: 'painting', name: 'Painting', icon: '🎨', color: 'bg-pink-100 text-pink-800', description: 'Interior and exterior painting' },
  { id: 'general', name: 'General Contracting', icon: '👷', color: 'bg-green-100 text-green-800', description: 'General contracting and renovation' }
];

// Sample takeoff data
const createSampleTakeoffs = (): TakeoffProject[] => [
  {
    id: '1',
    name: 'Johnson Residence Roof Replacement',
    type: 'roofing',
    customerId: '1', // This should match customer IDs
    customerName: 'John Johnson',
    customerEmail: 'john@email.com',
    projectAddress: '1234 Oak Street, Phoenix, AZ 85001',
    status: 'completed',
    estimatedValue: 15750,
    actualCost: 14200,
    notes: 'Complete roof replacement with architectural shingles. Customer requested premium materials.',
    createdDate: new Date('2024-07-01'),
    updatedDate: new Date('2024-07-15'),
    completedDate: new Date('2024-07-15'),
    totalSquareFeet: 2400,
    totalBundles: 72,
    totalUnderlayment: 24
  },
  {
    id: '2',
    name: 'Smith Home Siding Project',
    type: 'siding',
    customerId: '2',
    customerName: 'Sarah Smith',
    customerEmail: 'sarah@email.com',
    projectAddress: '5678 Pine Avenue, Scottsdale, AZ 85260',
    status: 'in_progress',
    estimatedValue: 22500,
    notes: 'Vinyl siding replacement on front and side elevations. Color: Harbor Blue.',
    createdDate: new Date('2024-07-20'),
    updatedDate: new Date('2024-08-01')
  },
  {
    id: '3',
    name: 'Wilson Window Replacement',
    type: 'windows',
    customerId: '3',
    customerName: 'Mike Wilson',
    customerEmail: 'mike@email.com',
    projectAddress: '9876 Desert View Drive, Tempe, AZ 85281',
    status: 'sent',
    estimatedValue: 8900,
    notes: '12 windows - double hung, energy efficient. Customer wants white frames.',
    createdDate: new Date('2024-08-05'),
    updatedDate: new Date('2024-08-05'),
    sentDate: new Date('2024-08-05')
  },
  {
    id: '4',
    name: 'Commercial Gutter System',
    type: 'gutters',
    customerName: 'Phoenix Office Complex',
    customerEmail: 'facilities@phoenixoffice.com',
    projectAddress: '2468 Business Blvd, Phoenix, AZ 85003',
    status: 'draft',
    estimatedValue: 12000,
    notes: 'Large commercial building - seamless gutters with downspouts.',
    createdDate: new Date('2024-08-08'),
    updatedDate: new Date('2024-08-08')
  }
];

export const Takeoffs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [takeoffs, setTakeoffs] = useState<TakeoffProject[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredTakeoffs, setFilteredTakeoffs] = useState<TakeoffProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<TakeoffType | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<TakeoffStatus | 'all'>('all');
  const [showNewTakeoffModal, setShowNewTakeoffModal] = useState(false);
  const [showTakeoffDetail, setShowTakeoffDetail] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [selectedTakeoff, setSelectedTakeoff] = useState<TakeoffProject | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'calculator'>('list');

  // Initialize with sample data
  useEffect(() => {
    // Check if we should open calculator for editing
    const shouldOpenCalculator = localStorage.getItem('openCalculator');
    if (shouldOpenCalculator === 'true') {
      setCurrentView('calculator');
      localStorage.removeItem('openCalculator');
    }
    
    // Load takeoffs from multiple sources
    const savedTakeoffs = localStorage.getItem('takeoffs');
    const savedTakeoffProjects = localStorage.getItem('takeoff-projects');
    
    let allTakeoffs = [];
    
    // Load from 'takeoffs' key (legacy)
    if (savedTakeoffs) {
      try {
        const parsed = JSON.parse(savedTakeoffs);
        const takeoffsWithDates = parsed.map((takeoff: any) => ({
          ...takeoff,
          createdDate: new Date(takeoff.createdDate),
          updatedDate: new Date(takeoff.updatedDate),
          completedDate: takeoff.completedDate ? new Date(takeoff.completedDate) : undefined,
          sentDate: takeoff.sentDate ? new Date(takeoff.sentDate) : undefined
        }));
        allTakeoffs = [...allTakeoffs, ...takeoffsWithDates];
      } catch (error) {
        console.error('Error parsing takeoffs:', error);
      }
    }
    
    // Load from 'takeoff-projects' key (current)
    if (savedTakeoffProjects) {
      try {
        const parsed = JSON.parse(savedTakeoffProjects);
        const takeoffsWithDates = parsed.map((takeoff: any) => ({
          ...takeoff,
          createdDate: new Date(takeoff.createdDate),
          updatedDate: new Date(takeoff.updatedDate),
          completedDate: takeoff.completedDate ? new Date(takeoff.completedDate) : undefined,
          sentDate: takeoff.sentDate ? new Date(takeoff.sentDate) : undefined
        }));
        allTakeoffs = [...allTakeoffs, ...takeoffsWithDates];
      } catch (error) {
        console.error('Error parsing takeoff-projects:', error);
      }
    }
    
    // Remove duplicates based on ID
    const uniqueTakeoffs = allTakeoffs.filter((takeoff, index, self) => 
      index === self.findIndex((t) => t.id === takeoff.id)
    );
    
    if (uniqueTakeoffs.length > 0) {
      // Sort by most recent first
      const sortedTakeoffs = uniqueTakeoffs.sort((a, b) => 
        new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
      );
      setTakeoffs(sortedTakeoffs);
    } else {
      // Only use sample data if no real takeoffs exist
      const sampleData = createSampleTakeoffs();
      setTakeoffs(sampleData);
      localStorage.setItem('takeoffs', JSON.stringify(sampleData));
    }

    // Load customers
    const savedCustomers = localStorage.getItem('averageJoeCustomers');
    if (savedCustomers) {
      try {
        const parsed = JSON.parse(savedCustomers);
        if (Array.isArray(parsed)) {
          const customersWithDates = parsed.map((customer: any) => ({
            ...customer,
            lastContact: new Date(customer.lastContact),
            createdDate: new Date(customer.createdDate),
            updatedDate: new Date(customer.updatedDate)
          }));
          setCustomers(customersWithDates);
          console.log('Loaded customers:', customersWithDates.length);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomers([]);
      }
    } else {
      console.log('No customers found in localStorage');
      setCustomers([]);
    }

    // Load manufacturers
    const savedManufacturers = localStorage.getItem('manufacturers');
    if (savedManufacturers) {
      try {
        const parsed = JSON.parse(savedManufacturers);
        if (Array.isArray(parsed)) {
          const manufacturersWithDates = parsed.map((manufacturer: any) => ({
            ...manufacturer,
            createdDate: new Date(manufacturer.createdDate),
            updatedDate: new Date(manufacturer.updatedDate)
          }));
          setManufacturers(manufacturersWithDates);
        }
      } catch (error) {
        console.error('Error loading manufacturers:', error);
        setManufacturers([]);
      }
    }
  }, []);

  // Save takeoffs to localStorage whenever they change (but avoid initial save to prevent loops)
  useEffect(() => {
    if (takeoffs.length > 0 && takeoffs !== createSampleTakeoffs()) {
      // Save to both keys for compatibility
      localStorage.setItem('takeoffs', JSON.stringify(takeoffs));
      localStorage.setItem('takeoff-projects', JSON.stringify(takeoffs));
    }
  }, [takeoffs]);

  // Handle URL parameters to open specific takeoff details
  useEffect(() => {
    if (takeoffs.length > 0) {
      const takeoffId = searchParams.get('takeoffId');
      const action = searchParams.get('action');
      
      if (takeoffId && action === 'view') {
        const takeoff = takeoffs.find(t => t.id === takeoffId);
        if (takeoff) {
          setSelectedTakeoff(takeoff);
          setShowTakeoffDetail(true);
          // Clear the URL parameters after opening modal
          setSearchParams(new URLSearchParams());
        }
      }
    }
  }, [takeoffs, searchParams, setSearchParams]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...takeoffs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(takeoff =>
        takeoff.name.toLowerCase().includes(query) ||
        takeoff.customerName?.toLowerCase().includes(query) ||
        takeoff.projectAddress.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (selectedTypeFilter !== 'all') {
      filtered = filtered.filter(takeoff => takeoff.type === selectedTypeFilter);
    }

    // Status filter
    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(takeoff => takeoff.status === selectedStatusFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());

    setFilteredTakeoffs(filtered);
  }, [takeoffs, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  // Get takeoff type configuration
  const getTakeoffTypeConfig = (type: TakeoffType) => {
    return TAKEOFF_TYPES.find(t => t.id === type) || TAKEOFF_TYPES[0];
  };

  // Get status color
  const getStatusColor = (status: TakeoffStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'declined': return 'bg-red-100 text-red-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'TBD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle starting a roofing calculator for a takeoff
  const handleStartRoofingCalculator = (takeoff: TakeoffProject) => {
    // Store the takeoff data for editing
    localStorage.setItem('editingTakeoff', JSON.stringify(takeoff));
    
    setSelectedTakeoff(takeoff);
    setCurrentView('calculator');
  };

  // Handle starting a siding calculator for a takeoff
  const handleStartSidingCalculator = (takeoff: TakeoffProject) => {
    // Store the takeoff data for editing
    localStorage.setItem('editingTakeoff', JSON.stringify(takeoff));
    
    setSelectedTakeoff(takeoff);
    setCurrentView('calculator');
  };

  // Refresh takeoffs from localStorage
  const refreshTakeoffs = () => {
    const savedTakeoffProjects = localStorage.getItem('takeoff-projects');
    if (savedTakeoffProjects) {
      try {
        const parsed = JSON.parse(savedTakeoffProjects);
        const takeoffsWithDates = parsed.map((takeoff: any) => ({
          ...takeoff,
          createdDate: new Date(takeoff.createdDate),
          updatedDate: new Date(takeoff.updatedDate),
          completedDate: takeoff.completedDate ? new Date(takeoff.completedDate) : undefined,
          sentDate: takeoff.sentDate ? new Date(takeoff.sentDate) : undefined
        }));
        
        // Sort by most recent first
        const sortedTakeoffs = takeoffsWithDates.sort((a, b) => 
          new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
        );
        
        setTakeoffs(sortedTakeoffs);
      } catch (error) {
        console.error('Error refreshing takeoffs:', error);
      }
    }
  };

  // Handle back to list from calculator
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTakeoff(null);
    // Refresh the takeoffs list when coming back from calculator
    refreshTakeoffs();
  };

  // Show calculator view
  if (currentView === 'calculator') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ← Back to Takeoffs
          </button>
          {selectedTakeoff && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedTakeoff.name}</h2>
              <p className="text-gray-600">{selectedTakeoff.projectAddress}</p>
            </div>
          )}
        </div>
        {selectedTakeoff?.type === 'roofing' && <RoofingCalculator />}
        {selectedTakeoff?.type === 'siding' && <SidingCalculator />}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Takeoffs</h1>
            <p className="mt-2 text-gray-600">Manage your project estimates and takeoffs</p>
          </div>
          <button
            onClick={() => setShowNewTakeoffModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Takeoff
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Takeoffs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{takeoffs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Play className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {takeoffs.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {takeoffs.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(takeoffs.reduce((sum, t) => sum + (t.estimatedValue || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project name, customer, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:w-64">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as TakeoffType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {TAKEOFF_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as TakeoffStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredTakeoffs.length} of {takeoffs.length} takeoffs
        </p>
      </div>

      {/* Takeoff List */}
      <div className="space-y-4">
        {filteredTakeoffs.map((takeoff) => {
          const typeConfig = getTakeoffTypeConfig(takeoff.type);
          
          return (
            <div key={takeoff.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{typeConfig.icon}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{takeoff.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig.color}`}>
                            {typeConfig.name}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(takeoff.status)}`}>
                            {takeoff.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {takeoff.customerName && (
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm">{takeoff.customerName}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{takeoff.projectAddress}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">Created {formatDate(takeoff.createdDate)}</span>
                      </div>
                      {takeoff.estimatedValue && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(takeoff.estimatedValue)}
                          </span>
                        </div>
                      )}
                    </div>

                    {takeoff.notes && (
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm text-gray-700">{takeoff.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => {
                        setSelectedTakeoff(takeoff);
                        setShowTakeoffDetail(true);
                      }}
                      className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      View Details
                    </button>
                    
                    {takeoff.type === 'roofing' && (
                      <button 
                        onClick={() => handleStartRoofingCalculator(takeoff)}
                        className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    )}

                    {takeoff.type === 'siding' && (
                      <button 
                        onClick={() => handleStartSidingCalculator(takeoff)}
                        className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTakeoffs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">No takeoffs found</p>
            <p className="text-sm">Create your first takeoff to get started</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewTakeoffModal && (
        <NewTakeoffModal
          customers={customers}
          onClose={() => setShowNewTakeoffModal(false)}
          onSave={(newTakeoff) => {
            const takeoffWithId = {
              ...newTakeoff,
              id: Date.now().toString(),
              createdDate: new Date(),
              updatedDate: new Date(),
              status: 'draft' as TakeoffStatus
            };
            setTakeoffs(prev => [takeoffWithId, ...prev]);
            setShowNewTakeoffModal(false);
            
            // If it's a roofing or siding takeoff, start the calculator immediately
            if (newTakeoff.type === 'roofing' || newTakeoff.type === 'siding') {
              setSelectedTakeoff(takeoffWithId);
              setCurrentView('calculator');
            }
          }}
        />
      )}

      {showTakeoffDetail && selectedTakeoff && (
        <TakeoffDetailModal
          takeoff={selectedTakeoff}
          onClose={() => {
            setShowTakeoffDetail(false);
            setSelectedTakeoff(null);
          }}
          onStartCalculator={
            selectedTakeoff.type === 'roofing' || selectedTakeoff.type === 'siding'
              ? () => {
                  setShowTakeoffDetail(false);
                  setCurrentView('calculator');
                }
              : undefined
          }
          onSelectManufacturers={() => {
            setShowTakeoffDetail(false);
            setShowManufacturerModal(true);
          }}
        />
      )}

      {/* Manufacturer Selection Modal */}
      {showManufacturerModal && selectedTakeoff && (
        <ManufacturerSelectionModal
          takeoff={selectedTakeoff}
          manufacturers={manufacturers}
          onClose={() => {
            setShowManufacturerModal(false);
            setShowTakeoffDetail(true);
          }}
          onSave={(selections) => {
            // Save manufacturer selections to takeoff
            const updatedTakeoff = {
              ...selectedTakeoff,
              manufacturerSelections: selections,
              updatedDate: new Date()
            };
            setTakeoffs(prev => prev.map(t => t.id === selectedTakeoff.id ? updatedTakeoff : t));
            setSelectedTakeoff(updatedTakeoff);
            setShowManufacturerModal(false);
            setShowTakeoffDetail(true);
          }}
        />
      )}
    </div>
  );
};

// Manufacturer Selection Modal Component
interface ManufacturerSelectionModalProps {
  takeoff: TakeoffProject;
  manufacturers: Manufacturer[];
  onClose: () => void;
  onSave: (selections: ManufacturerSelection[]) => void;
}

const ManufacturerSelectionModal: React.FC<ManufacturerSelectionModalProps> = ({
  takeoff,
  manufacturers,
  onClose,
  onSave
}) => {
  const [selections, setSelections] = useState<ManufacturerSelection[]>(
    takeoff.manufacturerSelections || []
  );
  const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ManufacturerCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter manufacturers based on takeoff type and search/category filters
  useEffect(() => {
    let filtered = manufacturers.filter(m => m.isActive);

    // Filter by takeoff type category
    if (takeoff.type !== 'general') {
      filtered = filtered.filter(m => 
        m.categories.includes(takeoff.type as ManufacturerCategory)
      );
    }

    // Apply additional category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.categories.includes(selectedCategory));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.productLines.some(pl => pl.name.toLowerCase().includes(query))
      );
    }

    setFilteredManufacturers(filtered);
  }, [manufacturers, takeoff.type, selectedCategory, searchQuery]);

  const handleAddSelection = (
    manufacturer: Manufacturer,
    productLineId: string,
    colorId: string
  ) => {
    const productLine = manufacturer.productLines.find(pl => pl.id === productLineId);
    const color = productLine?.colors.find(c => c.id === colorId);
    
    if (!productLine || !color) return;

    const newSelection: ManufacturerSelection = {
      manufacturerId: manufacturer.id,
      manufacturerName: manufacturer.name,
      productLineId: productLine.id,
      productLineName: productLine.name,
      colorId: color.id,
      colorName: color.name,
      colorHex: color.hexCode,
      category: productLine.category,
      pricePerUnit: productLine.pricePerUnit,
      unit: productLine.unit
    };

    setSelections(prev => {
      // Remove any existing selection for this manufacturer/product line
      const filtered = prev.filter(s => 
        !(s.manufacturerId === manufacturer.id && s.productLineId === productLine.id)
      );
      return [...filtered, newSelection];
    });
  };

  const handleRemoveSelection = (manufacturerId: string, productLineId: string) => {
    setSelections(prev => prev.filter(s => 
      !(s.manufacturerId === manufacturerId && s.productLineId === productLineId)
    ));
  };

  const categories: { id: ManufacturerCategory | 'all'; name: string }[] = [
    { id: 'all', name: 'All Categories' },
    { id: 'roofing', name: 'Roofing' },
    { id: 'siding', name: 'Siding' },
    { id: 'windows', name: 'Windows' },
    { id: 'gutters', name: 'Gutters' },
    { id: 'insulation', name: 'Insulation' },
    { id: 'flooring', name: 'Flooring' },
    { id: 'drywall', name: 'Drywall' },
    { id: 'painting', name: 'Painting' },
    { id: 'general', name: 'General' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Select Manufacturers</h3>
            <p className="text-gray-600 mt-1">
              Choose manufacturers and products for: <span className="font-medium">{takeoff.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Current Selections */}
        {selections.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Selected Manufacturers ({selections.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selections.map((selection, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">{selection.manufacturerName}</h5>
                      <p className="text-sm text-gray-700">{selection.productLineName}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: selection.colorHex || '#ccc' }}
                        />
                        <span className="text-sm text-gray-600">{selection.colorName}</span>
                      </div>
                      {selection.pricePerUnit && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          ${selection.pricePerUnit}/{selection.unit}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSelection(selection.manufacturerId, selection.productLineId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search manufacturers or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ManufacturerCategory | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Available Manufacturers */}
        <div className="space-y-6">
          {filteredManufacturers.map(manufacturer => (
            <div key={manufacturer.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{manufacturer.name}</h5>
                      <p className="text-sm text-gray-600">
                        {manufacturer.productLines.length} product lines available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {manufacturer.productLines
                    .filter(pl => pl.isActive && (selectedCategory === 'all' || pl.category === selectedCategory))
                    .map(productLine => (
                    <div key={productLine.id} className="border border-gray-200 rounded-md p-4">
                      <div className="mb-3">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100">{productLine.name}</h6>
                        <p className="text-sm text-gray-600">{productLine.description}</p>
                        {productLine.pricePerUnit && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            ${productLine.pricePerUnit}/{productLine.unit}
                          </p>
                        )}
                      </div>
                      
                      {/* Color Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Select Color:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {productLine.colors.map(color => {
                            const isSelected = selections.some(s => 
                              s.manufacturerId === manufacturer.id && 
                              s.productLineId === productLine.id && 
                              s.colorId === color.id
                            );
                            
                            return (
                              <button
                                key={color.id}
                                onClick={() => handleAddSelection(manufacturer, productLine.id, color.id)}
                                className={`flex items-center space-x-2 p-2 rounded-md border transition-colors ${
                                  isSelected 
                                    ? 'bg-green-50 border-green-300 text-green-800' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color.hexCode || '#ccc' }}
                                />
                                <span className="text-sm">{color.name}</span>
                                {isSelected && <span className="ml-auto">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredManufacturers.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-500">No manufacturers found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selections.length} manufacturer{selections.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(selections)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Save Selections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// New Takeoff Modal Component
interface NewTakeoffData {
  name: string;
  type: TakeoffType;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  projectAddress: string;
  estimatedValue?: number;
  notes: string;
}

const NewTakeoffModal: React.FC<{
  customers: Customer[];
  onClose: () => void;
  onSave: (data: NewTakeoffData) => void;
}> = ({ customers, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewTakeoffData>({
    name: '',
    type: 'roofing',
    projectAddress: '',
    notes: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.projectAddress) {
      alert('Please fill in all required fields');
      return;
    }

    const submitData = {
      ...formData,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerEmail: selectedCustomer?.email
    };

    onSave(submitData);
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'none') {
      setSelectedCustomer(null);
      return;
    }
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      // Auto-fill project address if available
      if (customer.projectAddress && !formData.projectAddress) {
        setFormData(prev => ({ ...prev, projectAddress: customer.projectAddress }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create New Takeoff</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Takeoff Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TakeoffType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TAKEOFF_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {TAKEOFF_TYPES.find(t => t.id === formData.type)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <select
                value={selectedCustomer?.id || 'none'}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No customer selected</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.projectAddress}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {customers.length === 0 ? 'No customers found. Add customers first in the Customers section.' : `${customers.length} customers available`}
              </p>
            </div>

            {selectedCustomer && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Customer</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Name:</strong> {selectedCustomer.name}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  <p><strong>Project Type:</strong> {selectedCustomer.projectType}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address *</label>
              <input
                type="text"
                value={formData.projectAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, projectAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value ($)</label>
              <input
                type="number"
                value={formData.estimatedValue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional - estimated project value"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Additional notes about this takeoff..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Create Takeoff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Takeoff Detail Modal Component
const TakeoffDetailModal: React.FC<{
  takeoff: TakeoffProject;
  onClose: () => void;
  onStartCalculator?: () => void;
  onSelectManufacturers?: () => void;
}> = ({ takeoff, onClose, onStartCalculator, onSelectManufacturers }) => {
  const typeConfig = TAKEOFF_TYPES.find(t => t.id === takeoff.type) || TAKEOFF_TYPES[0];

  const getStatusColor = (status: TakeoffStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'declined': return 'bg-red-100 text-red-800';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'TBD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">{typeConfig.icon}</span>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{takeoff.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${typeConfig.color}`}>
                    {typeConfig.name}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(takeoff.status)}`}>
                    {takeoff.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {onSelectManufacturers && (
              <button
                onClick={onSelectManufacturers}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors inline-flex items-center"
              >
                <Building className="h-4 w-4 mr-2" />
                Select Manufacturers
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Project Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-medium text-gray-700">Address</span>
                  <span className="text-gray-900 dark:text-gray-100">{takeoff.projectAddress}</span>
                </div>
                {takeoff.customerName && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Customer</span>
                    <span className="text-gray-900 dark:text-gray-100">{takeoff.customerName}</span>
                    {takeoff.customerEmail && (
                      <span className="text-gray-600 ml-2">({takeoff.customerEmail})</span>
                    )}
                  </div>
                )}
                <div>
                  <span className="block text-sm font-medium text-gray-700">Created</span>
                  <span className="text-gray-900 dark:text-gray-100">{takeoff.createdDate.toLocaleDateString()}</span>
                </div>
                {takeoff.updatedDate.getTime() !== takeoff.createdDate.getTime() && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Last Updated</span>
                    <span className="text-gray-900 dark:text-gray-100">{takeoff.updatedDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Financial Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-medium text-gray-700">Estimated Value</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(takeoff.estimatedValue)}
                  </span>
                </div>
                {takeoff.actualCost && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Actual Cost</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(takeoff.actualCost)}
                    </span>
                  </div>
                )}
                {takeoff.totalSquareFeet && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Total Square Feet</span>
                    <span className="text-gray-900 dark:text-gray-100">{takeoff.totalSquareFeet.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturer Selections */}
        {takeoff.manufacturerSelections && takeoff.manufacturerSelections.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Selected Manufacturers ({takeoff.manufacturerSelections.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {takeoff.manufacturerSelections.map((selection, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Building className="h-5 w-5 text-blue-600 mr-2" />
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">{selection.manufacturerName}</h5>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-700">
                          <Package className="h-4 w-4 mr-2" />
                          <span>{selection.productLineName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Palette className="h-4 w-4 mr-2" />
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                            style={{ backgroundColor: selection.colorHex || '#ccc' }}
                          />
                          <span>{selection.colorName}</span>
                        </div>
                        {selection.pricePerUnit && (
                          <div className="text-sm text-green-600 font-medium">
                            ${selection.pricePerUnit}/{selection.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {takeoff.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Notes</h4>
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-gray-700">{takeoff.notes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};