import type { HardwareAccessory, HardwareCalculation, CalculationMethod } from '../types';

interface TakeoffMeasurements {
  totalSquareFeet: number;
  totalLinearFeet?: number;
  perimeterFeet?: number;
  ridgeFeet?: number;
  valleyFeet?: number;
  hipFeet?: number;
  rakeFeet?: number;
  gutterFeet?: number;
}

/**
 * Calculate required hardware quantities based on takeoff measurements
 */
export function calculateHardwareQuantities(
  hardware: HardwareAccessory[],
  measurements: TakeoffMeasurements,
  existingCalculations?: HardwareCalculation[]
): HardwareCalculation[] {
  return hardware.map(item => {
    const existingCalc = existingCalculations?.find(calc => calc.hardwareId === item.id);
    
    let calculatedQuantity = 0;
    
    switch (item.calculationMethod) {
      case 'per_square_foot':
        calculatedQuantity = measurements.totalSquareFeet * item.calculationValue;
        break;
      
      case 'per_linear_foot':
        // Use appropriate linear measurement based on item category
        let linearFeet = measurements.totalLinearFeet || 0;
        if (item.category === 'trim' && measurements.perimeterFeet) {
          linearFeet = measurements.perimeterFeet;
        } else if (item.category === 'flashing') {
          linearFeet = (measurements.ridgeFeet || 0) + (measurements.valleyFeet || 0);
        }
        calculatedQuantity = linearFeet * item.calculationValue;
        break;
      
      case 'per_piece':
        // Calculate pieces needed based on coverage area
        const piecesNeeded = Math.ceil(measurements.totalSquareFeet / item.calculationValue);
        calculatedQuantity = piecesNeeded;
        break;
      
      case 'percentage':
        // Calculate as percentage of main material
        calculatedQuantity = measurements.totalSquareFeet * (item.calculationValue / 100);
        break;
      
      case 'fixed_quantity':
        calculatedQuantity = item.calculationValue;
        break;
      
      default:
        calculatedQuantity = 0;
    }
    
    // Round up to reasonable precision
    calculatedQuantity = Math.ceil(calculatedQuantity * 100) / 100;
    
    const finalQuantity = existingCalc?.overrideQuantity ?? calculatedQuantity;
    const finalPricePerUnit = existingCalc?.overridePrice ?? item.pricePerUnit;
    const totalCost = finalQuantity * finalPricePerUnit;
    
    return {
      hardwareId: item.id,
      name: item.name,
      calculatedQuantity,
      overrideQuantity: existingCalc?.overrideQuantity,
      overridePrice: existingCalc?.overridePrice,
      finalQuantity,
      pricePerUnit: item.pricePerUnit,
      finalPricePerUnit,
      unit: item.unit,
      totalCost,
      category: item.category
    };
  });
}

/**
 * Update hardware calculation with contractor override
 */
export function updateHardwareOverride(
  calculations: HardwareCalculation[],
  hardwareId: string,
  overrideQuantity?: number | undefined,
  overridePrice?: number | undefined
): HardwareCalculation[] {
  return calculations.map(calc => {
    if (calc.hardwareId === hardwareId) {
      const finalQuantity = overrideQuantity ?? calc.calculatedQuantity;
      const finalPricePerUnit = overridePrice ?? calc.pricePerUnit;
      return {
        ...calc,
        overrideQuantity,
        overridePrice,
        finalQuantity,
        finalPricePerUnit,
        totalCost: finalQuantity * finalPricePerUnit
      };
    }
    return calc;
  });
}

/**
 * Get total cost for all hardware calculations
 */
export function getTotalHardwareCost(calculations: HardwareCalculation[]): number {
  return calculations.reduce((total, calc) => total + calc.totalCost, 0);
}

/**
 * Format calculation method for display
 */
export function formatCalculationMethod(method: CalculationMethod): string {
  const methods = {
    'per_square_foot': 'Per Sq Ft',
    'per_linear_foot': 'Per Lin Ft', 
    'per_piece': 'Per Piece',
    'percentage': 'Percentage',
    'fixed_quantity': 'Fixed Qty'
  };
  return methods[method] || method;
}

/**
 * Get calculation explanation for display
 */
export function getCalculationExplanation(
  hardware: HardwareAccessory,
  measurements: TakeoffMeasurements
): string {
  const { calculationMethod, calculationValue } = hardware;
  
  switch (calculationMethod) {
    case 'per_square_foot':
      return `${measurements.totalSquareFeet} sq ft × ${calculationValue} = ${measurements.totalSquareFeet * calculationValue}`;
    
    case 'per_linear_foot':
      const linearFeet = measurements.totalLinearFeet || measurements.perimeterFeet || 0;
      return `${linearFeet} lin ft × ${calculationValue} = ${linearFeet * calculationValue}`;
    
    case 'per_piece':
      const pieces = Math.ceil(measurements.totalSquareFeet / calculationValue);
      return `${measurements.totalSquareFeet} sq ft ÷ ${calculationValue} = ${pieces} pieces`;
    
    case 'percentage':
      return `${measurements.totalSquareFeet} sq ft × ${calculationValue}% = ${measurements.totalSquareFeet * (calculationValue / 100)}`;
    
    case 'fixed_quantity':
      return `Fixed quantity: ${calculationValue}`;
    
    default:
      return 'Unknown calculation';
  }
}