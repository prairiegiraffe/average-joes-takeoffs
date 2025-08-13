// Siding calculation utilities

// Elevation definitions for siding workflow
export const SIDING_ELEVATIONS = [
  { id: 'front', name: 'Front Elevation', icon: '🏠', description: 'Street-facing side' },
  { id: 'back', name: 'Back Elevation', icon: '🏡', description: 'Rear of the house' },
  { id: 'left', name: 'Left Elevation', icon: '🏘️', description: 'Left side view' },
  { id: 'right', name: 'Right Elevation', icon: '🏗️', description: 'Right side view' }
];

// Trim board profile types
export const TRIM_PROFILES = [
  { id: 'flat', name: '1x4 Flat', description: 'Standard flat trim board' },
  { id: 'beveled', name: '1x6 Beveled', description: 'Beveled edge trim' },
  { id: 'decorative', name: 'Decorative Profile', description: 'Architectural trim profile' },
  { id: 'corner', name: 'Corner Board', description: 'Corner trim application' }
];

// Siding manufacturers and products
export const SIDING_MANUFACTURERS = [
  {
    id: 'lp-expertfinish',
    name: 'LP ExpertFinish',
    products: [
      {
        id: 'lp-smartside-lap',
        name: 'LP SmartSide Lap Siding',
        pricePerSF: 2.85,
        colors: [
          { id: 'prime', name: 'Primed', hexCode: '#F5F5F5', isPopular: true },
          { id: 'cedar-tone', name: 'Cedar Tone', hexCode: '#DEB887', isPopular: true },
          { id: 'sierra', name: 'Sierra', hexCode: '#8B4513' },
          { id: 'oyster-white', name: 'Oyster White', hexCode: '#FDF6E3' }
        ]
      }
    ]
  },
  {
    id: 'james-hardie',
    name: 'James Hardie',
    products: [
      {
        id: 'hardieplank',
        name: 'HardiePlank Lap Siding',
        pricePerSF: 3.20,
        colors: [
          { id: 'arctic-white', name: 'Arctic White', hexCode: '#FFFFFF', isPopular: true },
          { id: 'woodland-cream', name: 'Woodland Cream', hexCode: '#F5F5DC', isPopular: true },
          { id: 'iron-gray', name: 'Iron Gray', hexCode: '#708090' },
          { id: 'cobble-stone', name: 'Cobble Stone', hexCode: '#A0A0A0' }
        ]
      }
    ]
  },
  {
    id: 'diamond-kote',
    name: 'Diamond Kote',
    products: [
      {
        id: 'dk-lap-siding',
        name: 'Diamond Kote Lap Siding',
        pricePerSF: 2.95,
        colors: [
          { id: 'sterling', name: 'Sterling', hexCode: '#C0C0C0', isPopular: true },
          { id: 'natural-clay', name: 'Natural Clay', hexCode: '#DEB887' },
          { id: 'deep-ocean', name: 'Deep Ocean', hexCode: '#4682B4' }
        ]
      }
    ]
  },
  {
    id: 'ascend',
    name: 'Ascend Siding',
    products: [
      {
        id: 'ascend-composite',
        name: 'Ascend Composite Siding',
        pricePerSF: 2.65,
        colors: [
          { id: 'classic-white', name: 'Classic White', hexCode: '#FFFFFF', isPopular: true },
          { id: 'driftwood', name: 'Driftwood', hexCode: '#D2B48C' },
          { id: 'storm-cloud', name: 'Storm Cloud', hexCode: '#696969' }
        ]
      }
    ]
  },
  {
    id: 'vinyl',
    name: 'Vinyl Siding',
    products: [
      {
        id: 'premium-vinyl',
        name: 'Premium Vinyl Siding',
        pricePerSF: 1.85,
        colors: [
          { id: 'white', name: 'White', hexCode: '#FFFFFF', isPopular: true },
          { id: 'cream', name: 'Cream', hexCode: '#F5F5DC', isPopular: true },
          { id: 'gray', name: 'Gray', hexCode: '#808080' },
          { id: 'beige', name: 'Beige', hexCode: '#F5F5DC' }
        ]
      }
    ]
  }
];

// Material pricing constants
export const SIDING_MATERIAL_COSTS = {
  outsideCorner: 4.50, // per linear foot
  insideCorner: 4.20,  // per linear foot
  trimboard: 3.80,     // per linear foot (varies by profile)
  houseWrap: 0.45,     // per square foot
  fasteners: 0.15,     // per square foot of siding
  caulk: 8.50,         // per tube (covers ~50 LF)
  starterStrip: 2.25,  // per linear foot
  jChannel: 3.10       // per linear foot
};

// Create empty siding elevation
export const createEmptySidingElevation = () => ({
  // Basic measurements
  length: '',
  height: '',
  
  // Corner measurements
  outsideCorners: [{ height: '', linearFeet: '' }],
  insideCorners: [{ height: '', linearFeet: '' }],
  
  // Trim measurements
  trimboard: [{ linearFeet: '', profile: 'flat' }],
  
  // Window/door deductions
  windowDoorDeductions: '',
  
  // Notes and photo
  notes: '',
  photo: null,
  completed: false
});

