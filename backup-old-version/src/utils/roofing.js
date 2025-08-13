// Enhanced roofing calculation utilities with elevation workflow

// Elevation workflow constants
export const ELEVATIONS = [
  { id: 'front', name: 'Front', icon: '🏠' },
  { id: 'left', name: 'Left', icon: '⬅️' },
  { id: 'rear', name: 'Rear', icon: '🏘️' },
  { id: 'right', name: 'Right', icon: '➡️' }
];

// Pitch multipliers for different roof slopes
export const PITCH_MULTIPLIERS = {
  '3/12': 1.03,
  '4/12': 1.06,
  '5/12': 1.08,
  '6/12': 1.12,
  '8/12': 1.20,
  '10/12': 1.31
};

// Manufacturer options
export const MANUFACTURERS = [
  { id: 'gaf', name: 'GAF', popular: true },
  { id: 'owens-corning', name: 'Owens Corning', popular: true },
  { id: 'malarkey', name: 'Malarkey', popular: true },
  { id: 'certainteed', name: 'CertainTeed', popular: false },
  { id: 'iko', name: 'IKO', popular: false },
  { id: 'tamko', name: 'TAMKO', popular: false }
];

// Shingle color options
export const SHINGLE_COLORS = [
  { id: 'charcoal-black', name: 'Charcoal Black', hex: '#36454F', popular: true },
  { id: 'slate-gray', name: 'Slate Gray', hex: '#708090', popular: true },
  { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', popular: true },
  { id: 'aged-bronze', name: 'Aged Bronze', hex: '#804A00', popular: true },
  { id: 'mission-brown', name: 'Mission Brown', hex: '#654321', popular: false },
  { id: 'forest-green', name: 'Forest Green', hex: '#355E3B', popular: false },
  { id: 'colonial-slate', name: 'Colonial Slate', hex: '#4F666A', popular: false },
  { id: 'autumn-harvest', name: 'Autumn Harvest', hex: '#B8860B', popular: false }
];

// Pricing constants
export const COST_PER_SQ_FT = 4.50; // $4.50 per square foot
export const BUNDLES_PER_100_SQ_FT = 3; // 3 bundles per 100 sq ft
export const RIDGE_CAP_COST_PER_LF = 3.50; // $3.50 per linear foot
export const VALLEY_COST_PER_LF = 4.25; // $4.25 per linear foot
export const PENETRATION_COST = 45.00; // $45 per penetration

/**
 * Calculate roofing takeoff for a single elevation
 * @param {Object} elevation - Elevation data
 * @returns {Object} Calculation results
 */
export const calculateElevation = (elevation) => {
  const { length, width, pitch, ridgeLength, valleyLength, penetrations } = elevation;
  
  // Input validation
  if (!length || !width || !pitch || length <= 0 || width <= 0) {
    return null;
  }

  const pitchMultiplier = PITCH_MULTIPLIERS[pitch];
  if (!pitchMultiplier) {
    return null;
  }

  // Basic calculations
  const baseArea = length * width;
  const roofArea = baseArea * pitchMultiplier;
  const shinglesNeeded = Math.ceil((roofArea / 100) * BUNDLES_PER_100_SQ_FT);
  
  // Enhanced calculations
  const ridgeLen = ridgeLength || 0;
  const valleyLen = valleyLength || 0;
  const numPenetrations = penetrations || 0;
  
  // Material calculations
  const underlaymentRolls = Math.ceil(roofArea / 400); // 400 sq ft per roll
  const nailsBoxes = Math.ceil(shinglesNeeded / 10); // 1 box per ~10 bundles
  
  // Cost calculations
  const roofingCost = roofArea * COST_PER_SQ_FT;
  const ridgeCost = ridgeLen * RIDGE_CAP_COST_PER_LF;
  const valleyCost = valleyLen * VALLEY_COST_PER_LF;
  const penetrationCost = numPenetrations * PENETRATION_COST;
  const totalCost = roofingCost + ridgeCost + valleyCost + penetrationCost;

  return {
    // Input values
    length,
    width,
    pitch,
    pitchMultiplier,
    ridgeLength: ridgeLen,
    valleyLength: valleyLen,
    penetrations: numPenetrations,
    
    // Calculated areas
    baseArea: Math.round(baseArea),
    roofArea: Math.round(roofArea),
    
    // Materials
    shinglesNeeded,
    underlaymentRolls,
    nailsBoxes,
    
    // Costs breakdown
    roofingCost: Math.round(roofingCost),
    ridgeCost: Math.round(ridgeCost),
    valleyCost: Math.round(valleyCost),
    penetrationCost: Math.round(penetrationCost),
    totalCost: Math.round(totalCost),
    
    // Formatted values for display
    formatted: {
      baseArea: baseArea.toLocaleString(),
      roofArea: roofArea.toLocaleString(),
      roofingCost: formatCurrency(roofingCost),
      ridgeCost: formatCurrency(ridgeCost),
      valleyCost: formatCurrency(valleyCost),
      penetrationCost: formatCurrency(penetrationCost),
      totalCost: formatCurrency(totalCost)
    }
  };
};

/**
 * Calculate totals across all elevations
 * @param {Array} elevations - Array of elevation data
 * @returns {Object} Project totals
 */
export const calculateProjectTotals = (elevations) => {
  const completedElevations = elevations.filter(elev => elev.completed);
  
  if (completedElevations.length === 0) {
    return {
      totalRoofArea: 0,
      totalShingles: 0,
      totalUnderlayment: 0,
      totalNails: 0,
      totalCost: 0,
      completedCount: 0,
      formatted: {
        totalRoofArea: '0',
        totalCost: '$0'
      }
    };
  }
  
  const totals = completedElevations.reduce((acc, elevation) => {
    const calc = calculateElevation(elevation);
    if (!calc) return acc;
    
    return {
      totalRoofArea: acc.totalRoofArea + calc.roofArea,
      totalShingles: acc.totalShingles + calc.shinglesNeeded,
      totalUnderlayment: acc.totalUnderlayment + calc.underlaymentRolls,
      totalNails: acc.totalNails + calc.nailsBoxes,
      totalCost: acc.totalCost + calc.totalCost
    };
  }, {
    totalRoofArea: 0,
    totalShingles: 0,
    totalUnderlayment: 0,
    totalNails: 0,
    totalCost: 0
  });
  
  return {
    ...totals,
    completedCount: completedElevations.length,
    formatted: {
      totalRoofArea: totals.totalRoofArea.toLocaleString(),
      totalCost: formatCurrency(totals.totalCost)
    }
  };
};

/**
 * Create empty elevation data structure
 * @param {string} elevationId - The elevation identifier
 * @returns {Object} Empty elevation data
 */
export const createEmptyElevation = (elevationId) => ({
  id: elevationId,
  length: '',
  width: '',
  pitch: '6/12',
  ridgeLength: '',
  valleyLength: '',
  penetrations: 0,
  photo: null,
  completed: false,
  notes: ''
});

/**
 * Format currency helper
 * @param {number} amount 
 * @returns {string} Formatted currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Validate input values
 * @param {number} length 
 * @param {number} width 
 * @param {string} pitch 
 * @returns {Object} Validation result with errors
 */
export const validateInputs = (length, width, pitch) => {
  const errors = {};
  
  if (!length || length <= 0) {
    errors.length = 'Length must be greater than 0';
  }
  
  if (!width || width <= 0) {
    errors.width = 'Width must be greater than 0';
  }
  
  if (!pitch || !PITCH_MULTIPLIERS[pitch]) {
    errors.pitch = 'Please select a valid roof pitch';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};