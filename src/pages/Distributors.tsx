import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Star,
  StarOff,
  Eye,
  X,
  Building2,
  User,
  FileText,
  Send,
  Filter
} from 'lucide-react';
import type { Distributor, DistributorSpecialty, TakeoffSend, ProjectType, SendTakeoffRequest } from '../types';

const DISTRIBUTOR_SPECIALTIES: { value: DistributorSpecialty; label: string; color: string }[] = [
  { value: 'roofing', label: 'Roofing', color: 'bg-red-100 text-red-800' },
  { value: 'siding', label: 'Siding', color: 'bg-blue-100 text-blue-800' },
  { value: 'windows', label: 'Windows', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'gutters', label: 'Gutters', color: 'bg-gray-100 text-gray-800' },
  { value: 'decking', label: 'Decking', color: 'bg-amber-100 text-amber-800' },
  { value: 'concrete', label: 'Concrete', color: 'bg-stone-100 text-stone-800' },
  { value: 'insulation', label: 'Insulation', color: 'bg-pink-100 text-pink-800' },
  { value: 'general', label: 'General Building Supply', color: 'bg-purple-100 text-purple-800' }
];

// Mock data for development
const MOCK_DISTRIBUTORS: Distributor[] = [
  {
    id: '1',
    companyName: 'ABC Roofing Supply',
    contactPerson: 'John Martinez',
    phone: '(555) 123-4567',
    email: 'john@abcroofing.com',
    address: '123 Industrial Blvd',
    city: 'Springfield',
    state: 'CA',
    zip: '12345',
    specialties: ['roofing', 'gutters'],
    notes: 'Excellent pricing on GAF and Owens Corning. Fast delivery.',
    isPreferred: true,
    createdDate: new Date('2025-06-15'),
    updatedDate: new Date('2025-08-08')
  },
  {
    id: '2',
    companyName: 'ProBuild Materials',
    contactPerson: 'Sarah Chen',
    phone: '(555) 987-6543',
    email: 'sarah@probuild.com',
    address: '456 Construction Way',
    city: 'Springfield',
    state: 'CA',
    zip: '12346',
    specialties: ['siding', 'windows', 'general'],
    notes: 'Wide selection of siding materials. Good for large orders.',
    isPreferred: false,
    createdDate: new Date('2025-07-01'),
    updatedDate: new Date('2025-08-05')
  },
  {
    id: '3',
    companyName: 'Concrete Solutions',
    contactPerson: 'Mike Rodriguez',
    phone: '(555) 456-7890',
    email: 'mike@concretesolutions.com',
    address: '789 Heavy Materials Dr',
    city: 'Springfield',
    state: 'CA',
    zip: '12347',
    specialties: ['concrete', 'decking'],
    notes: 'Specializes in concrete and composite decking materials.',
    isPreferred: false,
    createdDate: new Date('2025-07-10'),
    updatedDate: new Date('2025-08-01')
  },
  {
    id: '4',
    companyName: 'Elite Window & Door',
    contactPerson: 'Lisa Thompson',
    phone: '(555) 321-0987',
    email: 'lisa@elitewindow.com',
    address: '321 Glass Street',
    city: 'Springfield',
    state: 'CA',
    zip: '12348',
    specialties: ['windows', 'siding'],
    notes: 'Premium windows and doors. Higher prices but excellent quality.',
    isPreferred: true,
    createdDate: new Date('2025-05-20'),
    updatedDate: new Date('2025-07-28')
  }
];

interface DistributorModalProps {
  distributor?: Distributor;
  isOpen: boolean;
  onClose: () => void;
  onSave: (distributor: Distributor) => void;
}

