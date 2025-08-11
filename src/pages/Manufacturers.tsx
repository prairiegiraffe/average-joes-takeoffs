import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, ExternalLink, Building, Package, Palette, Settings } from 'lucide-react';
import { getCurrentUser, isSuperAdmin } from '../utils/auth';
import type { 
  Manufacturer, 
  ManufacturerCategory, 
  ProductLine, 
  ProductColor,
  ManufacturerRequest
} from '../types';

// Category configurations
const MANUFACTURER_CATEGORIES: { id: ManufacturerCategory; name: string; icon: string; color: string }[] = [
  { id: 'roofing', name: 'Roofing', icon: '🏠', color: 'bg-blue-100 text-blue-800' },
  { id: 'siding', name: 'Siding', icon: '🏘️', color: 'bg-teal-100 text-teal-800' },
  { id: 'stone', name: 'Stone Siding', icon: '🧱', color: 'bg-stone-100 text-stone-800' },
  { id: 'windows', name: 'Windows', icon: '🪟', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'gutters', name: 'Gutters', icon: '🌧️', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'insulation', name: 'Insulation', icon: '🧊', color: 'bg-purple-100 text-purple-800' },
  { id: 'flooring', name: 'Flooring', icon: '🏗️', color: 'bg-orange-100 text-orange-800' },
  { id: 'drywall', name: 'Drywall', icon: '🧱', color: 'bg-gray-100 text-gray-800' },
  { id: 'painting', name: 'Painting', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
  { id: 'general', name: 'General', icon: '👷', color: 'bg-green-100 text-green-800' }
];

// Sample manufacturer data
const createSampleManufacturers = (): Manufacturer[] => [
  {
    id: '1',
    name: 'GAF Materials Corporation',
    website: 'https://www.gaf.com',
    phone: '1-877-423-7663',
    email: 'info@gaf.com',
    categories: ['roofing'],
    productLines: [
      {
        id: 'gaf-timberline-hd',
        name: 'Timberline HD Shingles',
        description: 'Architectural shingles with Advanced Protection Shingle Technology',
        category: 'roofing',
        colors: [
          { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F', isPopular: true },
          { id: 'pewter-gray', name: 'Pewter Gray', hexCode: '#8C8C8C', isPopular: true },
          { id: 'weathered-wood', name: 'Weathered Wood', hexCode: '#8B7355', isPopular: true },
          { id: 'mission-brown', name: 'Mission Brown', hexCode: '#654321' },
          { id: 'shakewood', name: 'Shakewood', hexCode: '#DEB887' }
        ],
        pricePerUnit: 85,
        unit: 'bundle',
        hardware: [],
        isActive: true
      },
      {
        id: 'gaf-grand-sequoia',
        name: 'Grand Sequoia Designer Shingles',
        description: 'Premium designer shingles with ultra-dimensional appearance',
        category: 'roofing',
        colors: [
          { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F' },
          { id: 'amber-wheat', name: 'Amber Wheat', hexCode: '#F5DEB3' },
          { id: 'storm-cloud-gray', name: 'Storm Cloud Gray', hexCode: '#778899' }
        ],
        pricePerUnit: 125,
        unit: 'bundle',
        hardware: [],
        isActive: true
      }
    ],
    isGlobal: true,
    createdBy: 'admin',
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '2',
    name: 'Owens Corning',
    website: 'https://www.owenscorning.com',
    phone: '1-800-GETCORNING',
    email: 'roofing@owenscorning.com',
    categories: ['roofing', 'insulation'],
    productLines: [
      {
        id: 'oc-duration',
        name: 'Duration Architectural Shingles',
        description: 'Patented SureNail Technology for enhanced performance',
        category: 'roofing',
        colors: [
          { id: 'onyx-black', name: 'Onyx Black', hexCode: '#0F0F0F', isPopular: true },
          { id: 'estate-gray', name: 'Estate Gray', hexCode: '#708090', isPopular: true },
          { id: 'driftwood', name: 'Driftwood', hexCode: '#8B7D6B', isPopular: true },
          { id: 'brownwood', name: 'Brownwood', hexCode: '#8B4513' }
        ],
        pricePerUnit: 90,
        unit: 'bundle',
        hardware: [
          {
            id: 'oc-starter-strip',
            name: 'OC Starter Strip Shingles',
            description: 'Owens Corning starter strip shingles',
            sku: 'OC-START-STD',
            pricePerUnit: 2.15,
            unit: 'linear_ft',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.12, // perimeter estimate
            isRequired: true,
            category: 'roofing'
          },
          {
            id: 'oc-ridge-cap',
            name: 'OC Hip & Ridge Cap Shingles',
            description: 'Owens Corning hip and ridge cap shingles',
            sku: 'OC-RIDGE-CAP',
            pricePerUnit: 165.00,
            unit: 'bundle',
            calculationMethod: 'per_linear_foot',
            calculationValue: 0.03, // ~33 lin ft per bundle
            isRequired: false,
            category: 'roofing'
          },
          {
            id: 'oc-underlayment',
            name: 'OC ProArmor Synthetic Underlayment',
            description: 'High-performance synthetic underlayment',
            sku: 'OC-PROARMOR',
            pricePerUnit: 95.00,
            unit: 'roll',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.002, // ~500 sq ft per roll
            isRequired: true,
            category: 'roofing'
          },
          {
            id: 'oc-nails',
            name: 'OC Roofing Nails (1.25")',
            description: 'Galvanized roofing nails for OC shingles',
            sku: 'OC-NAILS-125',
            pricePerUnit: 52.00,
            unit: 'box',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.01, // 1 box per 100 sq ft
            isRequired: true,
            category: 'roofing'
          }
        ],
        isActive: true
      },
      {
        id: 'oc-r30-insulation',
        name: 'R-30 Blown-In Insulation',
        description: 'Energy-efficient blown-in insulation',
        category: 'insulation',
        colors: [
          { id: 'pink', name: 'Pink', hexCode: '#FFC0CB' }
        ],
        pricePerUnit: 1.25,
        unit: 'sq_ft',
        hardware: [],
        isActive: true
      }
    ],
    isGlobal: true,
    createdBy: 'admin',
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '3',
    name: 'James Hardie Building Products',
    website: 'https://www.jameshardie.com',
    phone: '1-888-JHARDIE',
    email: 'info@jameshardie.com',
    categories: ['siding'],
    productLines: [
      {
        id: 'jh-hardieplank',
        name: 'HardiePlank Lap Siding',
        description: 'Fiber cement siding with authentic wood appearance',
        category: 'siding',
        colors: [
          { id: 'arctic-white', name: 'Arctic White', hexCode: '#FFFFFF', isPopular: true },
          { id: 'evening-blue', name: 'Evening Blue', hexCode: '#2F4F4F', isPopular: true },
          { id: 'sandstone-beige', name: 'Sandstone Beige', hexCode: '#F5F5DC', isPopular: true },
          { id: 'forest-green', name: 'Forest Green', hexCode: '#228B22' },
          { id: 'iron-gray', name: 'Iron Gray', hexCode: '#708090' }
        ],
        pricePerUnit: 3.50,
        unit: 'sq_ft',
        hardware: [
          {
            id: 'jh-siding-nails',
            name: 'James Hardie Siding Nails',
            description: 'Galvanized siding nails for HardiePlank installation',
            sku: 'JH-NAILS-SID',
            pricePerUnit: 48.00,
            unit: 'box',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.012, // 1 box per ~85 sq ft
            isRequired: true,
            category: 'siding'
          },
          {
            id: 'jh-house-wrap',
            name: 'HardieWrap Weather Barrier',
            description: 'James Hardie weather-resistant barrier',
            sku: 'JH-WRAP',
            pricePerUnit: 85.00,
            unit: 'roll',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.002, // 1 roll per ~500 sq ft
            isRequired: true,
            category: 'siding'
          },
          {
            id: 'jh-caulk',
            name: 'HardieCaulk Premium Sealant',
            description: 'Color-matched sealant for trim and joints',
            sku: 'JH-CAULK',
            pricePerUnit: 12.50,
            unit: 'tube',
            calculationMethod: 'per_linear_foot',
            calculationValue: 0.02, // 1 tube per 50 lin ft
            isRequired: false,
            category: 'siding'
          },
          {
            id: 'jh-j-channel',
            name: 'HardieTrim J-Channel',
            description: 'Finishing trim for windows and doors',
            sku: 'JH-JCHAN',
            pricePerUnit: 4.25,
            unit: 'linear_ft',
            calculationMethod: 'fixed_quantity',
            calculationValue: 0,
            isRequired: false,
            category: 'siding'
          },
          {
            id: 'jh-starter-strip',
            name: 'HardieTrim Starter Strip',
            description: 'Bottom starter strip for first course',
            sku: 'JH-START',
            pricePerUnit: 3.50,
            unit: 'linear_ft',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.1, // perimeter estimate
            isRequired: true,
            category: 'siding'
          }
        ],
        isActive: true
      }
    ],
    isGlobal: true,
    createdBy: 'admin',
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '4',
    name: 'Pella Corporation',
    website: 'https://www.pella.com',
    phone: '1-877-473-5527',
    email: 'info@pella.com',
    categories: ['windows'],
    productLines: [
      {
        id: 'pella-350-series',
        name: '350 Series Vinyl Windows',
        description: 'Energy-efficient vinyl windows with multiple style options',
        category: 'windows',
        colors: [
          { id: 'white', name: 'White', hexCode: '#FFFFFF', isPopular: true },
          { id: 'almond', name: 'Almond', hexCode: '#FFEBCD', isPopular: true },
          { id: 'bronze', name: 'Bronze', hexCode: '#CD7F32' }
        ],
        pricePerUnit: 450,
        unit: 'each',
        hardware: [],
        isActive: true
      }
    ],
    isGlobal: true,
    createdBy: 'admin',
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '4',
    name: 'Versetta Stone',
    website: 'https://www.versettastone.com',
    phone: '1-800-255-1727',
    email: 'info@versettastone.com',
    categories: ['stone'],
    productLines: [
      {
        id: 'versetta-ledgestone',
        name: 'Versetta Stone Ledgestone',
        description: 'Authentic stone appearance with easy installation',
        category: 'stone',
        colors: [
          { id: 'canyon', name: 'Canyon', hexCode: '#B8860B', isPopular: true },
          { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F', isPopular: true },
          { id: 'weathered-blend', name: 'Weathered Blend', hexCode: '#8B7355', isPopular: true },
          { id: 'timber', name: 'Timber', hexCode: '#8B4513' }
        ],
        pricePerUnit: 4.50,
        unit: 'sq_ft',
        hardware: [
          {
            id: 'versetta-clips',
            name: 'Versetta Stone Clips',
            description: 'Specialized clips for Versetta Stone installation',
            pricePerUnit: 125.00,
            unit: 'box',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.02,
            isRequired: true,
            category: 'hardware'
          },
          {
            id: 'versetta-screws',
            name: 'Stone Fastening Screws',
            description: 'Self-drilling screws for stone attachment',
            pricePerUnit: 85.00,
            unit: 'box',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.015,
            isRequired: true,
            category: 'fastener'
          }
        ],
        isActive: true
      },
      {
        id: 'versetta-tightcut',
        name: 'Versetta Stone Tight Cut',
        description: 'Precision-cut stone veneer for contemporary looks',
        category: 'stone',
        colors: [
          { id: 'canyon', name: 'Canyon', hexCode: '#B8860B', isPopular: true },
          { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F', isPopular: true },
          { id: 'ivory', name: 'Ivory', hexCode: '#FFFFF0' }
        ],
        pricePerUnit: 4.75,
        unit: 'sq_ft',
        hardware: [
          {
            id: 'versetta-tightcut-clips',
            name: 'Tight Cut Installation Clips',
            description: 'Precision clips for Tight Cut stone panels',
            pricePerUnit: 135.00,
            unit: 'box',
            calculationMethod: 'per_square_foot',
            calculationValue: 0.022,
            isRequired: true,
            category: 'hardware'
          }
        ],
        isActive: true
      }
    ],
    isGlobal: true,
    createdBy: 'admin',
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date('2024-01-15'),
    isActive: true
  }
];

export const Manufacturers: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ManufacturerCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'admin'>('list');

  const user = getCurrentUser();
  const isAdmin = isSuperAdmin(user);

  // Initialize with sample data
  useEffect(() => {
    console.log('Manufacturers page: Loading data');
    const savedManufacturers = localStorage.getItem('manufacturers');
    
    if (savedManufacturers) {
      console.log('Manufacturers page: Found existing data');
      const parsed = JSON.parse(savedManufacturers);
      console.log('Manufacturers page: Loaded', parsed.length, 'manufacturers');
      
      // Check if Versetta Stone exists, if not add it
      const hasVersettaStone = parsed.some((mfg: any) => mfg.name === 'Versetta Stone');
      
      let updatedManufacturers = parsed;
      if (!hasVersettaStone) {
        console.log('Adding Versetta Stone test manufacturer...');
        const versettaStone = {
          id: Date.now().toString(),
          name: 'Versetta Stone',
          website: 'https://www.versettastone.com',
          phone: '1-800-255-1727',
          email: 'info@versettastone.com',
          categories: ['stone'],
          productLines: [
            {
              id: 'versetta-ledgestone',
              name: 'Versetta Stone Ledgestone',
              description: 'Authentic stone appearance with easy installation',
              category: 'stone',
              colors: [
                { id: 'canyon', name: 'Canyon', hexCode: '#B8860B', isPopular: true },
                { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F', isPopular: true },
                { id: 'weathered-blend', name: 'Weathered Blend', hexCode: '#8B7355', isPopular: true },
                { id: 'timber', name: 'Timber', hexCode: '#8B4513' }
              ],
              pricePerUnit: 4.50,
              unit: 'sq_ft',
              hardware: [],
              isActive: true
            },
            {
              id: 'versetta-tightcut',
              name: 'Versetta Stone Tight Cut',
              description: 'Precision-cut stone veneer for contemporary looks',
              category: 'stone',
              colors: [
                { id: 'canyon', name: 'Canyon', hexCode: '#B8860B', isPopular: true },
                { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F', isPopular: true },
                { id: 'ivory', name: 'Ivory', hexCode: '#FFFFF0' }
              ],
              pricePerUnit: 4.75,
              unit: 'sq_ft',
              hardware: [],
              isActive: true
            }
          ],
          isGlobal: true,
          createdBy: 'admin',
          createdDate: new Date(),
          updatedDate: new Date(),
          isActive: true
        };
        updatedManufacturers = [...parsed, versettaStone];
        localStorage.setItem('manufacturers', JSON.stringify(updatedManufacturers));
      }
      
      const manufacturersWithDates = updatedManufacturers.map((mfg: any) => ({
        ...mfg,
        createdDate: new Date(mfg.createdDate),
        updatedDate: new Date(mfg.updatedDate)
      }));
      setManufacturers(manufacturersWithDates);
    } else {
      console.log('Manufacturers page: No data found, creating sample data');
      const sampleData = createSampleManufacturers();
      console.log('Manufacturers page: Created', sampleData.length, 'sample manufacturers');
      console.log('Sample manufacturers:', sampleData.map(m => ({ name: m.name, categories: m.categories })));
      setManufacturers(sampleData);
      localStorage.setItem('manufacturers', JSON.stringify(sampleData));
      console.log('Manufacturers page: Saved sample data to localStorage');
    }
  }, []);

  // Save to localStorage whenever manufacturers change
  useEffect(() => {
    if (manufacturers.length > 0) {
      localStorage.setItem('manufacturers', JSON.stringify(manufacturers));
    }
  }, [manufacturers]);


  // Filter and search logic
  useEffect(() => {
    let filtered = [...manufacturers];

    // Filter by user access (contractors only see global + their own)
    if (!isAdmin && user) {
      filtered = filtered.filter(mfg => 
        mfg.isGlobal || mfg.contractorId === user.email
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mfg =>
        mfg.name.toLowerCase().includes(query) ||
        mfg.categories.some(cat => cat.toLowerCase().includes(query)) ||
        mfg.productLines.some(pl => pl.name.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter(mfg =>
        mfg.categories.includes(selectedCategoryFilter)
      );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredManufacturers(filtered);
  }, [manufacturers, searchQuery, selectedCategoryFilter, isAdmin, user?.email]);

  // Get category configuration
  const getCategoryConfig = (category: ManufacturerCategory) => {
    return MANUFACTURER_CATEGORIES.find(c => c.id === category) || MANUFACTURER_CATEGORIES[0];
  };

  // Get category count
  const getCategoryCount = (category: ManufacturerCategory) => {
    return manufacturers.filter(mfg => mfg.categories.includes(category)).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manufacturers</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your manufacturer database and product catalogs</p>
          </div>
          <div className="flex space-x-3">
            {!isAdmin && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Request Manufacturer
              </button>
            )}
            <Link
              to="/manufacturers/generic-hardware"
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
            >
              <Settings className="h-5 w-5 mr-2" />
              Generic Hardware
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              {isAdmin ? 'Add Global Manufacturer' : 'Add Custom Manufacturer'}
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentView(currentView === 'list' ? 'admin' : 'list')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
              >
                <Settings className="h-5 w-5 mr-2" />
                {currentView === 'list' ? 'Admin Panel' : 'Back to List'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Manufacturers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredManufacturers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Product Lines</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredManufacturers.reduce((sum, mfg) => sum + mfg.productLines.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Color Options</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredManufacturers.reduce((sum, mfg) => 
                  sum + mfg.productLines.reduce((lineSum, line) => lineSum + line.colors.length, 0), 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Filter className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(manufacturers.flatMap(mfg => mfg.categories)).size}
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
                placeholder="Search manufacturers, categories, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value as ManufacturerCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {MANUFACTURER_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name} ({getCategoryCount(category.id)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredManufacturers.length} of {manufacturers.length} manufacturers
        </p>
      </div>

      {/* Manufacturer List */}
      <div className="space-y-4">
        {filteredManufacturers.map((manufacturer) => (
          <div key={manufacturer.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Building className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{manufacturer.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        {manufacturer.website && (
                          <a 
                            href={manufacturer.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        )}
                        {manufacturer.phone && (
                          <span className="text-gray-600 text-sm">{manufacturer.phone}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          {manufacturer.isGlobal ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Global
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {manufacturer.categories.map((category) => {
                        const config = getCategoryConfig(category);
                        return (
                          <span
                            key={category}
                            className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}
                          >
                            {config.icon} {config.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Product Lines */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Product Lines ({manufacturer.productLines.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {manufacturer.productLines.slice(0, 6).map((productLine) => (
                        <div key={productLine.id} className="border border-gray-200 rounded-md p-3">
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{productLine.name}</div>
                          <div className="text-xs text-gray-500 mb-2">{productLine.description}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">
                              {productLine.colors.length} colors
                            </div>
                            {productLine.pricePerUnit && (
                              <div className="text-xs font-medium text-green-600">
                                ${productLine.pricePerUnit}/{productLine.unit}
                              </div>
                            )}
                          </div>
                          {/* Color Swatches */}
                          <div className="flex space-x-1 mt-2">
                            {productLine.colors.slice(0, 5).map((color) => (
                              <div
                                key={color.id}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hexCode || '#ccc' }}
                                title={color.name}
                              />
                            ))}
                            {productLine.colors.length > 5 && (
                              <div className="w-4 h-4 rounded-full bg-gray-200 border border-gray-300 text-xs flex items-center justify-center">
                                +{productLine.colors.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {manufacturer.productLines.length > 6 && (
                      <div className="mt-2 text-sm text-gray-500">
                        +{manufacturer.productLines.length - 6} more product lines
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => {
                      setSelectedManufacturer(manufacturer);
                      setShowEditModal(true);
                    }}
                    className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  {(isAdmin || manufacturer.contractorId === user?.email) && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this manufacturer?')) {
                          setManufacturers(prev => prev.filter(m => m.id !== manufacturer.id));
                        }
                      }}
                      className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredManufacturers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">No manufacturers found</p>
            <p className="text-sm">Add manufacturers to get started</p>
          </div>
        </div>
      )}

      {/* Modals would be implemented here */}
      {showAddModal && (
        <AddManufacturerModal
          isAdmin={isAdmin}
          onClose={() => setShowAddModal(false)}
          onSave={(newManufacturer) => {
            const manufacturerWithId = {
              ...newManufacturer,
              id: Date.now().toString(),
              createdDate: new Date(),
              updatedDate: new Date(),
              createdBy: isAdmin ? 'admin' : 'contractor',
              isGlobal: isAdmin,
              contractorId: !isAdmin ? user?.email : undefined
            };
            setManufacturers(prev => [...prev, manufacturerWithId]);
            setShowAddModal(false);
          }}
        />
      )}

      {showEditModal && selectedManufacturer && (
        <EditManufacturerModal
          manufacturer={selectedManufacturer}
          isAdmin={isAdmin}
          onClose={() => {
            setShowEditModal(false);
            setSelectedManufacturer(null);
          }}
          onSave={(updatedManufacturer) => {
            setManufacturers(prev => prev.map(m => 
              m.id === selectedManufacturer.id ? updatedManufacturer : m
            ));
            setShowEditModal(false);
            setSelectedManufacturer(null);
          }}
        />
      )}

      {showRequestModal && (
        <RequestManufacturerModal
          onClose={() => setShowRequestModal(false)}
          onSubmit={(request) => {
            // Save request logic would go here
            alert('Manufacturer request submitted for admin review!');
            setShowRequestModal(false);
          }}
        />
      )}

    </div>
  );
};

// Placeholder modal components
interface NewManufacturerData {
  name: string;
  website?: string;
  phone?: string;
  email?: string;
  categories: ManufacturerCategory[];
  productLines: Omit<ProductLine, 'id'>[];
  isActive: boolean;
}

const AddManufacturerModal: React.FC<{
  isAdmin: boolean;
  onClose: () => void;
  onSave: (data: NewManufacturerData) => void;
}> = ({ isAdmin, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewManufacturerData>({
    name: '',
    website: '',
    phone: '',
    email: '',
    categories: [],
    productLines: [],
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter manufacturer name');
      return;
    }
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {isAdmin ? 'Add Global Manufacturer' : 'Add Custom Manufacturer'}
          </h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter manufacturer name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MANUFACTURER_CATEGORIES.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            categories: [...prev.categories, category.id] 
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            categories: prev.categories.filter(c => c !== category.id)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                      {category.icon} {category.name}
                    </span>
                  </label>
                ))}
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
              {isAdmin ? 'Add Global Manufacturer' : 'Add Custom Manufacturer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditManufacturerModal: React.FC<{
  manufacturer: Manufacturer;
  isAdmin: boolean;
  onClose: () => void;
  onSave: (data: Manufacturer) => void;
}> = ({ manufacturer, isAdmin, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewManufacturerData>({
    name: manufacturer.name,
    website: manufacturer.website || '',
    phone: manufacturer.phone || '',
    email: manufacturer.email || '',
    categories: manufacturer.categories,
    productLines: manufacturer.productLines.map(pl => ({
      name: pl.name,
      description: pl.description,
      category: pl.category,
      colors: pl.colors,
      pricePerUnit: pl.pricePerUnit,
      unit: pl.unit,
      hardware: pl.hardware || [],
      isActive: pl.isActive
    })),
    isActive: manufacturer.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter manufacturer name');
      return;
    }
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    const updatedManufacturer: Manufacturer = {
      ...manufacturer,
      name: formData.name,
      website: formData.website,
      phone: formData.phone,
      email: formData.email,
      categories: formData.categories,
      productLines: formData.productLines.map((pl, index) => ({
        ...pl,
        id: manufacturer.productLines[index]?.id || `${Date.now()}-${index}`
      })),
      isActive: formData.isActive,
      updatedDate: new Date()
    };
    
    onSave(updatedManufacturer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Edit Manufacturer
          </h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter manufacturer name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MANUFACTURER_CATEGORIES.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            categories: [...prev.categories, category.id] 
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            categories: prev.categories.filter(c => c !== category.id)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                      {category.icon} {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Product Lines Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Product Lines</label>
                <button
                  type="button"
                  onClick={() => {
                    const newProductLine = {
                      name: '',
                      description: '',
                      category: 'roofing' as ManufacturerCategory,
                      colors: [],
                      pricePerUnit: 0,
                      unit: 'bundle',
                      hardware: [],
                      isActive: true
                    };
                    setFormData(prev => ({ 
                      ...prev, 
                      productLines: [...prev.productLines, newProductLine] 
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  + Add Product Line
                </button>
              </div>
              
              <div className="space-y-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {formData.productLines.map((productLine, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-800">Product Line #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            productLines: prev.productLines.filter((_, i) => i !== index) 
                          }));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={productLine.name}
                          onChange={(e) => {
                            const newProductLines = [...formData.productLines];
                            newProductLines[index] = { ...productLine, name: e.target.value };
                            setFormData(prev => ({ ...prev, productLines: newProductLines }));
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Product name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={productLine.category}
                          onChange={(e) => {
                            const newProductLines = [...formData.productLines];
                            newProductLines[index] = { ...productLine, category: e.target.value as ManufacturerCategory };
                            setFormData(prev => ({ ...prev, productLines: newProductLines }));
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {MANUFACTURER_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={productLine.description}
                          onChange={(e) => {
                            const newProductLines = [...formData.productLines];
                            newProductLines[index] = { ...productLine, description: e.target.value };
                            setFormData(prev => ({ ...prev, productLines: newProductLines }));
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows={2}
                          placeholder="Product description"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price per Unit ($)</label>
                        <input
                          type="number"
                          value={productLine.pricePerUnit}
                          onChange={(e) => {
                            const newProductLines = [...formData.productLines];
                            newProductLines[index] = { ...productLine, pricePerUnit: parseFloat(e.target.value) || 0 };
                            setFormData(prev => ({ ...prev, productLines: newProductLines }));
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                        <select
                          value={productLine.unit}
                          onChange={(e) => {
                            const newProductLines = [...formData.productLines];
                            newProductLines[index] = { ...productLine, unit: e.target.value };
                            setFormData(prev => ({ ...prev, productLines: newProductLines }));
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="bundle">bundle</option>
                          <option value="sq_ft">sq_ft</option>
                          <option value="linear_ft">linear_ft</option>
                          <option value="each">each</option>
                          <option value="box">box</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Colors Section */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-700">Colors ({productLine.colors.length})</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newColor = {
                              id: `color-${Date.now()}`,
                              name: '',
                              hexCode: '#FFFFFF',
                              isPopular: false
                            };
                            const newProductLines = [...formData.productLines];
                            newProductLines[index] = { 
                              ...productLine, 
                              colors: [...productLine.colors, newColor] 
                            };
                            setFormData(prev => ({ ...prev, productLines: newProductLines }));
                          }}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          + Color
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {productLine.colors.map((color, colorIndex) => (
                          <div key={color.id} className="flex items-center space-x-2 bg-white p-2 rounded border">
                            <input
                              type="color"
                              value={color.hexCode}
                              onChange={(e) => {
                                const newProductLines = [...formData.productLines];
                                const newColors = [...productLine.colors];
                                newColors[colorIndex] = { ...color, hexCode: e.target.value };
                                newProductLines[index] = { ...productLine, colors: newColors };
                                setFormData(prev => ({ ...prev, productLines: newProductLines }));
                              }}
                              className="w-8 h-8 rounded border border-gray-300"
                            />
                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) => {
                                const newProductLines = [...formData.productLines];
                                const newColors = [...productLine.colors];
                                newColors[colorIndex] = { ...color, name: e.target.value };
                                newProductLines[index] = { ...productLine, colors: newColors };
                                setFormData(prev => ({ ...prev, productLines: newProductLines }));
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Color name"
                            />
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={color.isPopular}
                                onChange={(e) => {
                                  const newProductLines = [...formData.productLines];
                                  const newColors = [...productLine.colors];
                                  newColors[colorIndex] = { ...color, isPopular: e.target.checked };
                                  newProductLines[index] = { ...productLine, colors: newColors };
                                  setFormData(prev => ({ ...prev, productLines: newProductLines }));
                                }}
                                className="mr-1"
                              />
                              Popular
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newProductLines = [...formData.productLines];
                                const newColors = productLine.colors.filter((_, i) => i !== colorIndex);
                                newProductLines[index] = { ...productLine, colors: newColors };
                                setFormData(prev => ({ ...prev, productLines: newProductLines }));
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {productLine.colors.length === 0 && (
                          <p className="text-xs text-gray-500 italic">No colors added yet</p>
                        )}
                      </div>
                      
                      {/* Hardware & Accessories Section */}
                      <div className="md:col-span-2 mt-4 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-medium text-gray-700">Hardware & Accessories</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newHardware = {
                                id: Date.now().toString(),
                                name: '',
                                description: '',
                                pricePerUnit: 0,
                                unit: 'piece',
                                calculationMethod: 'per_square_foot' as const,
                                calculationValue: 1,
                                isRequired: false,
                                category: 'hardware' as const
                              };
                              const newProductLines = [...formData.productLines];
                              newProductLines[index] = { 
                                ...productLine, 
                                hardware: [...(productLine.hardware || []), newHardware] 
                              };
                              setFormData(prev => ({ ...prev, productLines: newProductLines }));
                            }}
                            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          >
                            + Hardware
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {(productLine.hardware || []).map((hardware, hardwareIndex) => (
                            <div key={hardware.id} className="bg-white p-3 rounded border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                  <input
                                    type="text"
                                    value={hardware.name}
                                    onChange={(e) => {
                                      const newProductLines = [...formData.productLines];
                                      const newHardware = [...(productLine.hardware || [])];
                                      newHardware[hardwareIndex] = { ...hardware, name: e.target.value };
                                      newProductLines[index] = { ...productLine, hardware: newHardware };
                                      setFormData(prev => ({ ...prev, productLines: newProductLines }));
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Hardware name"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                                  <select
                                    value={hardware.category}
                                    onChange={(e) => {
                                      const newProductLines = [...formData.productLines];
                                      const newHardware = [...(productLine.hardware || [])];
                                      newHardware[hardwareIndex] = { ...hardware, category: e.target.value as any };
                                      newProductLines[index] = { ...productLine, hardware: newHardware };
                                      setFormData(prev => ({ ...prev, productLines: newProductLines }));
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="hardware">Hardware</option>
                                    <option value="accessory">Accessory</option>
                                    <option value="fastener">Fastener</option>
                                    <option value="trim">Trim</option>
                                    <option value="underlayment">Underlayment</option>
                                    <option value="flashing">Flashing</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Price per Unit ($)</label>
                                  <input
                                    type="number"
                                    value={hardware.pricePerUnit}
                                    onChange={(e) => {
                                      const newProductLines = [...formData.productLines];
                                      const newHardware = [...(productLine.hardware || [])];
                                      newHardware[hardwareIndex] = { ...hardware, pricePerUnit: parseFloat(e.target.value) || 0 };
                                      newProductLines[index] = { ...productLine, hardware: newHardware };
                                      setFormData(prev => ({ ...prev, productLines: newProductLines }));
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Calculation Method</label>
                                  <select
                                    value={hardware.calculationMethod}
                                    onChange={(e) => {
                                      const newProductLines = [...formData.productLines];
                                      const newHardware = [...(productLine.hardware || [])];
                                      newHardware[hardwareIndex] = { ...hardware, calculationMethod: e.target.value as any };
                                      newProductLines[index] = { ...productLine, hardware: newHardware };
                                      setFormData(prev => ({ ...prev, productLines: newProductLines }));
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="per_square_foot">Per Square Foot</option>
                                    <option value="per_linear_foot">Per Linear Foot</option>
                                    <option value="per_piece">Per Piece</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed_quantity">Fixed Quantity</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    {hardware.calculationMethod === 'per_square_foot' && 'Units per Sq Ft'}
                                    {hardware.calculationMethod === 'per_linear_foot' && 'Units per Lin Ft'}  
                                    {hardware.calculationMethod === 'per_piece' && 'Coverage per Piece'}
                                    {hardware.calculationMethod === 'percentage' && 'Percentage (%)'}
                                    {hardware.calculationMethod === 'fixed_quantity' && 'Fixed Quantity'}
                                  </label>
                                  <input
                                    type="number"
                                    value={hardware.calculationValue}
                                    onChange={(e) => {
                                      const newProductLines = [...formData.productLines];
                                      const newHardware = [...(productLine.hardware || [])];
                                      newHardware[hardwareIndex] = { ...hardware, calculationValue: parseFloat(e.target.value) || 0 };
                                      newProductLines[index] = { ...productLine, hardware: newHardware };
                                      setFormData(prev => ({ ...prev, productLines: newProductLines }));
                                    }}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end mt-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newProductLines = [...formData.productLines];
                                    const newHardware = (productLine.hardware || []).filter((_, i) => i !== hardwareIndex);
                                    newProductLines[index] = { ...productLine, hardware: newHardware };
                                    setFormData(prev => ({ ...prev, productLines: newProductLines }));
                                  }}
                                  className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                >
                                  Remove Hardware
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!productLine.hardware || productLine.hardware.length === 0) && (
                            <p className="text-xs text-gray-500 italic">No hardware added yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.productLines.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    No product lines added yet. Click "Add Product Line" to get started.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Manufacturer
              </label>
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
              Update Manufacturer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RequestManufacturerModal: React.FC<{
  onClose: () => void;
  onSubmit: (request: any) => void;
}> = ({ onClose, onSubmit }) => {
  const [requestData, setRequestData] = useState({
    name: '',
    website: '',
    categories: [] as ManufacturerCategory[],
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestData.name || !requestData.reason) {
      alert('Please fill in manufacturer name and reason');
      return;
    }
    onSubmit(requestData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Request New Manufacturer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Name *</label>
              <input
                type="text"
                value={requestData.name}
                onChange={(e) => setRequestData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter manufacturer name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Request *</label>
              <textarea
                value={requestData.reason}
                onChange={(e) => setRequestData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Explain why this manufacturer should be added..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

