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
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

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
    projects: [],
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
    projects: [],
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
    projects: [],
    notes: 'Previous project completed successfully',
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
    projects: [],
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
  onViewTakeoff?: (takeoff: any) => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onEmail,
  onViewTakeoff
}) => {
  if (!isOpen || !customer) return null;

  const projectTypeLabel = PROJECT_TYPES.find(pt => pt.value === customer.projectType)?.label || customer.projectType;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Customer Details</h2>
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
                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Project Type</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{projectTypeLabel}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Project Address</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.projectAddress}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Value</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">${customer.estimatedValue?.toLocaleString() || 'TBD'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last Contact</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.lastContact.toLocaleDateString()}</p>
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
          
          {/* Projects Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Projects & Takeoffs</h3>
            
            {customer.projects && customer.projects.length > 0 ? (
              <div className="space-y-4">
                {customer.projects.map(project => (
                  <div key={project.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{project.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Type: </span>
                        <span className="text-gray-900 dark:text-gray-100 capitalize">{project.projectType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Value: </span>
                        <span className="text-gray-900 dark:text-gray-100">${project.estimatedValue?.toLocaleString() || 'TBD'}</span>
                      </div>
                    </div>

                    {/* Takeoffs for this project */}
                    {project.takeoffs && project.takeoffs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Takeoffs:</p>
                        <div className="space-y-2">
                          {project.takeoffs.map(takeoff => (
                            <div 
                              key={takeoff.id} 
                              className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => onViewTakeoff?.(takeoff)}
                              title="Click to view takeoff details"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{takeoff.name}</p>
                                  <p className="text-gray-600 dark:text-gray-400">Type: {takeoff.type}</p>
                                  {takeoff.actualCost && (
                                    <p className="text-gray-600 dark:text-gray-400">Cost: ${takeoff.actualCost?.toLocaleString() || 'TBD'}</p>
                                  )}
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  takeoff.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  takeoff.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {takeoff.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No projects found for this customer</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create a new takeoff to automatically add projects</p>
              </div>
            )}
          </div>

          {customer.notes && (
            <div className="mt-6">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-900 dark:text-gray-100">{customer.notes}</p>
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

// Takeoff Detail Modal Component
interface TakeoffDetailModalProps {
  takeoff: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (takeoff: any) => void;
}

const TakeoffDetailModal: React.FC<TakeoffDetailModalProps> = ({ takeoff, isOpen, onClose, onEdit }) => {
  console.log('TakeoffDetailModal - isOpen:', isOpen, 'takeoff:', takeoff);
  if (!isOpen || !takeoff) return null;

  // Add error boundary for debugging stone takeoffs
  try {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Takeoff Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📋 Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Takeoff Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{takeoff.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{takeoff.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  takeoff.status === 'completed' ? 'bg-green-100 text-green-800' :
                  takeoff.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {takeoff.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Project Address</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{takeoff.projectAddress}</p>
              </div>
            </div>
          </div>

          {/* Measurements Summary (for roofing) */}
          {takeoff.type === 'roofing' && (takeoff.totalSquareFeet || takeoff.totalBundles) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📐 Measurements Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
                {takeoff.totalSquareFeet && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{takeoff.totalSquareFeet.toLocaleString()}</div>
                    <div className="text-sm opacity-90">Total Square Feet</div>
                  </div>
                )}
                {takeoff.totalBundles && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{takeoff.totalBundles}</div>
                    <div className="text-sm opacity-90">Shingle Bundles</div>
                  </div>
                )}
                {takeoff.totalUnderlayment && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{takeoff.totalUnderlayment}</div>
                    <div className="text-sm opacity-90">Underlayment Rolls</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(takeoff.actualCost || takeoff.estimatedValue || 0)}</div>
                  <div className="text-sm opacity-90">Total Cost</div>
                </div>
              </div>
            </div>
          )}

          {/* Material Selections */}
          {takeoff.manufacturerSelections && takeoff.manufacturerSelections.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🏗️ Material Selections</h3>
              <div className="space-y-4">
                {takeoff.manufacturerSelections.map((selection: any, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manufacturer</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selection.manufacturerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Product Line</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selection.productLineName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Color</p>
                        <div className="flex items-center gap-2">
                          {selection.colorHex && (
                            <div 
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: selection.colorHex }}
                            />
                          )}
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selection.colorName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Price per {selection.unit}</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">${selection.pricePerUnit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📅 Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {takeoff.createdDate ? new Date(takeoff.createdDate).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {takeoff.updatedDate ? new Date(takeoff.updatedDate).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
              {takeoff.completedDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(takeoff.completedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {takeoff.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📝 Notes</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-gray-100">{takeoff.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between space-x-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => onEdit?.(takeoff)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Takeoff
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
  
  } catch (error) {
    console.error('Error in TakeoffDetailModal:', error, 'takeoff:', takeoff);
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Takeoff Details</h3>
          <p className="text-gray-600 mb-4">There was an error loading this takeoff. Please try again.</p>
          <p className="text-sm text-gray-500 mb-4">Takeoff Type: {takeoff?.type || 'Unknown'}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export const Customers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTakeoffModal, setShowTakeoffModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [viewingTakeoff, setViewingTakeoff] = useState<any>(null);
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
      try {
        const parsed = JSON.parse(savedCustomers).map((c: any) => ({
          ...c,
          lastContact: new Date(c.lastContact),
          createdDate: new Date(c.createdDate),
          updatedDate: new Date(c.updatedDate),
          projects: c.projects?.map((p: any) => ({
            ...p,
            createdDate: new Date(p.createdDate),
            updatedDate: new Date(p.updatedDate),
            completedDate: p.completedDate ? new Date(p.completedDate) : undefined,
            takeoffs: p.takeoffs?.map((t: any) => ({
              ...t,
              createdDate: new Date(t.createdDate),
              updatedDate: new Date(t.updatedDate),
              completedDate: t.completedDate ? new Date(t.completedDate) : undefined,
              sentDate: t.sentDate ? new Date(t.sentDate) : undefined
            })) || []
          })) || []
        }));
        setCustomers(parsed);
      } catch (error) {
        console.error('Error parsing saved customers:', error);
        // Fall back to mock data if parsing fails
        setCustomers(MOCK_CUSTOMERS);
        localStorage.setItem('averageJoeCustomers', JSON.stringify(MOCK_CUSTOMERS));
      }
    } else {
      // Use mock data for first time
      setCustomers(MOCK_CUSTOMERS);
      localStorage.setItem('averageJoeCustomers', JSON.stringify(MOCK_CUSTOMERS));
    }
  }, []);

  // Handle URL parameters to open specific customer profiles
  useEffect(() => {
    if (customers.length > 0) {
      const customerId = searchParams.get('customerId');
      const action = searchParams.get('action');
      
      if (customerId && action === 'view') {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          setViewingCustomer(customer);
          setShowDetailModal(true);
          // Clear the URL parameters after opening modal
          setSearchParams(new URLSearchParams());
        }
      }
    }
  }, [customers, searchParams, setSearchParams]);

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

  const handleViewTakeoff = (takeoff: any) => {
    console.log('handleViewTakeoff called with:', takeoff);
    setViewingTakeoff(takeoff);
    setShowTakeoffModal(true);
  };

  const handleEditTakeoff = (takeoff: any) => {
    // Store the takeoff data in localStorage for the RoofingCalculator to load
    localStorage.setItem('editingTakeoff', JSON.stringify(takeoff));
    
    // Also store a flag to trigger the calculator view
    localStorage.setItem('openCalculator', 'true');
    
    // Navigate to the takeoffs page
    navigate('/takeoffs');
    
    // Close the modals
    setShowTakeoffModal(false);
    setShowDetailModal(false);
    setViewingTakeoff(null);
    setViewingCustomer(null);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customer Management</h1>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customers</h2>
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
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{projectTypeLabel}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{customer.projectAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[customer.status]}`}>
                          {STATUS_LABELS[customer.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        ${customer.estimatedValue?.toLocaleString() || 'TBD'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
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
        onViewTakeoff={handleViewTakeoff}
      />

      {/* Takeoff Detail Modal */}
      <TakeoffDetailModal
        takeoff={viewingTakeoff}
        isOpen={showTakeoffModal}
        onClose={() => {
          setShowTakeoffModal(false);
          setViewingTakeoff(null);
        }}
        onEdit={handleEditTakeoff}
      />
    </div>
  );
};