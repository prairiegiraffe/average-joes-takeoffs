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
import {
  calculateHardwareQuantities,
  updateHardwareOverride,
  getTotalHardwareCost,
  formatCalculationMethod,
  getCalculationExplanation
} from '../utils/hardwareCalculations';

// Import manufacturer data from the manufacturers system
// Mock customers data for fallback
const MOCK_CUSTOMERS = [
  {
    id: '1',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    projectAddress: '123 Oak Street, Springfield',
    projectType: 'roofing',
    estimatedValue: 15000,
    status: 'active_project',
    lastContact: new Date('2025-08-08'),
    projects: [],
    notes: 'Needs new shingles after hail damage',
    createdDate: new Date('2025-07-15'),
    updatedDate: new Date('2025-08-08')
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'sarah.johnson@email.com',
    projectAddress: '456 Maple Ave, Springfield',
    projectType: 'siding',
    estimatedValue: 22000,
    status: 'active_lead',
    lastContact: new Date('2025-08-05'),
    projects: [],
    notes: 'Interested in vinyl siding replacement',
    createdDate: new Date('2025-07-20'),
    updatedDate: new Date('2025-08-05')
  }
];


const RoofingCalculator = () => {
  // Check for editing takeoff data on component mount
  const [editingTakeoffData] = useState(() => {
    try {
      const savedTakeoff = localStorage.getItem('editingTakeoff');
      if (savedTakeoff) {
        const takeoff = JSON.parse(savedTakeoff);
        console.log('Loading editing takeoff data:', takeoff);
        // Clear the editing data after loading
        localStorage.removeItem('editingTakeoff');
        return takeoff;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Workflow state
  const [currentElevationIndex, setCurrentElevationIndex] = useState(0);
  const [elevations, setElevations] = useState(() => {
    // If editing a takeoff, load its elevation data
    if (editingTakeoffData?.elevationData) {
      console.log('Loading elevation data:', editingTakeoffData.elevationData);
      return editingTakeoffData.elevationData;
    }
    return ELEVATIONS.map(elev => createEmptyElevation(elev.id));
  });
  const [showSummary, setShowSummary] = useState(() => {
    // If editing a takeoff, go directly to summary
    return editingTakeoffData ? true : false;
  });

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
    const { length, width, pitch } = currentElevation;
    return length && width && pitch &&
           parseFloat(length) > 0 && parseFloat(width) > 0;
  };

  // Get completion status for an elevation
  const getElevationCompletionStatus = (elevation) => {
    const requiredFields = ['length', 'width', 'pitch'];
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
      // On final elevation, go to summary after completing
      setTimeout(() => setShowSummary(true), 100);
    }
  };

  // Check if all elevations are completed
  const areAllElevationsComplete = () => {
    return elevations.every(elevation => elevation.completed);
  };

  // Go to summary page
  const goToSummary = () => {
    setShowSummary(true);
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

  // Enhanced back function to support going to specific elevation
  const goBackToElevations = (elevationIndex = null) => {
    if (elevationIndex !== null) {
      setCurrentElevationIndex(elevationIndex);
    }
    setShowSummary(false);
  };

  // Get current elevation calculation
  const currentCalc = calculateElevation(currentElevation);

  if (showSummary) {
    return <ProjectSummary elevations={elevations} projectTotals={projectTotals} onBack={goBackToElevations} editingTakeoffData={editingTakeoffData} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Professional Roofing Takeoff</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Complete elevation-by-elevation measurement and calculation workflow</p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          🏗️ V2.1 - Field Workflow & Material Selection Edition
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
        allElevationsComplete={areAllElevationsComplete()}
        onPrevious={goToPreviousElevation}
        onNext={goToNextElevation}
        onGoToSummary={goToSummary}
      />
    </div>
  );
};

// Progress Tracker Component
const ProgressTracker = ({ elevations, currentIndex, onElevationClick, getCompletionStatus }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Project Progress</h2>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Completion Progress</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {elevations.filter(e => e.completed).length}/{elevations.length} Elevations
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <div className="text-3xl mr-4">{elevationInfo.icon}</div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{elevationInfo.name} Elevation</h2>
          <p className="text-gray-600 dark:text-gray-400">Enter measurements and details for this elevation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Measurements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Length (feet)</label>
          <input
            type="number"
            value={elevation.length}
            onChange={(e) => onUpdate('length', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter length"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width (feet)</label>
          <input
            type="number"
            value={elevation.width}
            onChange={(e) => onUpdate('width', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter width"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roof Pitch</label>
          <select
            value={elevation.pitch}
            onChange={(e) => onUpdate('pitch', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(PITCH_MULTIPLIERS).map(pitch => (
              <option key={pitch} value={pitch}>
                {pitch} (×{PITCH_MULTIPLIERS[pitch]})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ridge Length (feet)</label>
          <input
            type="number"
            value={elevation.ridgeLength}
            onChange={(e) => onUpdate('ridgeLength', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valley Length (feet)</label>
          <input
            type="number"
            value={elevation.valleyLength}
            onChange={(e) => onUpdate('valleyLength', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Penetrations</label>
          <input
            type="number"
            value={elevation.penetrations}
            onChange={(e) => onUpdate('penetrations', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Vents, chimneys, skylights, etc.</p>
        </div>

      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
        <textarea
          value={elevation.notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
const WorkflowNavigation = ({ currentIndex, totalElevations, canProceed, allElevationsComplete, onPrevious, onNext, onGoToSummary }) => {
  const isLastElevation = currentIndex === totalElevations - 1;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous Elevation
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Step {currentIndex + 1} of {totalElevations}</div>
          {!canProceed && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              Complete required fields to continue
            </div>
          )}
          {allElevationsComplete && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              All measurements complete! Ready to select materials.
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          {isLastElevation ? (
            <button
              onClick={onNext}
              disabled={!canProceed}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              📋 Complete Measurements & Select Materials
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canProceed}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Elevation →
            </button>
          )}
          
          {allElevationsComplete && (
            <button
              onClick={onGoToSummary}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors flex items-center gap-2"
            >
              📋 Go to Material Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Project Summary & Material Selection Component
const ProjectSummary = ({ elevations, projectTotals, onBack, editingTakeoffData }) => {
  const completedElevations = elevations.filter(e => e.completed);
  
  // Material selection state (pre-populate if editing)
  const [selectedManufacturer, setSelectedManufacturer] = useState(() => {
    if (editingTakeoffData?.manufacturerSelections?.[0]) {
      return editingTakeoffData.manufacturerSelections[0].manufacturerId;
    }
    return '';
  });
  const [selectedProductLine, setSelectedProductLine] = useState(() => {
    if (editingTakeoffData?.manufacturerSelections?.[0]) {
      return editingTakeoffData.manufacturerSelections[0].productLineId;
    }
    return '';
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    if (editingTakeoffData?.manufacturerSelections?.[0]) {
      return editingTakeoffData.manufacturerSelections[0].colorId;
    }
    return '';
  });
  const [materialTier, setMaterialTier] = useState('standard');
  
  // Customer/Project selection state (pre-populate if editing)
  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    return editingTakeoffData?.customerId || '';
  });
  const [selectedProject, setSelectedProject] = useState(() => {
    return editingTakeoffData?.customerProjectId || '';
  });
  
  // Project information state (pre-populate if editing)
  const [projectName, setProjectName] = useState(() => {
    return editingTakeoffData?.name || '';
  });
  const [customerName, setCustomerName] = useState(() => {
    return editingTakeoffData?.customerName || '';
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    return editingTakeoffData?.customerEmail || '';
  });
  const [projectAddress, setProjectAddress] = useState(() => {
    return editingTakeoffData?.projectAddress || '';
  });
  const [projectNotes, setProjectNotes] = useState(() => {
    return editingTakeoffData?.notes || '';
  });
  
  // Hardware calculations state
  const [hardwareCalculations, setHardwareCalculations] = useState([]);
  const [additionalHardware, setAdditionalHardware] = useState([]); // Generic hardware added by contractor
  const [genericHardware, setGenericHardware] = useState([]); // Available generic hardware from localStorage

  // Load manufacturers data (using single state variable)
  const [manufacturers, setManufacturers] = useState([]);
  
  useEffect(() => {
    const loadManufacturers = () => {
      try {
        const savedManufacturers = localStorage.getItem('manufacturers');
        if (savedManufacturers) {
          const parsed = JSON.parse(savedManufacturers);
          if (Array.isArray(parsed)) {
            const manufacturersWithDates = parsed.map((manufacturer) => ({
              ...manufacturer,
              createdDate: new Date(manufacturer.createdDate),
              updatedDate: new Date(manufacturer.updatedDate)
            }));
            setManufacturers(manufacturersWithDates);
          }
        }
      } catch (error) {
        console.error('Error loading manufacturers:', error);
        setManufacturers([]);
      }
    };
    
    loadManufacturers();
    
    // Load generic hardware
    const loadGenericHardware = () => {
      try {
        const savedGenericHardware = localStorage.getItem('genericHardware');
        if (savedGenericHardware) {
          const parsed = JSON.parse(savedGenericHardware);
          // Filter to only show roofing category items for the roofing calculator
          const roofingHardware = parsed.filter(item => item.category === 'roofing');
          setGenericHardware(roofingHardware);
        } else {
          setGenericHardware([]);
        }
      } catch (error) {
        console.error('Error loading generic hardware:', error);
        setGenericHardware([]);
      }
    };
    
    loadGenericHardware();
  }, []);

  // Calculate hardware when product line is selected or additional hardware is added
  useEffect(() => {
    if (projectTotals) {
      const measurements = {
        totalSquareFeet: projectTotals.totalRoofArea,
        totalLinearFeet: projectTotals.totalRoofArea * 0.4, // rough estimate
        perimeterFeet: Math.sqrt(projectTotals.totalRoofArea) * 4
      };

      let allHardware = [];

      // Add manufacturer-specific hardware if product line is selected
      if (selectedProductLine && manufacturers.length > 0) {
        const manufacturer = manufacturers.find(m => m.id === selectedManufacturer);
        const productLine = manufacturer?.productLines?.find(pl => pl.id === selectedProductLine);
        
        if (productLine && productLine.hardware && productLine.hardware.length > 0) {
          allHardware = [...allHardware, ...productLine.hardware];
        }
      }

      // Add any additional hardware items selected by contractor
      if (additionalHardware.length > 0) {
        allHardware = [...allHardware, ...additionalHardware];
      }

      if (allHardware.length > 0) {
        const calculations = calculateHardwareQuantities(allHardware, measurements, hardwareCalculations);
        setHardwareCalculations(calculations);
      } else {
        setHardwareCalculations([]);
      }
    }
  }, [selectedProductLine, selectedManufacturer, projectTotals, manufacturers, additionalHardware]);
  
  // Load customers data
  const [customers, setCustomers] = useState(() => {
    try {
      const savedCustomers = localStorage.getItem('averageJoeCustomers');
      if (savedCustomers) {
        const parsed = JSON.parse(savedCustomers).map((c) => ({
          ...c,
          lastContact: new Date(c.lastContact),
          createdDate: new Date(c.createdDate),
          updatedDate: new Date(c.updatedDate),
          projects: c.projects?.map((p) => ({
            ...p,
            createdDate: new Date(p.createdDate),
            updatedDate: new Date(p.updatedDate),
            completedDate: p.completedDate ? new Date(p.completedDate) : undefined,
            takeoffs: p.takeoffs?.map((t) => ({
              ...t,
              createdDate: new Date(t.createdDate),
              updatedDate: new Date(t.updatedDate),
              completedDate: t.completedDate ? new Date(t.completedDate) : undefined,
              sentDate: t.sentDate ? new Date(t.sentDate) : undefined
            })) || []
          })) || []
        }));
        return parsed;
      } else {
        // Use mock data as fallback and save it to localStorage
        localStorage.setItem('averageJoeCustomers', JSON.stringify(MOCK_CUSTOMERS));
        return MOCK_CUSTOMERS;
      }
    } catch {
      return MOCK_CUSTOMERS;
    }
  });
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  
  // Filter to only roofing manufacturers
  const availableManufacturers = manufacturers.filter(m => 
    m.categories.includes('roofing')
  );

  // Get product lines for selected manufacturer
  const getProductLines = (manufacturerId) => {
    const manufacturer = availableManufacturers.find(m => m.id === manufacturerId);
    return manufacturer ? manufacturer.productLines.filter(pl => pl.isActive) : [];
  };

  // Get colors for selected product line
  const getColors = (manufacturerId, productLineId) => {
    const manufacturer = availableManufacturers.find(m => m.id === manufacturerId);
    if (!manufacturer) return [];
    
    const productLine = manufacturer.productLines.find(pl => pl.id === productLineId);
    return productLine ? productLine.colors : [];
  };

  // Get projects for selected customer
  const getCustomerProjects = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.projects || [];
  };

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    setSelectedProject('');
    
    // Pre-fill customer info when customer is selected
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerEmail(customer.email);
      setProjectAddress(customer.projectAddress || '');
    }
  };

  // Handle project selection
  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    
    if (projectId) {
      const customer = customers.find(c => c.id === selectedCustomer);
      const project = customer?.projects?.find(p => p.id === projectId);
      if (project) {
        setProjectName(`${project.name} - Additional Takeoff`);
        setProjectAddress(project.projectAddress);
        setProjectNotes(project.notes || '');
      }
    } else {
      // Reset to default when creating new project
      const customer = customers.find(c => c.id === selectedCustomer);
      if (customer) {
        setProjectName('');
        setProjectAddress(customer.projectAddress || '');
        setProjectNotes('');
      }
    }
  };

  // Calculate pricing based on selections
  const calculatePricingWithMaterials = () => {
    let baseCost = projectTotals.totalCost;
    
    if (selectedManufacturer && selectedProductLine) {
      const manufacturer = availableManufacturers.find(m => m.id === selectedManufacturer);
      const productLine = manufacturer?.productLines.find(p => p.id === selectedProductLine);
      
      if (manufacturer && productLine) {
        // Use the actual price from the product line
        const bundlePrice = productLine.pricePerUnit;
        const totalBundleCost = bundlePrice * projectTotals.totalShingles;
        
        // Replace base material cost with selected material cost
        baseCost = totalBundleCost + (baseCost * 0.3); // 30% for other materials/labor
      }
    }
    
    return baseCost;
  };

  const finalProjectCost = calculatePricingWithMaterials();
  const selectedProduct = selectedProductLine ? getProductLines(selectedManufacturer).find(p => p.id === selectedProductLine) : null;
  const selectedColorObj = selectedColor ? getColors(selectedManufacturer, selectedProductLine).find(c => c.id === selectedColor) : null;
  
  // Save takeoff project function
  const saveTakeoffProject = async () => {
    // Validation
    const requiredFields = [];
    
    if (!selectedCustomer && !customerName) {
      requiredFields.push('Customer selection');
    }
    
    if (!selectedManufacturer) requiredFields.push('Manufacturer');
    if (!selectedProductLine) requiredFields.push('Product Line');
    if (!selectedColor) requiredFields.push('Color');
    
    if (requiredFields.length > 0) {
      alert(`Please complete all required fields:\n• ${requiredFields.join('\n• ')}`);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create the takeoff project data
      const takeoffProject = {
        id: Math.random().toString(36).substr(2, 9),
        name: projectName || `Roofing Takeoff - ${new Date().toLocaleDateString()}`,
        type: 'roofing',
        customerId: selectedCustomer || undefined,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        customerProjectId: selectedProject || undefined,
        customerProjectName: selectedProject ? getCustomerProjects(selectedCustomer).find(p => p.id === selectedProject)?.name : undefined,
        projectAddress: projectAddress || 'Address not specified',
        status: 'completed',
        estimatedValue: Math.round(finalProjectCost),
        actualCost: Math.round(finalProjectCost),
        notes: projectNotes,
        createdDate: new Date(),
        updatedDate: new Date(),
        completedDate: new Date(),
        // Roofing-specific data
        elevationData: elevations,
        totalSquareFeet: projectTotals.totalRoofArea,
        totalBundles: projectTotals.totalShingles,
        totalUnderlayment: projectTotals.totalUnderlayment,
        // Manufacturer selections
        manufacturerSelections: [{
          manufacturerId: selectedManufacturer,
          manufacturerName: availableManufacturers.find(m => m.id === selectedManufacturer)?.name || '',
          productLineId: selectedProductLine,
          productLineName: selectedProduct?.name || '',
          colorId: selectedColor,
          colorName: selectedColorObj?.name || '',
          colorHex: selectedColorObj?.hexCode || '',
          category: 'roofing',
          pricePerUnit: selectedProduct?.pricePerUnit || 0,
          unit: selectedProduct?.unit || 'bundle'
        }]
      };

      // If we have a selected customer, handle project creation/attachment
      if (selectedCustomer) {
        if (selectedProject) {
          // Add takeoff to existing project
          const updatedCustomers = customers.map(customer => {
            if (customer.id === selectedCustomer) {
              const updatedProjects = customer.projects.map(project => {
                if (project.id === selectedProject) {
                  return {
                    ...project,
                    takeoffs: [...(project.takeoffs || []), takeoffProject],
                    actualCost: (project.actualCost || 0) + Math.round(finalProjectCost),
                    updatedDate: new Date()
                  };
                }
                return project;
              });
              return {
                ...customer,
                projects: updatedProjects,
                updatedDate: new Date()
              };
            }
            return customer;
          });
          
          localStorage.setItem('averageJoeCustomers', JSON.stringify(updatedCustomers));
          setCustomers(updatedCustomers);
        } else {
          // Create new trade-specific project
          const customer = customers.find(c => c.id === selectedCustomer);
          const projectTypeName = takeoffProject.type.charAt(0).toUpperCase() + takeoffProject.type.slice(1);
          const existingProjectsOfType = customer?.projects?.filter(p => p.projectType === takeoffProject.type) || [];
          
          const newProject = {
            id: Math.random().toString(36).substr(2, 9),
            customerId: selectedCustomer,
            name: existingProjectsOfType.length > 0 ? 
              `${projectTypeName} Project #${existingProjectsOfType.length + 1}` : 
              `${projectTypeName} Project`,
            description: `${projectTypeName} work created from takeoff`,
            projectAddress: projectAddress || customer?.projectAddress || '',
            projectType: takeoffProject.type,
            estimatedValue: Math.round(finalProjectCost),
            actualCost: Math.round(finalProjectCost),
            status: 'in_progress',
            takeoffs: [takeoffProject],
            notes: projectNotes,
            createdDate: new Date(),
            updatedDate: new Date()
          };

          const updatedCustomers = customers.map(customerItem => {
            if (customerItem.id === selectedCustomer) {
              return {
                ...customerItem,
                projects: [...(customerItem.projects || []), newProject],
                updatedDate: new Date()
              };
            }
            return customerItem;
          });

          localStorage.setItem('averageJoeCustomers', JSON.stringify(updatedCustomers));
          setCustomers(updatedCustomers);
        }
      }
      
      // Also save to standalone takeoffs for backwards compatibility
      const existingTakeoffs = JSON.parse(localStorage.getItem('takeoff-projects') || '[]');
      existingTakeoffs.push(takeoffProject);
      localStorage.setItem('takeoff-projects', JSON.stringify(existingTakeoffs));
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
      console.log('Takeoff project saved:', takeoffProject);
      
    } catch (error) {
      console.error('Error saving takeoff project:', error);
      alert('Error saving project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {editingTakeoffData ? 'Edit Takeoff - Material Selection' : 'Project Summary & Material Selection'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {editingTakeoffData ? 'Update measurements and materials for this takeoff' : 'Review measurements and select materials for final pricing'}
        </p>
        
        {editingTakeoffData && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-400">✏️</div>
              <div className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                <strong>Editing Mode:</strong> You are editing the takeoff "{editingTakeoffData.name}". All data has been pre-loaded for modification.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Measurement Summary */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">📐 Measurement Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{projectTotals.formatted.totalRoofArea}</div>
            <div className="opacity-90">Total Square Feet</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{projectTotals.totalShingles}</div>
            <div className="opacity-90">Shingle Bundles Needed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{projectTotals.totalUnderlayment}</div>
            <div className="opacity-90">Underlayment Rolls</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{completedElevations.length}/4</div>
            <div className="opacity-90">Elevations Complete</div>
          </div>
        </div>
      </div>

      {/* Customer & Project Selection Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">👤 Customer & Project Selection</h2>
        
        <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a customer...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.projectAddress}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          {selectedCustomer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Existing Roofing Project (Optional)
              </label>
              <select
                value={selectedProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Create new Roofing Project...</option>
                {getCustomerProjects(selectedCustomer)
                  .filter(project => project.projectType === 'roofing')
                  .map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.status}
                    </option>
                  ))
                }
              </select>
              
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {selectedProject ? 
                  "This takeoff will be added to the existing project" : 
                  "A new 'Roofing Project' will be created for this takeoff"
                }
              </div>
            </div>
          )}

          {/* Customer guidance */}
          {!selectedCustomer && (
            <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-amber-400">ℹ️</div>
                <div className="ml-2 text-sm text-amber-700 dark:text-amber-300">
                  Select a customer to attach this takeoff to an existing project, or leave blank to create a standalone takeoff.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">📋 Project Information</h2>
        
        {selectedCustomer ? (
          // Show read-only project info when customer is selected
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                {customerName}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Email</label>
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                {customerEmail}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Address</label>
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                {projectAddress}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Notes (Optional)</label>
              <textarea
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about this takeoff..."
              />
            </div>
          </div>
        ) : (
          // Show editable fields when no customer is selected (standalone takeoff)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-400">ℹ️</div>
                  <div className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                    <strong>Standalone Takeoff:</strong> You can create a takeoff without linking it to a customer. Fill out the information below, or go back and select a customer to auto-populate these fields.
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Roofing Project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Johnson"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., john@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Address</label>
              <input
                type="text"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 123 Main Street"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Notes</label>
              <textarea
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about the project..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Material Selection Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">🏗️ Material Selection & Pricing</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selection Controls */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Choose Your Materials <span className="text-red-500">*</span>
            </h3>
            
            {/* Required fields notice */}
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-blue-600 dark:text-blue-400 mr-2">ℹ️</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Required for saving:</strong> Complete project name and select manufacturer, product line, and color to save this takeoff project.
                </div>
              </div>
            </div>
            
            {/* Manufacturer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manufacturer</label>
              <select
                value={selectedManufacturer}
                onChange={(e) => {
                  setSelectedManufacturer(e.target.value);
                  setSelectedProductLine('');
                  setSelectedColor('');
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Manufacturer...</option>
                {availableManufacturers.map(manufacturer => (
                  <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Line Selection */}
            {selectedManufacturer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Line</label>
                <select
                  value={selectedProductLine}
                  onChange={(e) => {
                    setSelectedProductLine(e.target.value);
                    setSelectedColor('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Product Line...</option>
                  {getProductLines(selectedManufacturer).map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.pricePerUnit}/{product.unit}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Color Selection */}
            {selectedProductLine && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shingle Color</label>
                <div className="grid grid-cols-1 gap-3">
                  {getColors(selectedManufacturer, selectedProductLine).map(color => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`flex items-center p-3 border-2 rounded-lg transition-all ${
                        selectedColor === color.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300 mr-3"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{color.name}</span>
                      {selectedColor === color.id && (
                        <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Project Estimate</h3>
            
            {selectedManufacturer && selectedProductLine ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Base Materials & Labor</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{projectTotals.formatted.totalCost}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Selected Materials</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedProduct ? `$${(selectedProduct.pricePerUnit * projectTotals.totalShingles).toLocaleString()}` : '$0'}
                  </span>
                </div>
                
                <hr className="border-gray-300 dark:border-gray-600" />
                
                {hardwareCalculations.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Hardware & Accessories</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${getTotalHardwareCost(hardwareCalculations).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Project Cost</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${Math.round(finalProjectCost + getTotalHardwareCost(hardwareCalculations)).toLocaleString()}
                  </span>
                </div>
                
                {selectedColorObj && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-600 rounded-lg border">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                        style={{ backgroundColor: selectedColorObj.hexCode }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Final Color: {selectedColorObj.name}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Product Information */}
                {selectedProduct && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedProduct.description}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-4">🏗️</div>
                <p>Select materials above to see pricing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hardware & Accessories Section */}
      {(hardwareCalculations.length > 0 || genericHardware.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">🔧 Hardware & Accessories</h3>
          
          <div className="space-y-4">
            {hardwareCalculations.length > 0 && hardwareCalculations.map((calc) => (
              <div key={calc.hardwareId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{calc.name}</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      {calc.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Calculated: {calc.calculatedQuantity} {calc.unit} • ${calc.pricePerUnit}/{calc.unit}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={calc.overrideQuantity ?? calc.calculatedQuantity}
                      onChange={(e) => {
                        const newQuantity = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setHardwareCalculations(prev => 
                          updateHardwareOverride(prev, calc.hardwareId, newQuantity, calc.overridePrice)
                        );
                      }}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      step="0.01"
                      min="0"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{calc.unit}</div>
                  </div>
                  
                  <div className="text-right">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Price/${calc.unit}</label>
                    <input
                      type="number"
                      value={calc.overridePrice ?? calc.pricePerUnit}
                      onChange={(e) => {
                        const newPrice = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setHardwareCalculations(prev => 
                          updateHardwareOverride(prev, calc.hardwareId, calc.overrideQuantity, newPrice)
                        );
                      }}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      step="0.01"
                      min="0"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">per {calc.unit}</div>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Total</label>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      ${calc.totalCost.toFixed(2)}
                    </div>
                    {(calc.overrideQuantity || calc.overridePrice) && (
                      <div className="text-xs text-orange-600 dark:text-orange-400">Modified</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {hardwareCalculations.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total Hardware Cost:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${getTotalHardwareCost(hardwareCalculations).toFixed(2)}
                </span>
              </div>
            )}
            
            {/* Add Generic Hardware Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Generic Hardware</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">Choose from common items</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {genericHardware.map((hardware) => {
                  const isAlreadyAdded = additionalHardware.some(item => item.id === hardware.id);
                  const isInManufacturerHardware = hardwareCalculations.some(calc => 
                    calc.hardwareId === hardware.id && !additionalHardware.find(item => item.id === hardware.id)
                  );
                  
                  return (
                    <button
                      key={hardware.id}
                      onClick={() => {
                        if (!isAlreadyAdded && !isInManufacturerHardware) {
                          setAdditionalHardware(prev => [...prev, hardware]);
                        } else if (isAlreadyAdded) {
                          setAdditionalHardware(prev => prev.filter(item => item.id !== hardware.id));
                        }
                      }}
                      disabled={isInManufacturerHardware}
                      className={`p-3 text-left border rounded-lg transition-all text-sm ${
                        isInManufacturerHardware
                          ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : isAlreadyAdded
                            ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900'
                      }`}
                    >
                      <div className="font-medium mb-1">{hardware.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{hardware.description}</div>
                      <div className="text-xs font-medium">
                        ${hardware.pricePerUnit}/{hardware.unit}
                      </div>
                      {isInManufacturerHardware && (
                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Already in manufacturer hardware
                        </div>
                      )}
                      {isAlreadyAdded && !isInManufacturerHardware && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Added
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {additionalHardware.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Added Generic Items:</strong> {additionalHardware.map(item => item.name).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Elevation Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Elevation Breakdown</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">Click any elevation to edit measurements</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ELEVATIONS.map((elevInfo, index) => {
            const elevation = elevations[index];
            const calc = elevation.completed ? calculateElevation(elevation) : null;
            const isCompleted = elevation.completed;
            
            return (
              <button
                key={elevInfo.id}
                onClick={() => onBack(index)} // Go back to specific elevation
                className={`text-left border-2 rounded-lg p-4 transition-all ${
                  isCompleted 
                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{elevInfo.icon}</span>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{elevInfo.name} Elevation</h4>
                  </div>
                  {isCompleted ? (
                    <span className="text-green-600 dark:text-green-400 font-bold">✓ Complete</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Pending</span>
                  )}
                </div>
                
                {calc ? (
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>Area: {calc.formatted.roofArea} sq ft</div>
                    <div>Shingles: {calc.shinglesNeeded} bundles</div>
                    <div>Pitch: {elevation.pitch}</div>
                    <div>Penetrations: {calc.penetrations}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Click to add measurements...
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={() => onBack()}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ← Back to Measurements
        </button>
        
        <div className="flex flex-wrap gap-4">
          {/* Save Project Button */}
          <button
            onClick={saveTakeoffProject}
            disabled={isSaving || !projectName || !selectedManufacturer || !selectedProductLine || !selectedColor}
            className={`px-6 py-3 font-medium rounded-md transition-colors inline-flex items-center gap-2 disabled:cursor-not-allowed ${
              saveSuccess 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : isSaving
                ? 'bg-gray-400 text-white'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white'
            }`}
          >
            {isSaving ? (
              <>🔄 Saving...</>
            ) : saveSuccess ? (
              <>✅ Project Saved!</>
            ) : (
              <>💾 Save Project</>
            )}
          </button>
          
          <button
            onClick={() => {
              // Create comprehensive report with material selections
              const reportDate = new Date().toLocaleDateString();
              const completedElevations = elevations.filter(e => e.completed);
              
              let report = `PROFESSIONAL ROOFING TAKEOFF REPORT\n`;
              report += `========================================\n`;
              report += `Date: ${reportDate}\n`;
              report += `Project: Field Measurements Complete\n`;
              report += `Total Elevations: ${completedElevations.length}\n\n`;
              
              report += `MEASUREMENT SUMMARY\n`;
              report += `------------------\n`;
              report += `Total Roof Area: ${projectTotals.formatted.totalRoofArea} sq ft\n`;
              report += `Total Shingle Bundles Needed: ${projectTotals.totalShingles}\n`;
              report += `Total Underlayment Rolls: ${projectTotals.totalUnderlayment}\n`;
              
              if (selectedManufacturer && selectedProductLine && selectedColor) {
                const manufacturer = availableManufacturers.find(m => m.id === selectedManufacturer);
                const productLine = getProductLines(selectedManufacturer).find(p => p.id === selectedProductLine);
                const colorObj = getColors(selectedManufacturer, selectedProductLine).find(c => c.id === selectedColor);
                
                report += `\nMATERIAL SELECTIONS\n`;
                report += `------------------\n`;
                report += `Manufacturer: ${manufacturer.name}\n`;
                report += `Product Line: ${productLine.name}\n`;
                report += `Description: ${productLine.description}\n`;
                report += `Color: ${colorObj.name}\n`;
                report += `Bundle Price: $${productLine.pricePerUnit}/${productLine.unit}\n`;
                report += `Total Bundles Needed: ${projectTotals.totalShingles}\n`;
                report += `Total Material Cost: $${Math.round(finalProjectCost).toLocaleString()}\n`;
              } else {
                report += `Base Estimate: ${projectTotals.formatted.totalCost}\n`;
                report += `\nNOTE: Material selections not completed\n`;
              }
              
              report += `\nELEVATION DETAILS\n`;
              report += `----------------\n`;
              completedElevations.forEach((elevation, index) => {
                const elevInfo = ELEVATIONS.find(e => e.id === elevation.id);
                const calc = calculateElevation(elevation);
                if (calc) {
                  report += `${index + 1}. ${elevInfo.name} Elevation\n`;
                  report += `   Dimensions: ${calc.length}' × ${calc.width}'\n`;
                  report += `   Roof Pitch: ${calc.pitch} (multiplier: ×${calc.pitchMultiplier})\n`;
                  report += `   Roof Area: ${calc.formatted.roofArea} sq ft\n`;
                  report += `   Shingle Bundles: ${calc.shinglesNeeded}\n`;
                  if (calc.ridgeLength > 0) report += `   Ridge Length: ${calc.ridgeLength}'\n`;
                  if (calc.valleyLength > 0) report += `   Valley Length: ${calc.valleyLength}'\n`;
                  if (calc.penetrations > 0) report += `   Penetrations: ${calc.penetrations}\n`;
                  if (elevation.notes) report += `   Notes: ${elevation.notes}\n`;
                  report += `\n`;
                }
              });
              
              report += `\nGenerated by Average Joe's Takeoffs - Professional Roofing Calculator\n`;
              
              // Download as text file
              const blob = new Blob([report], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `roofing-takeoff-${reportDate.replace(/\//g, '-')}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!selectedManufacturer || !selectedProductLine || !selectedColor}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors inline-flex items-center gap-2 disabled:cursor-not-allowed"
          >
            📄 Download Final Report
          </button>
          
          <button
            onClick={() => window.print()}
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