import React, { useState } from 'react';
import { Camera, Upload, Download, Trash2, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import type { DocumentFile, DocumentTabType, ContractorProfile } from '../types';

const DOCUMENT_TABS = [
  {
    id: 'w9' as DocumentTabType,
    name: 'W-9',
    description: 'Tax form required for business verification'
  },
  {
    id: 'license' as DocumentTabType,
    name: 'License',
    description: 'General contractor license documents'
  },
  {
    id: 'insurance' as DocumentTabType,
    name: 'Insurance',
    description: 'Liability, E&O, Workers Comp, Umbrella'
  },
  {
    id: 'certificates' as DocumentTabType,
    name: 'Certificates',
    description: 'Awards and certifications for social proof'
  }
];

interface DocumentUploadProps {
  tabType: DocumentTabType;
  files: DocumentFile[];
  onFileUpload: (tabType: DocumentTabType, files: FileList) => void;
  onFileDelete: (tabType: DocumentTabType, fileId: string) => void;
  onEmailFile: (file: DocumentFile) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  tabType,
  files,
  onFileUpload,
  onFileDelete,
  onEmailFile
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [expirationDates, setExpirationDates] = useState<Record<string, string>>({});

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(tabType, e.dataTransfer.files);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(tabType, e.target.files);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        onFileUpload(tabType, target.files);
      }
    };
    input.click();
  };

  const getExpirationStatus = (file: DocumentFile) => {
    if (!file.expirationDate || tabType !== 'insurance') return null;
    
    const now = new Date();
    const expiry = new Date(file.expirationDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', icon: AlertTriangle };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'yellow', icon: AlertTriangle };
    } else {
      return { status: 'current', color: 'green', icon: CheckCircle };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl text-gray-400 mb-4">📁</div>
          <div className="text-lg font-medium text-gray-900">Drop files here or click to upload</div>
          <div className="text-sm text-gray-500">Supports PNG, JPG, PDF files up to 10MB</div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCameraCapture}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Picture
            </button>
            
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Uploaded Files</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => {
              const expirationStatus = getExpirationStatus(file);
              return (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    expirationStatus?.status === 'expired'
                      ? 'border-red-200 bg-red-50'
                      : expirationStatus?.status === 'expiring'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <FileText className="w-8 h-8 text-gray-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                        
                        {/* Expiration Status */}
                        {expirationStatus && (
                          <div className="flex items-center mt-2">
                            <expirationStatus.icon className={`w-4 h-4 mr-1 text-${expirationStatus.color}-500`} />
                            <span className={`text-xs font-medium text-${expirationStatus.color}-700`}>
                              {expirationStatus.status === 'expired'
                                ? 'Expired'
                                : expirationStatus.status === 'expiring'
                                ? 'Expires Soon'
                                : 'Current'}
                            </span>
                          </div>
                        )}
                        
                        {/* Insurance Expiration Date Input */}
                        {tabType === 'insurance' && (
                          <div className="mt-2">
                            <label className="block text-xs text-gray-600 mb-1">Expiration Date</label>
                            <input
                              type="date"
                              value={expirationDates[file.id] || file.expirationDate?.toISOString().split('T')[0] || ''}
                              onChange={(e) => setExpirationDates(prev => ({ ...prev, [file.id]: e.target.value }))}
                              className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => onEmailFile(file)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Email file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onFileDelete(tabType, file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocumentTabType>('w9');
  const [profile, setProfile] = useState<ContractorProfile>({
    businessName: 'Average Joe Construction',
    contactName: 'Joe Smith',
    email: 'joe@averagejoeconstruction.com',
    phone: '(555) 123-4567',
    address: '123 Main Street',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    licenseNumber: 'CLB123456',
    yearsInBusiness: 15,
    specialties: ['Roofing', 'Siding', 'Windows'],
    documents: {
      w9: [],
      license: [],
      insurance: [],
      certificates: []
    }
  });

  const handleProfileUpdate = (field: keyof ContractorProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (tabType: DocumentTabType, files: FileList) => {
    const newFiles: DocumentFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadDate: new Date()
    }));

    setProfile(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [tabType]: [...prev.documents[tabType], ...newFiles]
      }
    }));
  };

  const handleFileDelete = (tabType: DocumentTabType, fileId: string) => {
    setProfile(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [tabType]: prev.documents[tabType].filter(file => file.id !== fileId)
      }
    }));
  };

  const handleEmailFile = (file: DocumentFile) => {
    // In a real app, this would open email client or send file
    alert(`Emailing file: ${file.name}`);
  };

  const activeTabData = DOCUMENT_TABS.find(tab => tab.id === activeTab)!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contractor Profile</h1>
      
      {/* Business Information Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => handleProfileUpdate('businessName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input
              type="text"
              value={profile.contactName}
              onChange={(e) => handleProfileUpdate('contactName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleProfileUpdate('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => handleProfileUpdate('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => handleProfileUpdate('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={profile.state}
              onChange={(e) => handleProfileUpdate('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={profile.zip}
              onChange={(e) => handleProfileUpdate('zip', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
            <input
              type="text"
              value={profile.licenseNumber}
              onChange={(e) => handleProfileUpdate('licenseNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Document Tabs Section */}
      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {DOCUMENT_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const fileCount = profile.documents[tab.id].length;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {fileCount > 0 && (
                    <span className={`ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {fileCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeTabData.name} Documents</h3>
            <p className="text-gray-600">{activeTabData.description}</p>
          </div>
          
          <DocumentUpload
            tabType={activeTab}
            files={profile.documents[activeTab]}
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
            onEmailFile={handleEmailFile}
          />
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => alert('Profile saved!')}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};