// Stone siding calculation utilities

// Elevation definitions for stone siding workflow
export const STONE_ELEVATIONS = [
  { id: 'front', name: 'Front Elevation', icon: '🏠', description: 'Street-facing side' },
  { id: 'left', name: 'Left Elevation', icon: '⬅️', description: 'Left side view' },
  { id: 'rear', name: 'Rear Elevation', icon: '🏘️', description: 'Rear of the house' },
  { id: 'right', name: 'Right Elevation', icon: '➡️', description: 'Right side view' }
];

// Accessory types for stone siding
export const STONE_ACCESSORIES = [
  { id: 'j-channel', name: 'J-Channel', unit: 'linear_ft' },
  { id: 'starter-strip', name: 'Starter Strip', unit: 'linear_ft' },
  { id: 'wainscot-cap', name: 'Wainscot Cap/Sill', unit: 'linear_ft' },
  { id: 'trim-stone', name: 'Trim Stone', unit: 'linear_ft' },
  { id: 'pier-cap', name: 'Pier Cap', unit: 'linear_ft' }
];

// Electrical box types
export const ELECTRICAL_BOXES = [
  { id: 'light-box', name: 'Light Box', unit: 'piece' },
  { id: 'receptacle-box', name: 'Receptacle Box', unit: 'piece' },
  { id: 'large-light-box', name: 'Large Light Box', unit: 'piece' }
];

