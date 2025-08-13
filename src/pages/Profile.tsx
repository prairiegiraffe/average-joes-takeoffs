import React, { useState, useEffect } from 'react';
import { Camera, Upload, Download, Trash2, FileText, AlertTriangle, CheckCircle, Sun, Moon } from 'lucide-react';
import type { DocumentFile, DocumentTabType, ContractorProfile } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { contractorProfileService } from '../utils/contractorProfileService';
import { TestSupabaseButton } from '../components/TestSupabaseButton';

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
          dragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl text-gray-400 dark:text-gray-500 mb-4">📁</div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">Drop files here or click to upload</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Supports PNG, JPG, PDF files up to 10MB</div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCameraCapture}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Picture
            </button>
            
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
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
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Uploaded Files</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => {
              const expirationStatus = getExpirationStatus(file);
              return (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    expirationStatus?.status === 'expired'
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900'
                      : expirationStatus?.status === 'expiring'
                      ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
                            <input
                              type="date"
                              value={expirationDates[file.id] || file.expirationDate?.toISOString().split('T')[0] || ''}
                              onChange={(e) => setExpirationDates(prev => ({ ...prev, [file.id]: e.target.value }))}
                              className="text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 w-full"
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
  const { theme, toggleTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<DocumentTabType>('w9');
  const [profile, setProfile] = useState<ContractorProfile>(contractorProfileService.getDefaultProfile());
  const [loading, setLoading] = useState(true);

  // Load profile from Supabase or localStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        let profileData = await contractorProfileService.getProfile();
        
        if (!profileData) {
          profileData = contractorProfileService.getDefaultProfile();
        }
        
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading contractor profile:', error);
        setProfile(contractorProfileService.getDefaultProfile());
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileUpdate = async (field: keyof ContractorProfile, value: any) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    
    try {
      // Save to Supabase (which also saves to localStorage as backup)
      await contractorProfileService.saveProfile(updatedProfile);
      // Dispatch custom event to notify sidebar of update
      window.dispatchEvent(new CustomEvent('profileUpdate'));
    } catch (error) {
      console.error('Error saving profile:', error);
      // Even if Supabase save fails, the localStorage backup ensures data isn't lost
    }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading contractor profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Contractor Profile</h1>
      
      {/* Test Supabase Button - Remove this after testing */}
      <TestSupabaseButton />
      
      {/* Business Information Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Business Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => handleProfileUpdate('businessName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Name</label>
            <input
              type="text"
              value={profile.contactName}
              onChange={(e) => handleProfileUpdate('contactName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleProfileUpdate('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => handleProfileUpdate('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => handleProfileUpdate('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
            <input
              type="text"
              value={profile.state}
              onChange={(e) => handleProfileUpdate('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ZIP Code</label>
            <input
              type="text"
              value={profile.zip}
              onChange={(e) => handleProfileUpdate('zip', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">License Number</label>
            <input
              type="text"
              value={profile.licenseNumber}
              onChange={(e) => handleProfileUpdate('licenseNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Theme Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">App Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Theme Preference</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose your preferred theme for the application interface.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Light Mode Option */}
              <div 
                onClick={() => setTheme('light')}
                className={`flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  theme === 'light' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    theme === 'light' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Sun className={`h-5 w-5 ${
                      theme === 'light' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      theme === 'light' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Light Mode
                    </h4>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      Clean, bright interface perfect for daylight work
                    </p>
                  </div>
                  {theme === 'light' && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dark Mode Option */}
              <div 
                onClick={() => setTheme('dark')}
                className={`flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    theme === 'dark' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Moon className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      theme === 'dark' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Dark Mode
                    </h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      Easy on the eyes for low-light environments
                    </p>
                  </div>
                  {theme === 'dark' && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="mt-4">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                {theme === 'light' ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document Tabs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
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
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.name}
                  {fileCount > 0 && (
                    <span className={`ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                      isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{activeTabData.name} Documents</h3>
            <p className="text-gray-600 dark:text-gray-400">{activeTabData.description}</p>
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
          onClick={async () => {
            try {
              const success = await contractorProfileService.saveProfile(profile);
              if (success) {
                alert('Profile saved successfully!');
                window.dispatchEvent(new CustomEvent('profileUpdate'));
              } else {
                alert('Error saving profile. Please try again.');
              }
            } catch (error) {
              console.error('Error saving profile:', error);
              alert('Error saving profile. Please try again.');
            }
          }}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};