const DistributorModal: React.FC<DistributorModalProps> = ({ distributor, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Distributor>>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialties: [],
    notes: '',
    isPreferred: false
  });

  useEffect(() => {
    if (distributor) {
      setFormData(distributor);
    } else {
      setFormData({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        specialties: [],
        notes: '',
        isPreferred: false
      });
    }
  }, [distributor, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const distributorData: Distributor = {
      id: distributor?.id || Math.random().toString(36).substr(2, 9),
      companyName: formData.companyName || '',
      contactPerson: formData.contactPerson || '',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zip: formData.zip || '',
      specialties: formData.specialties || [],
      notes: formData.notes || '',
      isPreferred: formData.isPreferred || false,
      createdDate: distributor?.createdDate || now,
      updatedDate: now
    };
    onSave(distributorData);
  };

  const handleSpecialtyToggle = (specialty: DistributorSpecialty) => {
    const currentSpecialties = formData.specialties || [];
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    setFormData({ ...formData, specialties: newSpecialties });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {distributor ? 'Edit Distributor' : 'Add New Distributor'}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC Building Supply"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
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
                placeholder="contact@company.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Industrial Blvd"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Springfield"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CA"
                maxLength={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345"
              />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPreferred"
                  checked={formData.isPreferred}
                  onChange={(e) => setFormData({ ...formData, isPreferred: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPreferred" className="text-sm font-medium text-gray-700">
                  Preferred Supplier
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Specialties *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DISTRIBUTOR_SPECIALTIES.map((specialty) => (
                <label
                  key={specialty.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.specialties?.includes(specialty.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.specialties?.includes(specialty.value) || false}
                    onChange={() => handleSpecialtyToggle(specialty.value)}
                    className="sr-only"
                  />
                  <div className="text-center w-full">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{specialty.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this distributor, pricing, delivery times, etc..."
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
              {distributor ? 'Update Distributor' : 'Add Distributor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SendTakeoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  takeoffType: ProjectType | null;
  distributors: Distributor[];
  onSend: (request: SendTakeoffRequest) => void;
}

const SendTakeoffModal: React.FC<SendTakeoffModalProps> = ({ 
  isOpen, 
  onClose, 
  takeoffType, 
  distributors, 
  onSend 
}) => {
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && takeoffType) {
      setMessage(`Please review the attached ${takeoffType} takeoff and provide your quote. We appreciate your partnership.`);
      setSelectedDistributors([]);
    }
  }, [isOpen, takeoffType]);

  const relevantDistributors = takeoffType 
    ? distributors.filter(d => d.specialties.includes(takeoffType as DistributorSpecialty) || d.specialties.includes('general'))
    : distributors;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDistributors.length > 0 && takeoffType) {
      onSend({
        distributorIds: selectedDistributors,
        takeoffType,
        message
      });
    }
  };

  const toggleDistributor = (distributorId: string) => {
    setSelectedDistributors(prev => 
      prev.includes(distributorId) 
        ? prev.filter(id => id !== distributorId)
        : [...prev, distributorId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Send {takeoffType ? takeoffType.charAt(0).toUpperCase() + takeoffType.slice(1) : ''} Takeoff
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Select Distributors ({relevantDistributors.length} {takeoffType} specialists available)
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {relevantDistributors.map((distributor) => (
                <label
                  key={distributor.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDistributors.includes(distributor.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDistributors.includes(distributor.id)}
                    onChange={() => toggleDistributor(distributor.id)}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                          {distributor.companyName}
                          {distributor.isPreferred && (
                            <Star className="w-4 h-4 text-yellow-500 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {distributor.contactPerson} • {distributor.phone}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {distributor.specialties.map((specialty) => {
                            const specialtyInfo = DISTRIBUTOR_SPECIALTIES.find(s => s.value === specialty);
                            return (
                              <span
                                key={specialty}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${specialtyInfo?.color}`}
                              >
                                {specialtyInfo?.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a personal message with your takeoff..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedDistributors.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to {selectedDistributors.length} Distributors
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DistributorDetailModalProps {
  distributor: Distributor | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEmail: () => void;
  onTogglePreferred: () => void;
}

const DistributorDetailModal: React.FC<DistributorDetailModalProps> = ({
  distributor,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onEmail,
  onTogglePreferred
}) => {
  if (!isOpen || !distributor) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Distributor Details</h2>
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
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    {distributor.companyName}
                    {distributor.isPreferred && (
                      <Star className="w-4 h-4 text-yellow-500 ml-2" />
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{distributor.contactPerson}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{distributor.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{distributor.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {distributor.address}<br />
                    {distributor.city}, {distributor.state} {distributor.zip}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {distributor.specialties.map((specialty) => {
                    const specialtyInfo = DISTRIBUTOR_SPECIALTIES.find(s => s.value === specialty);
                    return (
                      <span
                        key={specialty}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${specialtyInfo?.color}`}
                      >
                        {specialtyInfo?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {distributor.notes && (
            <div className="mt-6">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-900 dark:text-gray-100">{distributor.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onTogglePreferred}
            className={`px-4 py-2 border rounded-md transition-colors inline-flex items-center ${
              distributor.isPreferred
                ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {distributor.isPreferred ? (
              <><StarOff className="w-4 h-4 mr-2" />Remove Preferred</>
            ) : (
              <><Star className="w-4 h-4 mr-2" />Mark Preferred</>
            )}
          </button>
          <button
            onClick={onEmail}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Contact
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
            Edit Distributor
          </button>
        </div>
      </div>
    </div>
  );
};

export const Distributors: React.FC = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<DistributorSpecialty | 'all' | 'preferred'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSendTakeoffModal, setShowSendTakeoffModal] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const [viewingDistributor, setViewingDistributor] = useState<Distributor | null>(null);
  const [takeoffType, setTakeoffType] = useState<ProjectType | null>(null);

  // Load distributors from localStorage on mount
  useEffect(() => {
    const savedDistributors = localStorage.getItem('averageJoeDistributors');
    if (savedDistributors) {
      const parsed = JSON.parse(savedDistributors).map((d: any) => ({
        ...d,
        createdDate: new Date(d.createdDate),
        updatedDate: new Date(d.updatedDate)
      }));
      setDistributors(parsed);
    } else {
      // Use mock data for first time
      setDistributors(MOCK_DISTRIBUTORS);
      localStorage.setItem('averageJoeDistributors', JSON.stringify(MOCK_DISTRIBUTORS));
    }
  }, []);

  // Update filtered distributors when search term or filter changes
  useEffect(() => {
    let filtered = distributors;
    
    if (filterSpecialty === 'preferred') {
      filtered = filtered.filter(distributor => distributor.isPreferred);
    } else if (filterSpecialty !== 'all') {
      filtered = filtered.filter(distributor => distributor.specialties.includes(filterSpecialty));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(distributor => 
        distributor.companyName.toLowerCase().includes(term) ||
        distributor.contactPerson.toLowerCase().includes(term) ||
        distributor.email.toLowerCase().includes(term) ||
        distributor.specialties.some(s => s.toLowerCase().includes(term))
      );
    }
    
    setFilteredDistributors(filtered);
  }, [distributors, searchTerm, filterSpecialty]);

  const saveDistributors = (updatedDistributors: Distributor[]) => {
    setDistributors(updatedDistributors);
    localStorage.setItem('averageJoeDistributors', JSON.stringify(updatedDistributors));
  };

  const handleAddDistributor = (distributor: Distributor) => {
    const updatedDistributors = [...distributors, distributor];
    saveDistributors(updatedDistributors);
    setShowAddModal(false);
  };

  const handleUpdateDistributor = (updatedDistributor: Distributor) => {
    const updatedDistributors = distributors.map(d => d.id === updatedDistributor.id ? updatedDistributor : d);
    saveDistributors(updatedDistributors);
    setEditingDistributor(null);
    setViewingDistributor(null);
    setShowDetailModal(false);
  };

  const handleDeleteDistributor = (distributorId: string) => {
    if (window.confirm('Are you sure you want to delete this distributor?')) {
      const updatedDistributors = distributors.filter(d => d.id !== distributorId);
      saveDistributors(updatedDistributors);
      setViewingDistributor(null);
      setShowDetailModal(false);
    }
  };

  const handleEmailDistributor = (distributor: Distributor) => {
    window.open(`mailto:${distributor.email}?subject=Partnership Inquiry`);
  };

  const handleViewDistributor = (distributor: Distributor) => {
    setViewingDistributor(distributor);
    setShowDetailModal(true);
  };

  const handleEditDistributor = (distributor: Distributor) => {
    setEditingDistributor(distributor);
    setShowDetailModal(false);
  };

  const handleTogglePreferred = (distributor: Distributor) => {
    const updatedDistributor = { ...distributor, isPreferred: !distributor.isPreferred };
    handleUpdateDistributor(updatedDistributor);
  };

  const handleSendTakeoff = (request: SendTakeoffRequest) => {
    // In a real app, this would send the takeoff to the selected distributors
    alert(`Takeoff sent to ${request.distributorIds.length} distributors!`);
    setShowSendTakeoffModal(false);
    setTakeoffType(null);
  };

  const openSendTakeoffModal = (type: ProjectType) => {
    setTakeoffType(type);
    setShowSendTakeoffModal(true);
  };

  const specialtyStats = DISTRIBUTOR_SPECIALTIES.map(specialty => ({
    ...specialty,
    count: distributors.filter(d => d.specialties.includes(specialty.value)).length
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Distributor Network</h1>
          <p className="text-gray-600 mt-2">Manage your material distributors and send takeoffs</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => openSendTakeoffModal('roofing')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Takeoff
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Distributor
          </button>
        </div>
      </div>

      {/* Specialty Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        {specialtyStats.map((specialty) => (
          <div
            key={specialty.value}
            onClick={() => setFilterSpecialty(filterSpecialty === specialty.value ? 'all' : specialty.value)}
            className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              filterSpecialty === specialty.value 
                ? specialty.color.replace('100', '200') + ' ring-2 ring-blue-500' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">{specialty.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{specialty.count}</p>
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
                placeholder="Search distributors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value as DistributorSpecialty | 'all' | 'preferred')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Distributors</option>
                <option value="preferred">Preferred Only</option>
                {DISTRIBUTOR_SPECIALTIES.map(specialty => (
                  <option key={specialty.value} value={specialty.value}>
                    {specialty.label} Specialists
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">
                {filteredDistributors.length} of {distributors.length} distributors
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distributor List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distributors</h2>
        </div>
        
        {filteredDistributors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No distributors found</p>
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
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDistributors.map((distributor) => (
                  <tr key={distributor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            {distributor.companyName}
                            {distributor.isPreferred && (
                              <Star className="w-4 h-4 text-yellow-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {distributor.notes && distributor.notes.slice(0, 50)}
                            {distributor.notes && distributor.notes.length > 50 && '...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{distributor.contactPerson}</div>
                      <div className="text-sm text-gray-500">{distributor.phone}</div>
                      <div className="text-sm text-gray-500">{distributor.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{distributor.city}, {distributor.state}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{distributor.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {distributor.specialties.map((specialty) => {
                          const specialtyInfo = DISTRIBUTOR_SPECIALTIES.find(s => s.value === specialty);
                          return (
                            <span
                              key={specialty}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${specialtyInfo?.color}`}
                            >
                              {specialtyInfo?.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDistributor(distributor)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDistributor(distributor)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit distributor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEmailDistributor(distributor)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Email distributor"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDistributor(distributor.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete distributor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Distributor Modal */}
      <DistributorModal
        distributor={editingDistributor}
        isOpen={showAddModal || editingDistributor !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingDistributor(null);
        }}
        onSave={editingDistributor ? handleUpdateDistributor : handleAddDistributor}
      />

      {/* Distributor Detail Modal */}
      <DistributorDetailModal
        distributor={viewingDistributor}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingDistributor(null);
        }}
        onEdit={() => handleEditDistributor(viewingDistributor!)}
        onDelete={() => handleDeleteDistributor(viewingDistributor!.id)}
        onEmail={() => handleEmailDistributor(viewingDistributor!)}
        onTogglePreferred={() => handleTogglePreferred(viewingDistributor!)}
      />

      {/* Send Takeoff Modal */}
      <SendTakeoffModal
        isOpen={showSendTakeoffModal}
        onClose={() => {
          setShowSendTakeoffModal(false);
          setTakeoffType(null);
        }}
        takeoffType={takeoffType}
        distributors={distributors}
        onSend={handleSendTakeoff}
      />
    </div>
  );
};