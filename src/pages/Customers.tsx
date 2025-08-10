import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  DollarSign,
  Calendar,
  Eye,
  X,
  Building,
  User,
  FileText
} from 'lucide-react';
import type { Customer, CustomerStatus, ProjectType, CustomerStats } from '../types';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'roofing', label: 'Roofing' },
  { value: 'siding', label: 'Siding' },
  { value: 'windows', label: 'Windows' },
  { value: 'gutters', label: 'Gutters' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'general', label: 'General Construction' }
];

const STATUS_LABELS = {
  active_project: 'Active Project',
  closed_project: 'Closed Project',
  active_lead: 'Active Lead',
  dead_lead: 'Dead Lead'
};

const STATUS_COLORS = {
  active_project: 'bg-green-100 text-green-800',
  closed_project: 'bg-blue-100 text-blue-800',
  active_lead: 'bg-gray-100 text-gray-800',
  dead_lead: 'bg-red-100 text-red-800'
};

// Mock data for development
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    projectAddress: '123 Oak Street, Springfield',
    projectType: 'roofing',
    estimatedValue: 15000,
    status: 'active_project',
    lastContact: new Date('2025-08-08'),
    notes: 'Needs new shingles after hail damage',
    createdDate: new Date('2025-07-15'),
    updatedDate: new Date('2025-08-08')
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'sarah.johnson@email.com',
    projectAddress: '456 Maple Ave, Springfield',
    projectType: 'siding',
    estimatedValue: 22000,
    status: 'active_lead',
    lastContact: new Date('2025-08-05'),
    notes: 'Interested in vinyl siding replacement',
    createdDate: new Date('2025-07-20'),
    updatedDate: new Date('2025-08-05')
  },
  {
    id: '3',
    name: 'Mike Davis',
    phone: '(555) 456-7890',
    email: 'mike.davis@email.com',
    projectAddress: '789 Pine Road, Springfield',
    projectType: 'roofing',
    estimatedValue: 18500,
    status: 'closed_project',
    lastContact: new Date('2025-07-30'),
    notes: 'Project completed successfully',
    createdDate: new Date('2025-06-10'),
    updatedDate: new Date('2025-07-30')
  },
  {
    id: '4',
    name: 'Lisa Wilson',
    phone: '(555) 321-0987',
    email: 'lisa.wilson@email.com',
    projectAddress: '321 Elm Street, Springfield',
    projectType: 'windows',
    estimatedValue: 8500,
    status: 'dead_lead',
    lastContact: new Date('2025-07-25'),
    notes: 'Decided to postpone project',
    createdDate: new Date('2025-07-01'),
    updatedDate: new Date('2025-07-25')
  }
];

