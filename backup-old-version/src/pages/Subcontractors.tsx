import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Star, Calendar, Upload, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { 
  Subcontractor, 
  TradeSpecialty, 
  SubcontractorStatus, 
  InsuranceStatus, 
  DocumentCategory,
  SubcontractorDocument,
  ProjectInvitation
} from '../types';

// Trade specialty configurations
const TRADE_SPECIALTIES: { id: TradeSpecialty; name: string; icon: string; color: string }[] = [
  { id: 'electrical', name: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', color: 'bg-blue-100 text-blue-800' },
  { id: 'hvac', name: 'HVAC', icon: '🌡️', color: 'bg-green-100 text-green-800' },
  { id: 'flooring', name: 'Flooring', icon: '🏗️', color: 'bg-brown-100 text-brown-800' },
  { id: 'drywall', name: 'Drywall', icon: '🧱', color: 'bg-gray-100 text-gray-800' },
  { id: 'painting', name: 'Painting', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
  { id: 'carpentry', name: 'Carpentry', icon: '🔨', color: 'bg-orange-100 text-orange-800' },
  { id: 'masonry', name: 'Masonry', icon: '🧱', color: 'bg-red-100 text-red-800' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌿', color: 'bg-green-100 text-green-800' },
  { id: 'concrete', name: 'Concrete', icon: '🏗️', color: 'bg-slate-100 text-slate-800' },
  { id: 'roofing', name: 'Roofing', icon: '🏠', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'siding', name: 'Siding', icon: '🏘️', color: 'bg-teal-100 text-teal-800' },
  { id: 'insulation', name: 'Insulation', icon: '🧊', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'demolition', name: 'Demolition', icon: '💥', color: 'bg-red-100 text-red-800' },
  { id: 'general', name: 'General Contracting', icon: '👷', color: 'bg-blue-100 text-blue-800' }
];

// Document categories
const DOCUMENT_CATEGORIES: { id: DocumentCategory; name: string; description: string; requiresExpiration: boolean }[] = [
  { id: 'msa', name: 'MSA', description: 'Master Service Agreement', requiresExpiration: false },
  { id: 'general_liability', name: 'General Liability', description: 'General Liability Insurance', requiresExpiration: true },
  { id: 'workers_comp', name: 'Workers Comp', description: 'Workers Compensation Insurance', requiresExpiration: true },
  { id: 'business_license', name: 'Business License', description: 'Business Operating License', requiresExpiration: true },
  { id: 'trade_certifications', name: 'Trade Certifications', description: 'Professional Trade Certifications', requiresExpiration: true },
  { id: 'w9', name: 'W-9', description: 'Tax Form W-9', requiresExpiration: false },
  { id: 'safety_certificates', name: 'Safety Certificates', description: 'Safety Training Certificates', requiresExpiration: true }
];

// Sample subcontractor data
const createSampleSubcontractors = (): Subcontractor[] => [
  {
    id: '1',
    companyName: 'Lightning Fast Electric',
    contactPerson: 'Mike Rodriguez',
    phone: '(555) 234-5678',
    email: 'mike@lightningelectric.com',
    address: '1234 Industrial Blvd',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001',
    tradeSpecialties: ['electrical'],
    status: 'preferred',
    insuranceStatus: 'current',
    hourlyRate: 85,
    rating: 4.8,
    totalProjects: 23,
    notes: 'Excellent work quality, always on time. Specializes in commercial electrical work.',
    documents: {
      msa: [],
      general_liability: [{
        id: 'doc1',
        category: 'general_liability',
        name: 'General Liability Insurance 2024.pdf',
        type: 'application/pdf',
        size: 245760,
        url: '/documents/lightning-electric-gl.pdf',
        uploadDate: new Date('2024-01-15'),
        expirationDate: new Date('2024-12-31'),
        status: 'current'
      }],
      workers_comp: [],
      business_license: [],
      trade_certifications: [],
      w9: [],
      safety_certificates: []
    },
    createdDate: new Date('2023-06-15'),
    updatedDate: new Date('2024-01-15'),
    lastProjectDate: new Date('2024-07-20')
  },
  {
    id: '2',
    companyName: 'Elite Plumbing Solutions',
    contactPerson: 'Sarah Chen',
    phone: '(555) 345-6789',
    email: 'sarah@eliteplumbing.com',
    address: '5678 Commerce St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85002',
    tradeSpecialties: ['plumbing', 'hvac'],
    status: 'active',
    insuranceStatus: 'expiring_soon',
    hourlyRate: 95,
    rating: 4.6,
    totalProjects: 31,
    notes: 'Reliable plumbing contractor with HVAC capabilities. Great for multi-trade projects.',
    documents: {
      msa: [],
      general_liability: [{
        id: 'doc2',
        category: 'general_liability',
        name: 'GL Insurance Certificate.pdf',
        type: 'application/pdf',
        size: 189440,
        url: '/documents/elite-plumbing-gl.pdf',
        uploadDate: new Date('2024-02-01'),
        expirationDate: new Date('2024-09-15'),
        status: 'expiring_soon'
      }],
      workers_comp: [],
      business_license: [],
      trade_certifications: [],
      w9: [],
      safety_certificates: []
    },
    createdDate: new Date('2023-03-22'),
    updatedDate: new Date('2024-02-01'),
    lastProjectDate: new Date('2024-07-15')
  },
  {
    id: '3',
    companyName: 'Premier Flooring & Design',
    contactPerson: 'David Thompson',
    phone: '(555) 456-7890',
    email: 'david@premierfloor.com',
    address: '9876 Design Ave',
    city: 'Scottsdale',
    state: 'AZ',
    zip: '85260',
    tradeSpecialties: ['flooring', 'carpentry'],
    status: 'active',
    insuranceStatus: 'current',
    hourlyRate: 70,
    rating: 4.4,
    totalProjects: 18,
    notes: 'Specializes in high-end residential flooring. Excellent craftsmanship.',
    documents: {
      msa: [],
      general_liability: [],
      workers_comp: [],
      business_license: [],
      trade_certifications: [],
      w9: [],
      safety_certificates: []
    },
    createdDate: new Date('2023-09-10'),
    updatedDate: new Date('2024-01-20'),
    lastProjectDate: new Date('2024-06-30')
  },
  {
    id: '4',
    companyName: 'Precision Drywall & Paint',
    contactPerson: 'Lisa Johnson',
    phone: '(555) 567-8901',
    email: 'lisa@precisiondrywall.com',
    address: '2468 Craft Rd',
    city: 'Tempe',
    state: 'AZ',
    zip: '85281',
    tradeSpecialties: ['drywall', 'painting'],
    status: 'preferred',
    insuranceStatus: 'current',
    hourlyRate: 65,
    rating: 4.9,
    totalProjects: 42,
    notes: 'Outstanding finish quality. Very competitive pricing for volume work.',
    documents: {
      msa: [],
      general_liability: [],
      workers_comp: [],
      business_license: [],
      trade_certifications: [],
      w9: [],
      safety_certificates: []
    },
    createdDate: new Date('2022-11-05'),
    updatedDate: new Date('2024-03-10'),
    lastProjectDate: new Date('2024-08-01')
  }
];

export const Subcontractors: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [filteredSubcontractors, setFilteredSubcontractors] = useState<Subcontractor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<TradeSpecialty | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<SubcontractorStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<Subcontractor | null>(null);

  // Initialize with sample data
  useEffect(() => {
    const savedSubcontractors = localStorage.getItem('subcontractors');
    if (savedSubcontractors) {
      const parsed = JSON.parse(savedSubcontractors);
      const subcontractorsWithDates = parsed.map((sub: any) => ({
        ...sub,
        createdDate: new Date(sub.createdDate),
        updatedDate: new Date(sub.updatedDate),
        lastProjectDate: sub.lastProjectDate ? new Date(sub.lastProjectDate) : undefined,
        documents: Object.keys(sub.documents).reduce((acc, key) => {
          acc[key] = sub.documents[key].map((doc: any) => ({
            ...doc,
            uploadDate: new Date(doc.uploadDate),
            expirationDate: doc.expirationDate ? new Date(doc.expirationDate) : undefined
          }));
          return acc;
        }, {} as Record<DocumentCategory, SubcontractorDocument[]>)
      }));
      setSubcontractors(subcontractorsWithDates);
    } else {
      const sampleData = createSampleSubcontractors();
      setSubcontractors(sampleData);
      localStorage.setItem('subcontractors', JSON.stringify(sampleData));
    }
  }, []);

  // Save to localStorage whenever subcontractors change
  useEffect(() => {
    if (subcontractors.length > 0) {
      localStorage.setItem('subcontractors', JSON.stringify(subcontractors));
    }
  }, [subcontractors]);

  // Handle URL parameters to open specific subcontractor profiles
  useEffect(() => {
    if (subcontractors.length > 0) {
      const subcontractorId = searchParams.get('subcontractorId');
      const action = searchParams.get('action');
      
      if (subcontractorId && action === 'view') {
        const subcontractor = subcontractors.find(s => s.id === subcontractorId);
        if (subcontractor) {
          setSelectedSubcontractor(subcontractor);
          setShowProfileModal(true);
          // Clear the URL parameters after opening modal
          setSearchParams(new URLSearchParams());
        }
      }
    }
  }, [subcontractors, searchParams, setSearchParams]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...subcontractors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.companyName.toLowerCase().includes(query) ||
        sub.contactPerson.toLowerCase().includes(query) ||
        sub.email.toLowerCase().includes(query)
      );
    }

    // Trade specialty filter
    if (selectedTradeFilter !== 'all') {
      filtered = filtered.filter(sub =>
        sub.tradeSpecialties.includes(selectedTradeFilter)
      );
    }

    // Status filter
    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(sub =>
        sub.status === selectedStatusFilter
      );
    }

    setFilteredSubcontractors(filtered);
  }, [subcontractors, searchQuery, selectedTradeFilter, selectedStatusFilter]);

  // Get trade specialty badge
  const getTradeSpecialtyBadge = (specialty: TradeSpecialty) => {
    const config = TRADE_SPECIALTIES.find(t => t.id === specialty);
    return config || { name: specialty, icon: '🔧', color: 'bg-gray-100 text-gray-800' };
  };

  // Get status color
  const getStatusColor = (status: SubcontractorStatus) => {
    switch (status) {
      case 'preferred': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
    }
  };

  // Get insurance status color
  const getInsuranceStatusColor = (status: InsuranceStatus) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
    }
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Get trade specialty count
  const getTradeSpecialtyCount = (specialty: TradeSpecialty) => {
    return subcontractors.filter(sub =>
      sub.tradeSpecialties.includes(specialty)
    ).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Subcontractors</h1>
            <p className="mt-2 text-gray-600">Manage your trade partner network</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Subcontractor
          </button>
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
                placeholder="Search by company, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Trade Filter */}
          <div className="lg:w-64">
            <select
              value={selectedTradeFilter}
              onChange={(e) => setSelectedTradeFilter(e.target.value as TradeSpecialty | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Trades</option>
              {TRADE_SPECIALTIES.map(trade => (
                <option key={trade.id} value={trade.id}>
                  {trade.icon} {trade.name} ({getTradeSpecialtyCount(trade.id)})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as SubcontractorStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="preferred">Preferred</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredSubcontractors.length} of {subcontractors.length} subcontractors
        </p>
      </div>

      {/* Subcontractor List */}
      <div className="space-y-4">
        {filteredSubcontractors.map((subcontractor) => (
          <div key={subcontractor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mr-4">
                      {subcontractor.companyName}
                    </h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(subcontractor.status)}`}>
                        {subcontractor.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getInsuranceStatusColor(subcontractor.insuranceStatus)}`}>
                        Insurance: {subcontractor.insuranceStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Contact:</span>
                      {subcontractor.contactPerson}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {subcontractor.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {subcontractor.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {subcontractor.city}, {subcontractor.state}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {subcontractor.tradeSpecialties.map((specialty) => {
                        const badge = getTradeSpecialtyBadge(specialty);
                        return (
                          <span
                            key={specialty}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
                          >
                            {badge.icon} {badge.name}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center space-x-4">
                      {renderStarRating(subcontractor.rating)}
                      {subcontractor.hourlyRate && (
                        <div className="text-lg font-semibold text-green-600">
                          ${subcontractor.hourlyRate}/hr
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => {
                      setSelectedSubcontractor(subcontractor);
                      setShowProfileModal(true);
                    }}
                    className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSubcontractor(subcontractor);
                      setShowDocumentsModal(true);
                    }}
                    className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  >
                    Documents
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSubcontractor(subcontractor);
                      setShowInviteModal(true);
                    }}
                    className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    Send Invite
                  </button>
                </div>
              </div>

              {subcontractor.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{subcontractor.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSubcontractors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">No subcontractors found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddSubcontractorModal
          onClose={() => setShowAddModal(false)}
          onSave={(newSubcontractor) => {
            const subcontractorWithId = {
              ...newSubcontractor,
              id: Date.now().toString(),
              createdDate: new Date(),
              updatedDate: new Date(),
              rating: 0,
              totalProjects: 0,
              documents: {
                msa: [],
                general_liability: [],
                workers_comp: [],
                business_license: [],
                trade_certifications: [],
                w9: [],
                safety_certificates: []
              }
            };
            setSubcontractors(prev => [...prev, subcontractorWithId]);
            setShowAddModal(false);
          }}
        />
      )}
      
      {showEditModal && selectedSubcontractor && (
        <EditSubcontractorModal
          subcontractor={selectedSubcontractor}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubcontractor(null);
          }}
          onSave={(updatedSubcontractor) => {
            setSubcontractors(prev => prev.map(sub =>
              sub.id === updatedSubcontractor.id ? { ...updatedSubcontractor, updatedDate: new Date() } : sub
            ));
            setShowEditModal(false);
            setSelectedSubcontractor(null);
          }}
        />
      )}

      {showProfileModal && selectedSubcontractor && (
        <SubcontractorProfileModal
          subcontractor={selectedSubcontractor}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedSubcontractor(null);
          }}
          onEdit={() => {
            setShowProfileModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {showDocumentsModal && selectedSubcontractor && (
        <DocumentsModal
          subcontractor={selectedSubcontractor}
          onClose={() => {
            setShowDocumentsModal(false);
            setSelectedSubcontractor(null);
          }}
          onDocumentUpdate={(updatedSubcontractor) => {
            setSubcontractors(prev => prev.map(sub =>
              sub.id === updatedSubcontractor.id ? updatedSubcontractor : sub
            ));
          }}
        />
      )}

      {showInviteModal && selectedSubcontractor && (
        <ProjectInviteModal
          subcontractor={selectedSubcontractor}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedSubcontractor(null);
          }}
          onSend={(invitation) => {
            // Here you would typically send the invitation via API
            console.log('Sending invitation:', invitation);
            alert(`Project invitation sent to ${selectedSubcontractor.companyName}!`);
            setShowInviteModal(false);
            setSelectedSubcontractor(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Components

// Add/Edit Subcontractor Modal
interface SubcontractorFormData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  tradeSpecialties: TradeSpecialty[];
  status: SubcontractorStatus;
  insuranceStatus: InsuranceStatus;
  hourlyRate?: number;
  notes: string;
}

const AddSubcontractorModal: React.FC<{ onClose: () => void; onSave: (data: SubcontractorFormData) => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<SubcontractorFormData>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    tradeSpecialties: [],
    status: 'active',
    insuranceStatus: 'current',
    hourlyRate: undefined,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.tradeSpecialties.length === 0) {
      alert('Please select at least one trade specialty');
      return;
    }
    onSave(formData);
  };

  const toggleTradeSpecialty = (specialty: TradeSpecialty) => {
    setFormData(prev => ({
      ...prev,
      tradeSpecialties: prev.tradeSpecialties.includes(specialty)
        ? prev.tradeSpecialties.filter(s => s !== specialty)
        : [...prev.tradeSpecialties, specialty]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Add New Subcontractor</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Company Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Business Details</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SubcontractorStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="preferred">Preferred</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Status</label>
                <select
                  value={formData.insuranceStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceStatus: e.target.value as InsuranceStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="current">Current</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trade Specialties *</label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {TRADE_SPECIALTIES.map((trade) => (
                      <label key={trade.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.tradeSpecialties.includes(trade.id)}
                          onChange={() => toggleTradeSpecialty(trade.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {trade.icon} {trade.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Additional notes about this subcontractor..."
                />
              </div>
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
              Add Subcontractor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditSubcontractorModal: React.FC<{ 
  subcontractor: Subcontractor; 
  onClose: () => void; 
  onSave: (data: Subcontractor) => void 
}> = ({ subcontractor, onClose, onSave }) => {
  const [formData, setFormData] = useState<SubcontractorFormData>({
    companyName: subcontractor.companyName,
    contactPerson: subcontractor.contactPerson,
    phone: subcontractor.phone,
    email: subcontractor.email,
    address: subcontractor.address,
    city: subcontractor.city,
    state: subcontractor.state,
    zip: subcontractor.zip,
    tradeSpecialties: subcontractor.tradeSpecialties,
    status: subcontractor.status,
    insuranceStatus: subcontractor.insuranceStatus,
    hourlyRate: subcontractor.hourlyRate,
    notes: subcontractor.notes
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.tradeSpecialties.length === 0) {
      alert('Please select at least one trade specialty');
      return;
    }
    onSave({ ...subcontractor, ...formData });
  };

  const toggleTradeSpecialty = (specialty: TradeSpecialty) => {
    setFormData(prev => ({
      ...prev,
      tradeSpecialties: prev.tradeSpecialties.includes(specialty)
        ? prev.tradeSpecialties.filter(s => s !== specialty)
        : [...prev.tradeSpecialties, specialty]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Edit Subcontractor</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Same form fields as AddSubcontractorModal */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Company Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Business Details</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SubcontractorStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="preferred">Preferred</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Status</label>
                <select
                  value={formData.insuranceStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceStatus: e.target.value as InsuranceStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="current">Current</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trade Specialties *</label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {TRADE_SPECIALTIES.map((trade) => (
                      <label key={trade.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.tradeSpecialties.includes(trade.id)}
                          onChange={() => toggleTradeSpecialty(trade.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {trade.icon} {trade.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Additional notes about this subcontractor..."
                />
              </div>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubcontractorProfileModal: React.FC<{ 
  subcontractor: Subcontractor; 
  onClose: () => void;
  onEdit: () => void;
}> = ({ subcontractor, onClose, onEdit }) => {
  const getTradeSpecialtyBadge = (specialty: TradeSpecialty) => {
    const config = TRADE_SPECIALTIES.find(t => t.id === specialty);
    return config || { name: specialty, icon: '🔧', color: 'bg-gray-100 text-gray-800' };
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{subcontractor.companyName}</h3>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                subcontractor.status === 'preferred' ? 'bg-green-100 text-green-800' :
                subcontractor.status === 'active' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {subcontractor.status}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                subcontractor.insuranceStatus === 'current' ? 'bg-green-100 text-green-800' :
                subcontractor.insuranceStatus === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Insurance: {subcontractor.insuranceStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium text-gray-900 dark:text-gray-100 w-24">Contact:</span>
                  {subcontractor.contactPerson}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-900 dark:text-gray-100" />
                  <span className="w-20 font-medium text-gray-900 dark:text-gray-100">Phone:</span>
                  {subcontractor.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-900 dark:text-gray-100" />
                  <span className="w-20 font-medium text-gray-900 dark:text-gray-100">Email:</span>
                  {subcontractor.email}
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-900 dark:text-gray-100" />
                  <span className="w-20 font-medium text-gray-900 dark:text-gray-100">Address:</span>
                  <div>
                    {subcontractor.address && <div>{subcontractor.address}</div>}
                    <div>{subcontractor.city}, {subcontractor.state} {subcontractor.zip}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Specialties */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Trade Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {subcontractor.tradeSpecialties.map((specialty) => {
                  const badge = getTradeSpecialtyBadge(specialty);
                  return (
                    <span
                      key={specialty}
                      className={`px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}
                    >
                      {badge.icon} {badge.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Performance & Business Info */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Performance</h4>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">Rating</span>
                  {renderStarRating(subcontractor.rating)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Total Projects</span>
                    <span className="text-2xl font-bold text-blue-600">{subcontractor.totalProjects}</span>
                  </div>
                  {subcontractor.hourlyRate && (
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Hourly Rate</span>
                      <span className="text-2xl font-bold text-green-600">${subcontractor.hourlyRate}</span>
                    </div>
                  )}
                </div>
                {subcontractor.lastProjectDate && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Last Project</span>
                    <span className="text-gray-600">{subcontractor.lastProjectDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Status */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Document Status</h4>
              <div className="space-y-2">
                {DOCUMENT_CATEGORIES.map((category) => {
                  const docs = subcontractor.documents[category.id];
                  const hasCurrentDocs = docs.some(doc => doc.status === 'current');
                  const hasExpiringSoon = docs.some(doc => doc.status === 'expiring_soon');
                  const hasExpired = docs.some(doc => doc.status === 'expired');

                  let statusColor = 'bg-gray-100 text-gray-800';
                  let statusText = 'Missing';
                  
                  if (hasExpired) {
                    statusColor = 'bg-red-100 text-red-800';
                    statusText = 'Expired';
                  } else if (hasExpiringSoon) {
                    statusColor = 'bg-yellow-100 text-yellow-800';
                    statusText = 'Expiring Soon';
                  } else if (hasCurrentDocs) {
                    statusColor = 'bg-green-100 text-green-800';
                    statusText = 'Current';
                  }

                  return (
                    <div key={category.id} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {subcontractor.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Notes</h4>
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-gray-700">{subcontractor.notes}</p>
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

// Placeholder components for Documents and Project Invite modals
const DocumentsModal: React.FC<{ 
  subcontractor: Subcontractor; 
  onClose: () => void;
  onDocumentUpdate: (subcontractor: Subcontractor) => void;
}> = ({ subcontractor, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Document Management - {subcontractor.companyName}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <p className="text-gray-600 mb-4">Document management system coming soon...</p>
      <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">Close</button>
    </div>
  </div>
);

const ProjectInviteModal: React.FC<{ 
  subcontractor: Subcontractor; 
  onClose: () => void;
  onSend: (invitation: any) => void;
}> = ({ subcontractor, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Send Project Invitation - {subcontractor.companyName}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <p className="text-gray-600 mb-4">Project invitation system coming soon...</p>
      <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">Close</button>
    </div>
  </div>
);