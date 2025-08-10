import React, { useState, useEffect } from 'react';
import { 
  ELEVATIONS, 
  PITCH_MULTIPLIERS, 
  MANUFACTURERS, 
  SHINGLE_COLORS,
  RIDGE_CAP_COST_PER_LF,
  VALLEY_COST_PER_LF,
  PENETRATION_COST,
  calculateElevation,
  calculateProjectTotals,
  createEmptyElevation
} from '../utils/roofing';

const RoofingCalculator = () => {
  // Workflow state
  const [currentElevationIndex, setCurrentElevationIndex] = useState(0);
  const [elevations, setElevations] = useState(() => 
    ELEVATIONS.map(elev => createEmptyElevation(elev.id))
  );
  const [showSummary, setShowSummary] = useState(false);

  const currentElevation = elevations[currentElevationIndex];
  const currentElevationInfo = ELEVATIONS[currentElevationIndex];
  const projectTotals = calculateProjectTotals(elevations);

  // Update elevation data
  const updateCurrentElevation = (field, value) => {
    setElevations(prev => prev.map((elev, index) => 
      index === currentElevationIndex 
        ? { ...elev, [field]: value }
        : elev
    ));
  };

  // Check if current elevation is complete
  const isCurrentElevationComplete = () => {
    const { length, width, pitch, manufacturer, shingleColor } = currentElevation;
    return length && width && pitch && manufacturer && shingleColor &&
           parseFloat(length) > 0 && parseFloat(width) > 0;
  };

  // Get completion status for an elevation
  const getElevationCompletionStatus = (elevation) => {
    const requiredFields = ['length', 'width', 'pitch', 'manufacturer', 'shingleColor'];
    const completedFields = requiredFields.filter(field => {
      const value = elevation[field];
      if (field === 'length' || field === 'width') {
        return value && parseFloat(value) > 0;
      }
      return value;
    });
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  };

  // Mark elevation as complete
  const completeCurrentElevation = () => {
    if (isCurrentElevationComplete()) {
      setElevations(prev => prev.map((elev, index) => 
        index === currentElevationIndex 
          ? { ...elev, completed: true }
          : elev
      ));
    }
  };

  // Navigation functions
  const goToNextElevation = () => {
    completeCurrentElevation();
    if (currentElevationIndex < ELEVATIONS.length - 1) {
      setCurrentElevationIndex(currentElevationIndex + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goToPreviousElevation = () => {
    if (currentElevationIndex > 0) {
      setCurrentElevationIndex(currentElevationIndex - 1);
      setShowSummary(false);
    }
  };

  const goToElevation = (index) => {
    setCurrentElevationIndex(index);
    setShowSummary(false);
  };

  // Get current elevation calculation
  const currentCalc = calculateElevation(currentElevation);

  if (showSummary) {
    return <ProjectSummary elevations={elevations} projectTotals={projectTotals} onBack={goToPreviousElevation} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Professional Roofing Takeoff</h1>
        <p className="text-lg text-gray-600 mb-2">Complete elevation-by-elevation measurement and calculation workflow</p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          🏗️ V1.4 - Customer Management Edition
        </div>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker 
        elevations={elevations}
        currentIndex={currentElevationIndex}
        onElevationClick={goToElevation}
        getCompletionStatus={getElevationCompletionStatus}
      />

      {/* Running Totals Header */}
      <RunningTotals totals={projectTotals} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Input Form */}
        <div className="lg:col-span-2">
          <ElevationForm 
            elevation={currentElevation}
            elevationInfo={currentElevationInfo}
            onUpdate={updateCurrentElevation}
            calculation={currentCalc}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo Section */}
          <PhotoSection 
            elevation={currentElevation}
            elevationInfo={currentElevationInfo}
            onPhotoUpdate={(photo) => updateCurrentElevation('photo', photo)}
          />

          {/* Current Elevation Results */}
          {currentCalc && (
            <ElevationResults calculation={currentCalc} elevationInfo={currentElevationInfo} />
          )}
        </div>
      </div>

      {/* Navigation */}
      <WorkflowNavigation 
        currentIndex={currentElevationIndex}
        totalElevations={ELEVATIONS.length}
        canProceed={isCurrentElevationComplete()}
        onPrevious={goToPreviousElevation}
        onNext={goToNextElevation}
      />
    </div>
  );
};

// Progress Tracker Component
const ProgressTracker = ({ elevations, currentIndex, onElevationClick, getCompletionStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h2>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Completion Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {elevations.filter(e => e.completed).length}/{elevations.length} Elevations
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(elevations.filter(e => e.completed).length / elevations.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Elevation Steps */}
      <div className="grid grid-cols-4 gap-4">
        {ELEVATIONS.map((elev, index) => {
          const elevation = elevations[index];
          const isCurrent = index === currentIndex;
          const isCompleted = elevation.completed;
          const completionStatus = getCompletionStatus(elevation);
          
          return (
            <button
              key={elev.id}
              onClick={() => onElevationClick(index)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrent 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full mr-2 ${
                    isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-400 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="text-xl">
                    {isCompleted ? '✅' : isCurrent ? elev.icon : elev.icon}
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {elev.name}
                </div>
                <div className="text-xs mt-1">
                  {isCompleted ? (
                    <span className="text-green-600 font-medium">Complete</span>
                  ) : (
                    <div>
                      <span className={`${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                        {completionStatus.completed}/{completionStatus.total} fields
                      </span>
                      {isCurrent && completionStatus.percentage > 0 && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full transition-all"
                              style={{ width: `${completionStatus.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Running Totals Component
const RunningTotals = ({ totals }) => {
  if (totals.completedCount === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Totals ({totals.completedCount} Elevations)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totals.formatted.totalRoofArea}</div>
          <div className="text-sm text-gray-600">Total Sq Ft</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totals.totalShingles}</div>
          <div className="text-sm text-gray-600">Shingle Bundles</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{totals.totalUnderlayment}</div>
          <div className="text-sm text-gray-600">Underlayment Rolls</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{totals.formatted.totalCost}</div>
          <div className="text-sm text-gray-600">Total Cost</div>
        </div>
      </div>
    </div>
  );
};

// Elevation Form Component
const ElevationForm = ({ elevation, elevationInfo, onUpdate, calculation }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <div className="text-3xl mr-4">{elevationInfo.icon}</div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{elevationInfo.name} Elevation</h2>
          <p className="text-gray-600">Enter measurements and details for this elevation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Measurements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Length (feet)</label>
          <input
            type="number"
            value={elevation.length}
            onChange={(e) => onUpdate('length', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter length"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Width (feet)</label>
          <input
            type="number"
            value={elevation.width}
            onChange={(e) => onUpdate('width', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter width"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Roof Pitch</label>
          <select
            value={elevation.pitch}
            onChange={(e) => onUpdate('pitch', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(PITCH_MULTIPLIERS).map(pitch => (
              <option key={pitch} value={pitch}>
                {pitch} (×{PITCH_MULTIPLIERS[pitch]})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ridge Length (feet)</label>
          <input
            type="number"
            value={elevation.ridgeLength}
            onChange={(e) => onUpdate('ridgeLength', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valley Length (feet)</label>
          <input
            type="number"
            value={elevation.valleyLength}
            onChange={(e) => onUpdate('valleyLength', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Penetrations</label>
          <input
            type="number"
            value={elevation.penetrations}
            onChange={(e) => onUpdate('penetrations', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Vents, chimneys, skylights, etc.</p>
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
          <select
            value={elevation.manufacturer}
            onChange={(e) => onUpdate('manufacturer', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MANUFACTURERS.map(manufacturer => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name} {manufacturer.popular && '⭐'}
              </option>
            ))}
          </select>
        </div>

        {/* Shingle Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shingle Color</label>
          <select
            value={elevation.shingleColor}
            onChange={(e) => onUpdate('shingleColor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SHINGLE_COLORS.map(color => (
              <option key={color.id} value={color.id}>
                {color.name} {color.popular && '⭐'}
              </option>
            ))}
          </select>
          {elevation.shingleColor && (
            <div className="flex items-center mt-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                style={{ backgroundColor: SHINGLE_COLORS.find(c => c.id === elevation.shingleColor)?.hex }}
              />
              <span className="text-sm text-gray-600">Color preview</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={elevation.notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Any additional notes for this elevation..."
        />
      </div>
    </div>
  );
};

// Photo Section Component
const PhotoSection = ({ elevation, elevationInfo, onPhotoUpdate }) => {
  const handleFileCapture = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment'; // Use rear camera on mobile devices
    
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Create object URL for preview
        const photoUrl = URL.createObjectURL(file);
        onPhotoUpdate(photoUrl);
      }
    };
    
    fileInput.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {elevationInfo.name} Photo
      </h3>
      
      <div className="text-center">
        {elevation.photo ? (
          <div className="relative">
            <img 
              src={elevation.photo} 
              alt={`${elevationInfo.name} elevation`}
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => onPhotoUpdate(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
              title="Remove photo"
            >
              ✕
            </button>
            <button
              onClick={handleFileCapture}
              className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-md px-2 py-1 text-xs hover:bg-blue-600 shadow-md"
              title="Replace photo"
            >
              📷 Replace
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer" onClick={handleFileCapture}>
            <div className="text-4xl text-gray-400 mb-2">📷</div>
            <div className="text-gray-600 mb-3 font-medium">Add elevation photo</div>
            <div className="text-xs text-gray-500 mb-4">
              Tap to capture or select from gallery
            </div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              📷 Take Photo
            </button>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-3">
        Photos help document roof conditions and support estimates
      </p>
    </div>
  );
};

// Elevation Results Component  
const ElevationResults = ({ calculation, elevationInfo }) => {
  if (!calculation) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {elevationInfo.name} Results
      </h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Roof Area</div>
          <div className="text-2xl font-bold text-blue-700">
            {calculation.formatted.roofArea} sq ft
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Shingles:</span>
            <span className="font-medium">{calculation.shinglesNeeded} bundles</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Underlayment:</span>
            <span className="font-medium">{calculation.underlaymentRolls} rolls</span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-medium">Elevation Total:</span>
            <span className="font-bold text-green-600">{calculation.formatted.totalCost}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Workflow Navigation Component
const WorkflowNavigation = ({ currentIndex, totalElevations, canProceed, onPrevious, onNext }) => {
  const isLastElevation = currentIndex === totalElevations - 1;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous Elevation
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Step {currentIndex + 1} of {totalElevations}</div>
          {!canProceed && (
            <div className="text-xs text-red-600 mt-1">
              Complete required fields to continue
            </div>
          )}
        </div>
        
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLastElevation ? 'Generate Report →' : 'Next Elevation →'}
        </button>
      </div>
    </div>
  );
};

// Project Summary Component
const ProjectSummary = ({ elevations, projectTotals, onBack }) => {
  const completedElevations = elevations.filter(e => e.completed);
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Takeoff Summary</h1>
        <p className="text-gray-600">Professional roofing estimate and materials breakdown</p>
      </div>

      {/* Project Totals */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Project Totals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{projectTotals.formatted.totalRoofArea}</div>
            <div className="opacity-90">Total Square Feet</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{projectTotals.totalShingles}</div>
            <div className="opacity-90">Shingle Bundles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{projectTotals.totalUnderlayment}</div>
            <div className="opacity-90">Underlayment Rolls</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{projectTotals.formatted.totalCost}</div>
            <div className="opacity-90">Total Estimate</div>
          </div>
        </div>
      </div>

      {/* Elevation Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Elevation Breakdown</h3>
        <div className="space-y-4">
          {completedElevations.map((elevation, index) => {
            const elevInfo = ELEVATIONS.find(e => e.id === elevation.id);
            const calc = calculateElevation(elevation);
            if (!calc) return null;

            return (
              <div key={elevation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{elevInfo.icon}</span>
                    <h4 className="text-lg font-medium text-gray-900">{elevInfo.name} Elevation</h4>
                  </div>
                  <div className="text-xl font-bold text-green-600">{calc.formatted.totalCost}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>Area: {calc.formatted.roofArea} sq ft</div>
                  <div>Shingles: {calc.shinglesNeeded} bundles</div>
                  <div>Pitch: {elevation.pitch}</div>
                  <div>Penetrations: {calc.penetrations}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
        >
          ← Back to Elevations
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={() => {
              // Create a detailed text report
              const reportDate = new Date().toLocaleDateString();
              const completedElevations = elevations.filter(e => e.completed);
              
              let report = `PROFESSIONAL ROOFING TAKEOFF REPORT\n`;
              report += `========================================\n`;
              report += `Date: ${reportDate}\n`;
              report += `Total Elevations: ${completedElevations.length}\n\n`;
              
              report += `PROJECT SUMMARY\n`;
              report += `---------------\n`;
              report += `Total Roof Area: ${projectTotals.formatted.totalRoofArea} sq ft\n`;
              report += `Total Shingle Bundles: ${projectTotals.totalShingles}\n`;
              report += `Total Underlayment Rolls: ${projectTotals.totalUnderlayment}\n`;
              report += `Total Project Cost: ${projectTotals.formatted.totalCost}\n\n`;
              
              report += `ELEVATION BREAKDOWN\n`;
              report += `-------------------\n`;
              completedElevations.forEach((elevation, index) => {
                const elevInfo = ELEVATIONS.find(e => e.id === elevation.id);
                const calc = calculateElevation(elevation);
                if (calc) {
                  report += `${index + 1}. ${elevInfo.name} Elevation\n`;
                  report += `   Dimensions: ${calc.length}' × ${calc.width}'\n`;
                  report += `   Pitch: ${calc.pitch} (×${calc.pitchMultiplier})\n`;
                  report += `   Roof Area: ${calc.formatted.roofArea} sq ft\n`;
                  report += `   Shingles: ${calc.shinglesNeeded} bundles\n`;
                  report += `   Ridge: ${calc.ridgeLength || 0}' @ $${RIDGE_CAP_COST_PER_LF}/ft\n`;
                  report += `   Valley: ${calc.valleyLength || 0}' @ $${VALLEY_COST_PER_LF}/ft\n`;
                  report += `   Penetrations: ${calc.penetrations} @ $${PENETRATION_COST} each\n`;
                  report += `   Elevation Cost: ${calc.formatted.totalCost}\n\n`;
                }
              });
              
              // Download as text file
              const blob = new Blob([report], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `roofing-takeoff-${reportDate.replace(/\//g, '-')}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors inline-flex items-center gap-2"
          >
            📄 Download Report
          </button>
          
          <button
            onClick={() => {
              // Print-friendly summary
              window.print();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors inline-flex items-center gap-2"
          >
            🖨️ Print Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoofingCalculator;