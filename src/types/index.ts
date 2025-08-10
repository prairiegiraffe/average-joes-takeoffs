export interface Project {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

export interface User {
  name: string;
  email: string;
  company: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: Date;
  expirationDate?: Date;
}

export interface DocumentTab {
  id: string;
  name: string;
  description: string;
  files: DocumentFile[];
}

export type DocumentTabType = 'w9' | 'license' | 'insurance' | 'certificates';

export interface ContractorProfile {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  licenseNumber: string;
  yearsInBusiness: number;
  specialties: string[];
  documents: Record<DocumentTabType, DocumentFile[]>;
}