// Stone siding manufacturers and products
export const STONE_MANUFACTURERS = [
  {
    id: 'versetta-stone',
    name: 'Versetta Stone',
    products: [
      {
        id: 'versetta-ledgestone',
        name: 'Versetta Stone Ledgestone',
        pricePerSF: 4.50,
        colors: [
          { id: 'canyon', name: 'Canyon', hexCode: '#B8860B', isPopular: true },
          { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F', isPopular: true },
          { id: 'weathered-blend', name: 'Weathered Blend', hexCode: '#8B7355', isPopular: true },
          { id: 'timber', name: 'Timber', hexCode: '#8B4513' }
        ]
      },
      {
        id: 'versetta-tightcut',
        name: 'Versetta Stone Tight Cut',
        pricePerSF: 4.75,
        colors: [
          { id: 'canyon', name: 'Canyon', hexCode: '#B8860B', isPopular: true },
          { id: 'charcoal', name: 'Charcoal', hexCode: '#36454F', isPopular: true },
          { id: 'ivory', name: 'Ivory', hexCode: '#FFFFF0' }
        ]
      }
    ]
  },
  {
    id: 'cultured-stone',
    name: 'Cultured Stone',
    products: [
      {
        id: 'country-ledgestone',
        name: 'Country Ledgestone',
        pricePerSF: 4.25,
        colors: [
          { id: 'bucks-county', name: 'Bucks County', hexCode: '#A0522D', isPopular: true },
          { id: 'nantucket', name: 'Nantucket', hexCode: '#708090', isPopular: true },
          { id: 'echo-ridge', name: 'Echo Ridge', hexCode: '#8FBC8F' }
        ]
      }
    ]
  }
];

// Create empty stone elevation
export const createEmptyStoneElevation = () => ({
  // Basic measurements
  length: '',
  width: '',
  
  // Flat panels
  flatPanelLength: '',
  flatPanelWidth: '',
  
  // Universal corners  
  universalCornerLength: '',
  universalCornerWidth: '',
  
  // Accessories (linear feet)
  accessories: {
    jChannel: '',
    starterStrip: '',
    wainscotCap: '',
    trimStone: '',
    pierCap: ''
  },
  
  // Electrical boxes (quantities)
  electricalBoxes: {
    lightBox: '',
    receptacleBox: '',
    largeLightBox: ''
  },
  
  // Completion status
  completed: false
});

// Calculate individual stone elevation
export const calculateStoneElevation = (elevation) => {
  const length = parseFloat(elevation.length) || 0;
  const width = parseFloat(elevation.width) || 0;
  
  // Flat panel calculations
  const flatPanelLength = parseFloat(elevation.flatPanelLength) || 0;
  const flatPanelWidth = parseFloat(elevation.flatPanelWidth) || 0;
  const flatPanelSF = flatPanelLength * flatPanelWidth;
  
  // Universal corner calculations  
  const universalCornerLength = parseFloat(elevation.universalCornerLength) || 0;
  const universalCornerWidth = parseFloat(elevation.universalCornerWidth) || 0;
  const universalCornerSF = universalCornerLength * universalCornerWidth;
  
  // Total stone square footage
  const totalStoneSF = flatPanelSF + universalCornerSF;
  
  // Accessory calculations (linear feet)
  const accessories = {
    jChannel: parseFloat(elevation.accessories?.jChannel) || 0,
    starterStrip: parseFloat(elevation.accessories?.starterStrip) || 0,
    wainscotCap: parseFloat(elevation.accessories?.wainscotCap) || 0,
    trimStone: parseFloat(elevation.accessories?.trimStone) || 0,
    pierCap: parseFloat(elevation.accessories?.pierCap) || 0
  };
  
  const totalAccessoriesLF = Object.values(accessories).reduce((sum, val) => sum + val, 0);
  
  // Electrical box calculations (quantities)
  const electricalBoxes = {
    lightBox: parseInt(elevation.electricalBoxes?.lightBox) || 0,
    receptacleBox: parseInt(elevation.electricalBoxes?.receptacleBox) || 0,
    largeLightBox: parseInt(elevation.electricalBoxes?.largeLightBox) || 0
  };
  
  const totalElectricalBoxes = Object.values(electricalBoxes).reduce((sum, val) => sum + val, 0);
  
  return {
    // Basic measurements
    totalArea: length * width,
    
    // Stone calculations
    flatPanelSF,
    universalCornerSF,
    totalStoneSF,
    
    // Accessory totals
    accessories,
    totalAccessoriesLF,
    
    // Electrical totals
    electricalBoxes,
    totalElectricalBoxes
  };
};

// Calculate project totals across all elevations
export const calculateStoneProjectTotals = (elevations) => {
  const totals = elevations.reduce((acc, elevation) => {
    const elevationData = calculateStoneElevation(elevation);
    
    return {
      totalArea: acc.totalArea + elevationData.totalArea,
      totalFlatPanelSF: acc.totalFlatPanelSF + elevationData.flatPanelSF,
      totalUniversalCornerSF: acc.totalUniversalCornerSF + elevationData.universalCornerSF,
      totalStoneSF: acc.totalStoneSF + elevationData.totalStoneSF,
      totalAccessoriesLF: acc.totalAccessoriesLF + elevationData.totalAccessoriesLF,
      totalElectricalBoxes: acc.totalElectricalBoxes + elevationData.totalElectricalBoxes,
      accessories: {
        jChannel: acc.accessories.jChannel + elevationData.accessories.jChannel,
        starterStrip: acc.accessories.starterStrip + elevationData.accessories.starterStrip,
        wainscotCap: acc.accessories.wainscotCap + elevationData.accessories.wainscotCap,
        trimStone: acc.accessories.trimStone + elevationData.accessories.trimStone,
        pierCap: acc.accessories.pierCap + elevationData.accessories.pierCap
      },
      electricalBoxes: {
        lightBox: acc.electricalBoxes.lightBox + elevationData.electricalBoxes.lightBox,
        receptacleBox: acc.electricalBoxes.receptacleBox + elevationData.electricalBoxes.receptacleBox,
        largeLightBox: acc.electricalBoxes.largeLightBox + elevationData.electricalBoxes.largeLightBox
      }
    };
  }, {
    totalArea: 0,
    totalFlatPanelSF: 0,
    totalUniversalCornerSF: 0,
    totalStoneSF: 0,
    totalAccessoriesLF: 0,
    totalElectricalBoxes: 0,
    accessories: {
      jChannel: 0,
      starterStrip: 0,
      wainscotCap: 0,
      trimStone: 0,
      pierCap: 0
    },
    electricalBoxes: {
      lightBox: 0,
      receptacleBox: 0,
      largeLightBox: 0
    }
  });
  
  return totals;
};

// Calculate material costs
export const calculateStoneMaterialCosts = (totals, selectedProduct) => {
  if (!selectedProduct || !totals) {
    return { materialCost: 0, laborCost: 0, totalCost: 0 };
  }
  
  // Handle both pricePerSF (static data) and pricePerUnit (dynamic manufacturer data)
  const pricePerSF = selectedProduct.pricePerSF || selectedProduct.pricePerUnit || 0;
  
  const materialCost = totals.totalStoneSF * pricePerSF;
  const laborCost = totals.totalStoneSF * 2.50; // $2.50 per SF for stone installation
  const totalCost = materialCost + laborCost;
  
  return { materialCost, laborCost, totalCost };
};

// Fastener calculations based on stone SF
export const calculateStoneFasteners = (totalStoneSF) => {
  const fastenerBoxes = Math.ceil(totalStoneSF / 100); // 1 box per 100 SF
  const fastenerCost = fastenerBoxes * 25; // $25 per box
  
  return {
    boxes: fastenerBoxes,
    cost: fastenerCost,
    description: `${fastenerBoxes} box${fastenerBoxes > 1 ? 'es' : ''} of stone fasteners`
  };
};