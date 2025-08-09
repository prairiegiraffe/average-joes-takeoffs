// Roofing calculation utilities

// Pitch multipliers for different roof slopes
export const PITCH_MULTIPLIERS = {
  '3/12': 1.03,
  '4/12': 1.06,
  '5/12': 1.08,
  '6/12': 1.12,
  '8/12': 1.20,
  '10/12': 1.31
};

// Pricing constants
export const COST_PER_SQ_FT = 4.50; // $4.50 per square foot
export const BUNDLES_PER_100_SQ_FT = 3; // 3 bundles per 100 sq ft

/**
 * Calculate roofing takeoff details
 * @param {number} length - Length in feet
 * @param {number} width - Width in feet  
 * @param {string} pitch - Pitch ratio (e.g., "6/12")
 * @returns {Object} Calculation results
 */
export const calculateRoofing = (length, width, pitch) => {
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
  const estimatedCost = roofArea * COST_PER_SQ_FT;

  // Additional materials (basic estimates)
  const underlaymentRolls = Math.ceil(roofArea / 400); // 400 sq ft per roll
  const ridgeCapLinearFeet = Math.ceil((length + width) / 2); // Approximate ridge length
  const nailsBoxes = Math.ceil(shinglesNeeded / 10); // 1 box per ~10 bundles

  return {
    // Input values
    length,
    width,
    pitch,
    pitchMultiplier,
    
    // Calculated areas
    baseArea: Math.round(baseArea),
    roofArea: Math.round(roofArea),
    
    // Materials
    shinglesNeeded,
    underlaymentRolls,
    ridgeCapLinearFeet,
    nailsBoxes,
    
    // Costs
    estimatedCost: Math.round(estimatedCost),
    
    // Formatted values for display
    formatted: {
      baseArea: baseArea.toLocaleString(),
      roofArea: roofArea.toLocaleString(),
      estimatedCost: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(estimatedCost),
      costPerSqFt: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(COST_PER_SQ_FT)
    }
  };
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