import type { HardwareAccessory, ManufacturerCategory } from '../types';

/**
 * Generic hardware items available to all contractors for all manufacturers
 * These are common items that might not be manufacturer-specific
 */
export const GENERIC_HARDWARE: HardwareAccessory[] = [
  // Roof Penetrations
  {
    id: 'generic-pipe-boot-1',
    name: 'Pipe Boot (1.25" - 2")',
    description: 'Universal pipe boot for plumbing penetrations',
    sku: 'GPB-125-200',
    pricePerUnit: 12.50,
    unit: 'piece',
    calculationMethod: 'fixed_quantity',
    calculationValue: 1,
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-pipe-boot-2', 
    name: 'Pipe Boot (2.5" - 4")',
    description: 'Universal pipe boot for larger plumbing penetrations',
    sku: 'GPB-250-400',
    pricePerUnit: 18.75,
    unit: 'piece',
    calculationMethod: 'fixed_quantity',
    calculationValue: 1,
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-vent-boot',
    name: 'Vent Boot',
    description: 'Standard roof vent boot',
    sku: 'GVB-STD',
    pricePerUnit: 15.00,
    unit: 'piece',
    calculationMethod: 'fixed_quantity',
    calculationValue: 1,
    isRequired: false,
    category: 'roofing'
  },

  // Flashing
  {
    id: 'generic-step-flashing',
    name: 'Step Flashing',
    description: 'Standard galvanized step flashing',
    sku: 'GSF-GAL',
    pricePerUnit: 2.25,
    unit: 'linear_ft',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.5, // 0.5 lin ft per sq ft around walls
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-drip-edge',
    name: 'Drip Edge',
    description: 'Standard aluminum drip edge',
    pricePerUnit: 1.85,
    unit: 'linear_ft',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.15, // perimeter estimate
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-valley-flashing',
    name: 'Valley Flashing',
    description: 'Pre-formed valley flashing',
    pricePerUnit: 4.50,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'roofing'
  },

  // Fasteners
  {
    id: 'generic-roofing-nails',
    name: 'Roofing Nails (1.25")',
    description: 'Standard galvanized roofing nails',
    sku: 'GRN-125',
    pricePerUnit: 45.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.01, // 1 box per 100 sq ft
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-cap-nails',
    name: 'Cap Nails',
    description: 'Plastic cap nails for underlayment',
    pricePerUnit: 65.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.008, // less needed than regular nails
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-ridge-screws',
    name: 'Ridge Vent Screws',
    description: 'Self-tapping screws for ridge vents',
    pricePerUnit: 25.00,
    unit: 'box',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.01, // 1 box per 100 lin ft
    isRequired: false,
    category: 'roofing'
  },

  // Underlayment
  {
    id: 'generic-felt-15',
    name: '15# Felt Underlayment',
    description: 'Standard 15lb felt underlayment',
    pricePerUnit: 35.00,
    unit: 'roll',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.003, // ~400 sq ft per roll
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-felt-30',
    name: '30# Felt Underlayment', 
    description: 'Heavy duty 30lb felt underlayment',
    pricePerUnit: 55.00,
    unit: 'roll',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.005, // ~200 sq ft per roll
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-ice-shield',
    name: 'Ice & Water Shield',
    description: 'Self-adhering ice and water barrier',
    pricePerUnit: 85.00,
    unit: 'roll',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.015, // 1 roll per ~65 lin ft
    isRequired: false,
    category: 'roofing'
  },

  // Ventilation
  {
    id: 'generic-ridge-vent',
    name: 'Ridge Vent',
    description: 'Generic ridge ventilation',
    pricePerUnit: 3.25,
    unit: 'linear_ft',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.8, // most ridge lines need venting
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-soffit-vent',
    name: 'Soffit Vent',
    description: 'Continuous soffit ventilation',
    pricePerUnit: 2.15,
    unit: 'linear_ft',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.12, // perimeter estimate
    isRequired: false,
    category: 'roofing'
  },

  // Accessories
  {
    id: 'generic-starter-strip',
    name: 'Starter Strip',
    description: 'Generic starter strip shingles',
    pricePerUnit: 1.45,
    unit: 'linear_ft',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.12, // perimeter estimate
    isRequired: false,
    category: 'roofing'
  },
  {
    id: 'generic-hip-ridge',
    name: 'Hip & Ridge Shingles',
    description: 'Generic hip and ridge cap shingles',
    pricePerUnit: 145.00,
    unit: 'bundle',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.03, // ~33 lin ft per bundle
    isRequired: false,
    category: 'roofing'
  },

  // SIDING HARDWARE ITEMS
  // Fasteners & Installation
  {
    id: 'generic-siding-nails',
    name: 'Siding Nails (2.5")',
    description: 'Galvanized siding nails for lap siding',
    sku: 'GSN-250',
    pricePerUnit: 42.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.012, // 1 box per ~85 sq ft
    isRequired: false,
    category: 'siding'
  },
  {
    id: 'generic-siding-screws',
    name: 'Siding Screws (2.5")',
    description: 'Self-drilling siding screws',
    sku: 'GSS-250',
    pricePerUnit: 58.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.012,
    isRequired: false,
    category: 'siding'
  },

  // House Wrap & Weather Barriers
  {
    id: 'generic-house-wrap',
    name: 'House Wrap',
    description: 'Weather-resistant house wrap barrier',
    sku: 'GHW-STD',
    pricePerUnit: 75.00,
    unit: 'roll',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.002, // 1 roll per ~500 sq ft
    isRequired: false,
    category: 'siding'
  },
  {
    id: 'generic-cap-staples',
    name: 'Cap Staples',
    description: 'Plastic cap staples for house wrap',
    sku: 'GCS-STD',
    pricePerUnit: 35.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.008, // 1 box per ~125 sq ft
    isRequired: false,
    category: 'siding'
  },

  // Trim & Accessories
  {
    id: 'generic-outside-corner',
    name: 'Outside Corner Trim',
    description: 'Pre-finished outside corner trim',
    sku: 'GOC-STD',
    pricePerUnit: 6.25,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'siding'
  },
  {
    id: 'generic-inside-corner',
    name: 'Inside Corner Trim',
    description: 'Pre-finished inside corner trim',
    sku: 'GIC-STD',
    pricePerUnit: 5.75,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'siding'
  },
  {
    id: 'generic-j-channel',
    name: 'J-Channel',
    description: 'Universal J-channel for window/door trim',
    sku: 'GJC-STD',
    pricePerUnit: 3.85,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'siding'
  },
  {
    id: 'generic-starter-strip-siding',
    name: 'Starter Strip',
    description: 'Bottom starter strip for first siding course',
    sku: 'GSS-START',
    pricePerUnit: 2.95,
    unit: 'linear_ft',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.1, // perimeter estimate
    isRequired: false,
    category: 'siding'
  },

  // Sealants & Caulk
  {
    id: 'generic-siding-caulk',
    name: 'Exterior Siding Caulk',
    description: 'Paintable acrylic caulk for siding joints',
    sku: 'GSC-ACR',
    pricePerUnit: 8.50,
    unit: 'tube',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.02, // 1 tube per 50 lin ft
    isRequired: false,
    category: 'siding'
  },
  {
    id: 'generic-construction-adhesive',
    name: 'Construction Adhesive',
    description: 'Heavy-duty construction adhesive',
    sku: 'GCA-HD',
    pricePerUnit: 12.75,
    unit: 'tube',
    calculationMethod: 'fixed_quantity',
    calculationValue: 1,
    isRequired: false,
    category: 'siding'
  },

  // Flashing for Siding
  {
    id: 'generic-window-flashing',
    name: 'Window Head Flashing',
    description: 'Self-adhesive window head flashing',
    sku: 'GWF-HEAD',
    pricePerUnit: 4.50,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'siding'
  },
  {
    id: 'generic-door-flashing',
    name: 'Door Threshold Flashing',
    description: 'Waterproof door threshold flashing',
    sku: 'GDF-THRESH',
    pricePerUnit: 18.00,
    unit: 'piece',
    calculationMethod: 'fixed_quantity',
    calculationValue: 1,
    isRequired: false,
    category: 'siding'
  },

  // STONE SIDING HARDWARE ITEMS
  // Stone Installation Hardware
  {
    id: 'generic-stone-screws',
    name: 'Stone Siding Screws (3")',
    description: 'Self-drilling masonry screws for stone siding',
    sku: 'GSS-STONE-300',
    pricePerUnit: 85.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.015, // 1 box per ~65 sq ft
    isRequired: false,
    category: 'stone'
  },
  {
    id: 'generic-stone-clips',
    name: 'Stone Panel Clips',
    description: 'Metal clips for securing stone panels',
    sku: 'GSC-CLIP',
    pricePerUnit: 125.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.02, // 1 box per 50 sq ft
    isRequired: false,
    category: 'stone'
  },
  {
    id: 'generic-stone-anchors',
    name: 'Masonry Anchors',
    description: 'Heavy-duty masonry anchors for stone attachment',
    sku: 'GSA-MASONR',
    pricePerUnit: 95.00,
    unit: 'box',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.01, // 1 box per 100 sq ft
    isRequired: false,
    category: 'stone'
  },

  // Stone Accessories & Trim
  {
    id: 'generic-stone-corner-trim',
    name: 'Stone Corner Trim',
    description: 'Pre-fabricated stone corner trim pieces',
    sku: 'GSCT-CORNER',
    pricePerUnit: 24.50,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'stone'
  },
  {
    id: 'generic-stone-j-channel',
    name: 'Stone J-Channel',
    description: 'Specialty J-channel for stone siding applications',
    sku: 'GSJC-STONE',
    pricePerUnit: 8.75,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'stone'
  },
  {
    id: 'generic-starter-strip-stone',
    name: 'Stone Starter Strip',
    description: 'Bottom starter strip for first stone course',
    sku: 'GSSS-START',
    pricePerUnit: 6.25,
    unit: 'linear_ft',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.08, // perimeter estimate for stone
    isRequired: false,
    category: 'stone'
  },

  // Weather Protection & Sealants
  {
    id: 'generic-stone-barrier',
    name: 'Stone Weather Barrier',
    description: 'Specialized weather barrier for stone installation',
    sku: 'GSWB-STONE',
    pricePerUnit: 95.00,
    unit: 'roll',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.003, // 1 roll per ~350 sq ft
    isRequired: false,
    category: 'stone'
  },
  {
    id: 'generic-stone-sealant',
    name: 'Stone Sealant',
    description: 'High-performance sealant for stone joints',
    sku: 'GSS-SEAL',
    pricePerUnit: 18.50,
    unit: 'tube',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.03, // 1 tube per ~35 lin ft
    isRequired: false,
    category: 'stone'
  },
  {
    id: 'generic-stone-mortar',
    name: 'Stone Mortar Mix',
    description: 'Polymer-modified mortar for stone installation',
    sku: 'GSM-POLY',
    pricePerUnit: 45.00,
    unit: 'bag',
    calculationMethod: 'per_square_foot',
    calculationValue: 0.02, // 1 bag per 50 sq ft
    isRequired: false,
    category: 'stone'
  },

  // Stone Flashing & Waterproofing
  {
    id: 'generic-stone-flashing',
    name: 'Stone Panel Flashing',
    description: 'Self-adhesive flashing for stone panel joints',
    sku: 'GSPF-FLASH',
    pricePerUnit: 12.50,
    unit: 'linear_ft',
    calculationMethod: 'fixed_quantity',
    calculationValue: 0,
    isRequired: false,
    category: 'stone'
  },
  {
    id: 'generic-weep-holes',
    name: 'Weep Hole Vents',
    description: 'Drainage vents for stone cavity walls',
    sku: 'GWHV-VENT',
    pricePerUnit: 2.85,
    unit: 'piece',
    calculationMethod: 'per_linear_foot',
    calculationValue: 0.1, // 1 per 10 lin ft
    isRequired: false,
    category: 'stone'
  }
];

/**
 * Get generic hardware items filtered by category
 */
export function getGenericHardwareByCategory(category: ManufacturerCategory): HardwareAccessory[] {
  // Return category-specific hardware
  if (category === 'roofing') {
    return GENERIC_HARDWARE.filter(item => item.category === 'roofing');
  }
  
  if (category === 'siding') {
    return GENERIC_HARDWARE.filter(item => item.category === 'siding');
  }
  
  if (category === 'stone') {
    return GENERIC_HARDWARE.filter(item => item.category === 'stone');
  }
  
  // For other categories, return a subset that might be relevant
  return GENERIC_HARDWARE.filter(item => 
    item.category === 'fastener' || 
    item.category === 'hardware' ||
    item.category === category
  );
}

/**
 * Get all generic hardware items
 */
export function getAllGenericHardware(): HardwareAccessory[] {
  return GENERIC_HARDWARE;
}

/**
 * Find a specific generic hardware item by ID
 */
export function getGenericHardwareById(id: string): HardwareAccessory | undefined {
  return GENERIC_HARDWARE.find(item => item.id === id);
}