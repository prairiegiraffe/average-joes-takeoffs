import React, { useState, useEffect } from 'react';
import { calculateRoofing, validateInputs, PITCH_MULTIPLIERS } from '../utils/roofing';

const RoofingCalculator = () => {
  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    pitch: '6/12' // Default to common 6/12 pitch
  });
  
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCalculated, setIsCalculated] = useState(false);

  // Real-time calculation when inputs change
  useEffect(() => {
    if (inputs.length && inputs.width && inputs.pitch) {
      const length = parseFloat(inputs.length);
      const width = parseFloat(inputs.width);
      
      const validation = validateInputs(length, width, inputs.pitch);
      setErrors(validation.errors);
      
      if (validation.isValid) {
        const calculationResults = calculateRoofing(length, width, inputs.pitch);
        setResults(calculationResults);
        setIsCalculated(true);
      } else {
        setResults(null);
        setIsCalculated(false);
      }
    } else {
      setResults(null);
      setIsCalculated(false);
      setErrors({});
    }
  }, [inputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculate = () => {
    const length = parseFloat(inputs.length);
    const width = parseFloat(inputs.width);
    
    const validation = validateInputs(length, width, inputs.pitch);
    setErrors(validation.errors);
    
    if (validation.isValid) {
      const calculationResults = calculateRoofing(length, width, inputs.pitch);
      setResults(calculationResults);
      setIsCalculated(true);
    }
  };

  const handleClear = () => {
    setInputs({
      length: '',
      width: '',
      pitch: '6/12'
    });
    setResults(null);
    setErrors({});
    setIsCalculated(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Roofing Calculator</h1>
        <p className="text-gray-600">Calculate roof area, materials, and estimated costs for your roofing projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Details</h2>
          
          <div className="space-y-6">
            {/* Length Input */}
            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
                Roof Length (feet)
              </label>
              <input
                type="number"
                id="length"
                value={inputs.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.length ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter length in feet"
                min="0"
                step="0.1"
              />
              {errors.length && (
                <p className="mt-1 text-sm text-red-600">{errors.length}</p>
              )}
            </div>

            {/* Width Input */}
            <div>
              <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">
                Roof Width (feet)
              </label>
              <input
                type="number"
                id="width"
                value={inputs.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.width ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter width in feet"
                min="0"
                step="0.1"
              />
              {errors.width && (
                <p className="mt-1 text-sm text-red-600">{errors.width}</p>
              )}
            </div>

            {/* Pitch Dropdown */}
            <div>
              <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 mb-2">
                Roof Pitch
              </label>
              <select
                id="pitch"
                value={inputs.pitch}
                onChange={(e) => handleInputChange('pitch', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pitch ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {Object.keys(PITCH_MULTIPLIERS).map(pitch => (
                  <option key={pitch} value={pitch}>
                    {pitch} (×{PITCH_MULTIPLIERS[pitch]})
                  </option>
                ))}
              </select>
              {errors.pitch && (
                <p className="mt-1 text-sm text-red-600">{errors.pitch}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Higher pitch = steeper roof = more materials needed
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCalculate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculation Results</h2>
          
          {!isCalculated ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">📐</div>
                <p>Enter roof dimensions to see calculations</p>
              </div>
            </div>
          ) : results ? (
            <div className="space-y-6">
              {/* Area Calculations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Roof Area</h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Area:</span>
                    <span className="font-medium">{results.formatted.baseArea} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pitch Multiplier:</span>
                    <span className="font-medium">×{results.pitchMultiplier}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-blue-700 border-t border-blue-200 pt-2">
                    <span>Total Roof Area:</span>
                    <span>{results.formatted.roofArea} sq ft</span>
                  </div>
                </div>
              </div>

              {/* Materials Needed */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Materials Needed</h3>
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shingle Bundles:</span>
                    <span className="font-medium">{results.shinglesNeeded} bundles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Underlayment Rolls:</span>
                    <span className="font-medium">{results.underlaymentRolls} rolls</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ridge Cap:</span>
                    <span className="font-medium">{results.ridgeCapLinearFeet} linear ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nail Boxes:</span>
                    <span className="font-medium">{results.nailsBoxes} boxes</span>
                  </div>
                </div>
              </div>

              {/* Cost Estimate */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Cost Estimate</h3>
                <div className="bg-yellow-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate per sq ft:</span>
                    <span className="font-medium">{results.formatted.costPerSqFt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Area:</span>
                    <span className="font-medium">{results.formatted.roofArea} sq ft</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-yellow-700 border-t border-yellow-200 pt-2">
                    <span>Estimated Total:</span>
                    <span>{results.formatted.estimatedCost}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  * Estimate includes materials and labor. Final costs may vary based on local rates and project complexity.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-red-500">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <p>Please check your inputs and try again</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoofingCalculator;