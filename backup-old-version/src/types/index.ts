export interface CustomerProject {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  projectAddress: string;
  projectType: ProjectType;
  estimatedValue: number;
  actualCost?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: Date;
  completedDate?: Date;
  takeoffs: TakeoffProject[];
  notes: string;
  createdDate: Date;
  updatedDate: Date;
}

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
  website?: string;
  licenseNumber: string;
  yearsInBusiness: number;
  specialties: string[];
  documents: Record<DocumentTabType, DocumentFile[]>;
}

export type CustomerStatus = 'active_project' | 'closed_project' | 'active_lead' | 'dead_lead';

export type ProjectType = 'roofing' | 'siding' | 'windows' | 'gutters' | 'insulation' | 'general';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectAddress: string;
  projectType: ProjectType;
  estimatedValue: number;
  status: CustomerStatus;
  lastContact: Date;
  projects: CustomerProject[];
  notes: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface CustomerStats {
  activeProjects: number;
  closedProjects: number;
  activeLeads: number;
  deadLeads: number;
  totalValue: number;
}

export type DistributorSpecialty = 'roofing' | 'siding' | 'windows' | 'gutters' | 'decking' | 'concrete' | 'insulation' | 'general';

export interface Distributor {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  specialties: DistributorSpecialty[];
  notes: string;
  isPreferred: boolean;
  createdDate: Date;
  updatedDate: Date;
}

export interface TakeoffSend {
  id: string;
  distributorId: string;
  takeoffType: ProjectType;
  sentDate: Date;
  message: string;
  status: 'sent' | 'opened' | 'responded';
}

export interface SendTakeoffRequest {
  distributorIds: string[];
  takeoffType: ProjectType;
  message: string;
  takeoffData?: any;
}

export type TradeSpecialty = 'electrical' | 'plumbing' | 'hvac' | 'flooring' | 'drywall' | 'painting' | 'carpentry' | 'masonry' | 'landscaping' | 'concrete' | 'roofing' | 'siding' | 'insulation' | 'demolition' | 'general';

export type SubcontractorStatus = 'active' | 'inactive' | 'preferred';

export type InsuranceStatus = 'current' | 'expiring_soon' | 'expired';

export type DocumentCategory = 'msa' | 'general_liability' | 'workers_comp' | 'business_license' | 'trade_certifications' | 'w9' | 'safety_certificates';

export interface SubcontractorDocument {
  id: string;
  category: DocumentCategory;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: Date;
  expirationDate?: Date;
  status?: 'current' | 'expiring_soon' | 'expired';
}

export interface Subcontractor {
  id: string;
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
  rating: number; // 1-5 stars
  totalProjects: number;
  notes: string;
  documents: Record<DocumentCategory, SubcontractorDocument[]>;
  createdDate: Date;
  updatedDate: Date;
  lastProjectDate?: Date;
}

export interface ProjectAssignment {
  id: string;
  subcontractorId: string;
  projectName: string;
  projectType: TradeSpecialty;
  startDate: Date;
  endDate?: Date;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  rating?: number;
  feedback?: string;
}

export interface ProjectInvitation {
  id: string;
  subcontractorId: string;
  projectName: string;
  projectType: TradeSpecialty;
  description: string;
  startDate: Date;
  estimatedDuration: number; // days
  budgetRange: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
  sentDate: Date;
}

export type TakeoffType = 'roofing' | 'siding' | 'stone' | 'windows' | 'gutters' | 'insulation' | 'flooring' | 'drywall' | 'painting' | 'general';

export type TakeoffStatus = 'draft' | 'in_progress' | 'completed' | 'sent' | 'approved' | 'declined';

export interface TakeoffProject {
  id: string;
  name: string;
  type: TakeoffType;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerProjectId?: string;
  customerProjectName?: string;
  projectAddress: string;
  status: TakeoffStatus;
  estimatedValue?: number;
  actualCost?: number;
  notes: string;
  createdDate: Date;
  updatedDate: Date;
  completedDate?: Date;
  sentDate?: Date;
  // Roofing-specific data (when type is 'roofing')
  elevationData?: any[];
  totalSquareFeet?: number;
  totalBundles?: number;
  totalUnderlayment?: number;
}

export interface TakeoffTemplate {
  id: string;
  name: string;
  type: TakeoffType;
  description: string;
  defaultFields: string[];
  isActive: boolean;
}

// Manufacturer System Types
export type ManufacturerCategory = 'roofing' | 'siding' | 'stone' | 'windows' | 'gutters' | 'insulation' | 'flooring' | 'drywall' | 'painting' | 'general';

export interface ProductColor {
  id: string;
  name: string;
  hexCode?: string;
  description?: string;
  isPopular?: boolean;
}

export type CalculationMethod = 'per_square_foot' | 'per_linear_foot' | 'per_piece' | 'percentage' | 'fixed_quantity';

export interface HardwareAccessory {
  id: string;
  name: string;
  description?: string;
  sku?: string; // SKU field for product identification
  pricePerUnit: number;
  unit: string; // 'piece', 'linear_ft', 'box', etc.
  calculationMethod: CalculationMethod;
  calculationValue: number; // multiplier or fixed quantity based on method
  isRequired: boolean;
  category: 'hardware' | 'accessory' | 'fastener' | 'trim' | 'underlayment' | 'flashing' | 'roofing' | 'siding' | 'stone';
  distributorId?: string; // Link to distributor that supplies this item
}

export interface ProductLine {
  id: string;
  name: string;
  description?: string;
  category: ManufacturerCategory;
  colors: ProductColor[];
  pricePerUnit?: number;
  unit?: string; // 'sq_ft', 'bundle', 'linear_ft', etc.
  hardware: HardwareAccessory[];
  isActive: boolean;
}

export interface Manufacturer {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  categories: ManufacturerCategory[];
  productLines: ProductLine[];
  isGlobal: boolean; // true = available to all contractors, false = contractor-specific
  contractorId?: string; // if not global, which contractor added it
  createdBy: 'admin' | 'contractor';
  createdDate: Date;
  updatedDate: Date;
  isActive: boolean;
}

export interface HardwareCalculation {
  hardwareId: string;
  name: string;
  calculatedQuantity: number;
  overrideQuantity?: number; // contractor can override
  overridePrice?: number; // contractor can override price
  finalQuantity: number; // calculated or override
  pricePerUnit: number;
  finalPricePerUnit: number; // calculated or override price
  unit: string;
  totalCost: number;
  category: string;
}

export interface ManufacturerSelection {
  manufacturerId: string;
  manufacturerName: string;
  productLineId: string;
  productLineName: string;
  colorId: string;
  colorName: string;
  colorHex?: string;
  category: ManufacturerCategory;
  pricePerUnit?: number;
  unit?: string;
  hardwareCalculations?: HardwareCalculation[];
}

export interface ManufacturerRequest {
  id: string;
  contractorId: string;
  contractorName: string;
  requestedManufacturer: {
    name: string;
    website?: string;
    categories: ManufacturerCategory[];
    reason: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
  reviewedDate?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface DefaultManufacturers {
  category: ManufacturerCategory;
  manufacturerIds: string[];
}

// Updated TakeoffProject to include manufacturer selections
export interface TakeoffProjectWithManufacturers extends TakeoffProject {
  manufacturerSelections?: ManufacturerSelection[];
}