interface CustomerModalProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    projectAddress: '',
    projectType: 'roofing',
    estimatedValue: 0,
    status: 'active_lead',
    notes: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        projectAddress: '',
        projectType: 'roofing',
        estimatedValue: 0,
        status: 'active_lead',
        notes: ''
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const customerData: Customer = {
      id: customer?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      projectAddress: formData.projectAddress || '',
      projectType: formData.projectType || 'roofing',
      estimatedValue: formData.estimatedValue || 0,
      status: formData.status || 'active_lead',
      notes: formData.notes || '',
      lastContact: now,
      createdDate: customer?.createdDate || now,
      updatedDate: now
    };
    onSave(customerData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type *</label>
              <select
                required
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Address *</label>
              <input
                type="text"
                required
                value={formData.projectAddress}
                onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St, City, State"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value ($) *</label>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active_lead">Active Lead</option>
                <option value="active_project">Active Project</option>
                <option value="closed_project">Closed Project</option>
                <option value="dead_lead">Dead Lead</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this customer or project..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {customer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEmail: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onEmail
}) => {
  if (!isOpen || !customer) return null;

  const projectTypeLabel = PROJECT_TYPES.find(pt => pt.value === customer.projectType)?.label || customer.projectType;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Project Type</p>
                  <p className="font-medium text-gray-900">{projectTypeLabel}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Project Address</p>
                  <p className="font-medium text-gray-900">{customer.projectAddress}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Value</p>
                  <p className="font-medium text-gray-900">${customer.estimatedValue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last Contact</p>
                  <p className="font-medium text-gray-900">{customer.lastContact.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[customer.status]}`}>
                  {STATUS_LABELS[customer.status]}
                </span>
              </div>
            </div>
          </div>
          
          {customer.notes && (
            <div className="mt-6">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-900">{customer.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onEmail}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Customer
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors inline-flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats>({
    activeProjects: 0,
    closedProjects: 0,
    activeLeads: 0,
    deadLeads: 0,
    totalValue: 0
  });

  // Load customers from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('averageJoeCustomers');
    if (savedCustomers) {
      const parsed = JSON.parse(savedCustomers).map((c: any) => ({
        ...c,
        lastContact: new Date(c.lastContact),
        createdDate: new Date(c.createdDate),
        updatedDate: new Date(c.updatedDate)
      }));
      setCustomers(parsed);
    } else {
      // Use mock data for first time
      setCustomers(MOCK_CUSTOMERS);
      localStorage.setItem('averageJoeCustomers', JSON.stringify(MOCK_CUSTOMERS));
    }
  }, []);

  // Update filtered customers when search term or filter changes
  useEffect(() => {
    let filtered = customers;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.projectAddress.toLowerCase().includes(term) ||
        customer.projectType.toLowerCase().includes(term)
      );
    }
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filterStatus]);

  // Calculate stats when customers change
  useEffect(() => {
    const newStats = customers.reduce((acc, customer) => {
      acc.totalValue += customer.estimatedValue;
      switch (customer.status) {
        case 'active_project':
          acc.activeProjects++;
          break;
        case 'closed_project':
          acc.closedProjects++;
          break;
        case 'active_lead':
          acc.activeLeads++;
          break;
        case 'dead_lead':
          acc.deadLeads++;
          break;
      }
      return acc;
    }, {
      activeProjects: 0,
      closedProjects: 0,
      activeLeads: 0,
      deadLeads: 0,
      totalValue: 0
    });
    setStats(newStats);
  }, [customers]);

  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    localStorage.setItem('averageJoeCustomers', JSON.stringify(updatedCustomers));
  };

  const handleAddCustomer = (customer: Customer) => {
    const updatedCustomers = [...customers, customer];
    saveCustomers(updatedCustomers);
    setShowAddModal(false);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    const updatedCustomers = customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
    saveCustomers(updatedCustomers);
    setEditingCustomer(null);
    setViewingCustomer(null);
    setShowDetailModal(false);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updatedCustomers = customers.filter(c => c.id !== customerId);
      saveCustomers(updatedCustomers);
      setViewingCustomer(null);
      setShowDetailModal(false);
    }
  };

  const handleEmailCustomer = (customer: Customer) => {
    // In a real app, this would open email client or send email
    window.open(`mailto:${customer.email}?subject=Regarding your ${customer.projectType} project`);
  };

  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowDetailModal(false);
  };

  const handleCategoryClick = (status: CustomerStatus) => {
    setFilterStatus(filterStatus === status ? 'all' : status);
  };

  const categoryCards = [
    {
      title: 'Active Projects',
      count: stats.activeProjects,
      status: 'active_project' as CustomerStatus,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Closed Projects',
      count: stats.closedProjects,
      status: 'closed_project' as CustomerStatus,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Leads',
      count: stats.activeLeads,
      status: 'active_lead' as CustomerStatus,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Dead Leads',
      count: stats.deadLeads,
      status: 'dead_lead' as CustomerStatus,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">Manage your customers and track project leads</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* CRM Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {categoryCards.map((card) => (
          <div
            key={card.status}
            onClick={() => handleCategoryClick(card.status)}
            className={`${card.bgColor} rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
              filterStatus === card.status ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.count}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold">{card.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CustomerStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active_project">Active Projects</option>
                <option value="closed_project">Closed Projects</option>
                <option value="active_lead">Active Leads</option>
                <option value="dead_lead">Dead Leads</option>
              </select>
              <span className="text-sm text-gray-600">
                {filteredCustomers.length} of {customers.length} customers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
        </div>
        
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => {
                  const projectTypeLabel = PROJECT_TYPES.find(pt => pt.value === customer.projectType)?.label || customer.projectType;
                  
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{projectTypeLabel}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{customer.projectAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[customer.status]}`}>
                          {STATUS_LABELS[customer.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${customer.estimatedValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {customer.lastContact.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEmailCustomer(customer)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Email customer"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      <CustomerModal
        customer={editingCustomer}
        isOpen={showAddModal || editingCustomer !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingCustomer(null);
        }}
        onSave={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={viewingCustomer}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingCustomer(null);
        }}
        onEdit={() => handleEditCustomer(viewingCustomer!)}
        onDelete={() => handleDeleteCustomer(viewingCustomer!.id)}
        onEmail={() => handleEmailCustomer(viewingCustomer!)}
      />
    </div>
  );
};