// Calculate individual elevation
export const calculateSidingElevation = (elevation) => {
  const length = parseFloat(elevation.length) || 0;
  const height = parseFloat(elevation.height) || 0;
  const deductions = parseFloat(elevation.windowDoorDeductions) || 0;
  
  // Basic siding area
  const grossSF = length * height;
  const netSF = Math.max(0, grossSF - deductions);
  
  // Corner calculations
  let totalOutsideCornerLF = 0;
  elevation.outsideCorners?.forEach(corner => {
    const cornerHeight = parseFloat(corner.height) || 0;
    const cornerLF = parseFloat(corner.linearFeet) || 0;
    totalOutsideCornerLF += cornerHeight > 0 ? cornerHeight : cornerLF;
  });
  
  let totalInsideCornerLF = 0;
  elevation.insideCorners?.forEach(corner => {
    const cornerHeight = parseFloat(corner.height) || 0;
    const cornerLF = parseFloat(corner.linearFeet) || 0;
    totalInsideCornerLF += cornerHeight > 0 ? cornerHeight : cornerLF;
  });
  
  // Trimboard calculations
  let totalTrimboardLF = 0;
  elevation.trimboard?.forEach(trim => {
    totalTrimboardLF += parseFloat(trim.linearFeet) || 0;
  });
  
  return {
    grossSF,
    deductions,
    netSF,
    totalOutsideCornerLF,
    totalInsideCornerLF,
    totalTrimboardLF
  };
};

// Calculate project totals
export const calculateSidingProjectTotals = (elevations) => {
  let totalSidingSF = 0;
  let totalOutsideCornerLF = 0;
  let totalInsideCornerLF = 0;
  let totalTrimboardLF = 0;
  let totalGrossSF = 0;
  let totalDeductions = 0;
  
  elevations.forEach(elevation => {
    const calc = calculateSidingElevation(elevation);
    totalSidingSF += calc.netSF;
    totalOutsideCornerLF += calc.totalOutsideCornerLF;
    totalInsideCornerLF += calc.totalInsideCornerLF;
    totalTrimboardLF += calc.totalTrimboardLF;
    totalGrossSF += calc.grossSF;
    totalDeductions += calc.deductions;
  });
  
  // Calculate additional materials
  const houseWrapSF = totalSidingSF * 1.1; // 10% waste
  const fastenerCost = totalSidingSF * SIDING_MATERIAL_COSTS.fasteners;
  const caulkTubes = Math.ceil(totalTrimboardLF / 50);
  const caulkCost = caulkTubes * SIDING_MATERIAL_COSTS.caulk;
  const starterStripLF = totalSidingSF * 0.1; // Estimate based on perimeter
  const jChannelLF = totalDeductions * 0.3; // Estimate for windows/doors
  
  // Additional material costs
  const houseWrapCost = houseWrapSF * SIDING_MATERIAL_COSTS.houseWrap;
  const starterStripCost = starterStripLF * SIDING_MATERIAL_COSTS.starterStrip;
  const jChannelCost = jChannelLF * SIDING_MATERIAL_COSTS.jChannel;
  
  const additionalMaterialsCost = houseWrapCost + fastenerCost + caulkCost + starterStripCost + jChannelCost;
  
  return {
    totalSidingSF,
    totalOutsideCornerLF,
    totalInsideCornerLF,
    totalTrimboardLF,
    totalGrossSF,
    totalDeductions,
    
    // Additional materials
    houseWrapSF: Math.round(houseWrapSF),
    fastenerCost,
    caulkTubes,
    caulkCost,
    starterStripLF: Math.round(starterStripLF),
    starterStripCost,
    jChannelLF: Math.round(jChannelLF),
    jChannelCost,
    houseWrapCost,
    additionalMaterialsCost,
    
    // Summary
    totalMaterialCost: 0 // Will be calculated with selected products
  };
};

// Get color options for a manufacturer
export const getManufacturerColors = (manufacturerId, productId) => {
  const manufacturer = SIDING_MANUFACTURERS.find(m => m.id === manufacturerId);
  if (!manufacturer) return [];
  
  const product = manufacturer.products.find(p => p.id === productId);
  return product ? product.colors : [];
};

// Calculate material costs with selections
export const calculateMaterialCosts = (totals, selections) => {
  const {
    totalSidingSF,
    totalOutsideCornerLF,
    totalInsideCornerLF,
    totalTrimboardLF,
    additionalMaterialsCost
  } = totals;
  
  // Main siding cost
  const sidingProduct = getSidingProduct(selections.siding?.manufacturerId, selections.siding?.productId);
  const sidingCost = totalSidingSF * (sidingProduct?.pricePerSF || 2.50);
  
  // Corner costs
  const outsideCornerCost = totalOutsideCornerLF * SIDING_MATERIAL_COSTS.outsideCorner;
  const insideCornerCost = totalInsideCornerLF * SIDING_MATERIAL_COSTS.insideCorner;
  const trimboardCost = totalTrimboardLF * SIDING_MATERIAL_COSTS.trimboard;
  
  const totalMaterialCost = sidingCost + outsideCornerCost + insideCornerCost + trimboardCost + additionalMaterialsCost;
  
  return {
    sidingCost,
    outsideCornerCost,
    insideCornerCost,
    trimboardCost,
    additionalMaterialsCost,
    totalMaterialCost
  };
};

// Helper function to get siding product
export const getSidingProduct = (manufacturerId, productId) => {
  const manufacturer = SIDING_MANUFACTURERS.find(m => m.id === manufacturerId);
  if (!manufacturer) return null;
  return manufacturer.products.find(p => p.id === productId) || null;
};