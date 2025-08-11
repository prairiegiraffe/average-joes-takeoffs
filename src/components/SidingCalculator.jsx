import React, { useState, useEffect, useMemo } from 'react';
import { 
  SIDING_ELEVATIONS, 
  TRIM_PROFILES,
  calculateSidingElevation,
  calculateSidingProjectTotals,
  createEmptySidingElevation,
  calculateMaterialCosts
} from '../utils/siding';
import {
  calculateHardwareQuantities,
  updateHardwareOverride,
  getTotalHardwareCost,
  formatCalculationMethod,
  getCalculationExplanation
} from '../utils/hardwareCalculations';

// Mock customers data for fallback
const MOCK_CUSTOMERS = [
  {
    id: '1',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    projectAddress: '123 Oak Street, Springfield',
    projectType: 'siding',
    estimatedValue: 15000,
    status: 'active_project',
    lastContact: new Date('2025-08-08'),
    projects: [],
    notes: 'Needs new siding after storm damage',
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

const SidingCalculator = ({ editingTakeoffData: propEditingData = null, onSave = null, onCancel = null }) => {
  // Check for editing takeoff data from localStorage (like roofing calculator)
  const [editingTakeoffData] = useState(() => {
    try {
      // First check if passed as prop
      if (propEditingData) {
        return propEditingData;
      }
      
      // Then check localStorage
      const savedTakeoff = localStorage.getItem('editingTakeoff');
      if (savedTakeoff) {
        const takeoff = JSON.parse(savedTakeoff);
        // Clear the editing data after loading
        localStorage.removeItem('editingTakeoff');
        return takeoff;
      }
      
      return null;
    } catch (error) {
      console.error('Error initializing editingTakeoffData:', error);
      return null;
    }
  });

  // Workflow state
  const [currentElevationIndex, setCurrentElevationIndex] = useState(0);
  const [elevations, setElevations] = useState(() => {
    try {
      // If editing a takeoff, load its elevation data
      if (editingTakeoffData?.elevationData) {
        return editingTakeoffData.elevationData;
      }
      
      // Initialize with empty elevations
      return SIDING_ELEVATIONS.map(() => createEmptySidingElevation());
    } catch (error) {
      console.error('Error initializing elevations:', error);
      return [];
    }
  });
  
  const [showSummary, setShowSummary] = useState(() => {
    // If editing a takeoff, go directly to summary
    return editingTakeoffData ? true : false;
  });

  // Material selection state (pre-populate if editing)
  const [selectedManufacturer, setSelectedManufacturer] = useState(() => {
    return editingTakeoffData?.manufacturerSelections?.[0]?.manufacturerId || '';
  });
  const [selectedProductLine, setSelectedProductLine] = useState(() => {
    return editingTakeoffData?.manufacturerSelections?.[0]?.productLineId || '';
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    return editingTakeoffData?.manufacturerSelections?.[0]?.colorId || '';
  });

  // Customer/project selection state (pre-populate if editing)
  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    return editingTakeoffData?.customerId || '';
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
          // Filter to only show siding category items for the siding calculator
          const sidingHardware = parsed.filter(item => item.category === 'siding');
          setGenericHardware(sidingHardware);
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

  const currentElevation = elevations[currentElevationIndex];
  const currentElevationInfo = SIDING_ELEVATIONS[currentElevationIndex];
  
  const projectTotals = useMemo(() => {
    try {
      return calculateSidingProjectTotals(elevations);
    } catch (error) {
      console.error('Error calculating project totals:', error);
      return { 
        totalSidingSF: 0, 
        totalOutsideCornerLF: 0, 
        totalInsideCornerLF: 0, 
        totalTrimboardLF: 0 
      };
    }
  }, [elevations]);

  // Calculate hardware when product line is selected or additional hardware is added
  useEffect(() => {
    if (projectTotals) {
      const measurements = {
        totalSquareFeet: projectTotals.totalSidingSF,
        totalLinearFeet: projectTotals.totalTrimboardLF,
        perimeterFeet: projectTotals.totalOutsideCornerLF + projectTotals.totalInsideCornerLF
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
            updatedDate: new Date(p.updatedDate)
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

  const [selectedProject, setSelectedProject] = useState(() => {
    return editingTakeoffData?.projectId || '';
  });

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter to only siding manufacturers
  const availableManufacturers = manufacturers.filter(m => 
    m.categories.includes('siding')
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

  // Get selected product details
  const selectedProduct = selectedProductLine ? 
    getProductLines(selectedManufacturer).find(pl => pl.id === selectedProductLine) : null;

  const selectedColorObj = selectedColor && selectedProduct ? 
    getColors(selectedManufacturer, selectedProductLine).find(c => c.id === selectedColor) : null;

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
    const { length, height } = currentElevation;
    return length && height &&
           parseFloat(length) > 0 && parseFloat(height) > 0;
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
    if (currentElevationIndex < SIDING_ELEVATIONS.length - 1) {
      setCurrentElevationIndex(currentElevationIndex + 1);
    } else {
      // On final elevation, go to summary after completing
      setTimeout(() => setShowSummary(true), 100);
    }
  };

  // Check if all elevations are completed
  const areAllElevationsComplete = () => {
    return elevations.every(elev => elev.completed);
  };

  // Handle generic hardware selection
  const addGenericHardware = (hardware) => {
    if (!additionalHardware.find(item => item.id === hardware.id)) {
      setAdditionalHardware(prev => [...prev, hardware]);
    }
  };

  const removeGenericHardware = (hardwareId) => {
    setAdditionalHardware(prev => prev.filter(item => item.id !== hardwareId));
  };

  // Handle hardware quantity/price overrides
  const handleHardwareOverride = (hardwareId, field, value) => {
    const numericValue = value === '' ? undefined : parseFloat(value);
    const overrideQuantity = field === 'quantity' ? numericValue : undefined;
    const overridePrice = field === 'price' ? numericValue : undefined;
    
    setHardwareCalculations(prev => 
      updateHardwareOverride(prev, hardwareId, overrideQuantity, overridePrice)
    );
  };

  // Corner management functions
  const addCorner = (type) => {
    const cornerField = type === 'outside' ? 'outsideCorners' : 'insideCorners';
    const newCorner = { height: '', linearFeet: '' };
    
    setElevations(prev => prev.map((elev, index) => 
      index === currentElevationIndex 
        ? { 
            ...elev, 
            [cornerField]: [...(elev[cornerField] || []), newCorner]
          }
        : elev
    ));
  };

  const updateCorner = (type, index, field, value) => {
    const cornerField = type === 'outside' ? 'outsideCorners' : 'insideCorners';
    
    setElevations(prev => prev.map((elev, elevIndex) => 
      elevIndex === currentElevationIndex 
        ? { 
            ...elev, 
            [cornerField]: elev[cornerField].map((corner, cornerIndex) =>
              cornerIndex === index ? { ...corner, [field]: value } : corner
            )
          }
        : elev
    ));
  };

  const removeCorner = (type, index) => {
    const cornerField = type === 'outside' ? 'outsideCorners' : 'insideCorners';
    
    setElevations(prev => prev.map((elev, elevIndex) => 
      elevIndex === currentElevationIndex 
        ? { 
            ...elev, 
            [cornerField]: elev[cornerField].filter((_, cornerIndex) => cornerIndex !== index)
          }
        : elev
    ));
  };

  // Trimboard management functions
  const addTrimboard = () => {
    const newTrim = { linearFeet: '', profile: TRIM_PROFILES[0].id };
    
    setElevations(prev => prev.map((elev, index) => 
      index === currentElevationIndex 
        ? { 
            ...elev, 
            trimboard: [...(elev.trimboard || []), newTrim]
          }
        : elev
    ));
  };

  const updateTrimboard = (index, field, value) => {
    setElevations(prev => prev.map((elev, elevIndex) => 
      elevIndex === currentElevationIndex 
        ? { 
            ...elev, 
            trimboard: elev.trimboard.map((trim, trimIndex) =>
              trimIndex === index ? { ...trim, [field]: value } : trim
            )
          }
        : elev
    ));
  };

  const removeTrimboard = (index) => {
    setElevations(prev => prev.map((elev, elevIndex) => 
      elevIndex === currentElevationIndex 
        ? { 
            ...elev, 
            trimboard: elev.trimboard.filter((_, trimIndex) => trimIndex !== index)
          }
        : elev
    ));
  };

  // Helper functions
  const getCustomerProjects = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.projects || [];
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    setSelectedProject('');
    
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerEmail(customer.email);
        setProjectAddress(customer.projectAddress || '');
      }
    } else {
      setCustomerName('');
      setCustomerEmail('');
      setProjectAddress('');
    }
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!selectedProduct) return { baseCost: 0, materialCost: 0, finalCost: 0 };
    
    const baseLaborCost = projectTotals.totalSidingSF * 1.50; // $1.50 per sq ft for labor
    const materialCost = selectedProduct.pricePerUnit * Math.ceil(projectTotals.totalSidingSF / 100); // Price per 100 sq ft
    const finalCost = baseLaborCost + materialCost;
    
    return { baseCost: baseLaborCost, materialCost, finalCost };
  };

  const pricing = calculatePricing();
  const finalProjectCost = pricing.finalCost;

  // Save takeoff function
  const saveTakeoff = async () => {
    if (!selectedCustomer || !selectedManufacturer || !selectedProductLine || !selectedColor) {
      alert('Please complete all required fields: Customer, Manufacturer, Product Line, and Color');
      return;
    }

    setIsSaving(true);
    
    try {
      const takeoffProject = {
        id: editingTakeoffData?.id || Math.random().toString(36).substr(2, 9),
        name: `${customerName} - Siding Project`,
        type: 'siding',
        status: 'completed',
        createdDate: editingTakeoffData?.createdDate || new Date(),
        updatedDate: new Date(),
        customerId: selectedCustomer,
        customerName,
        customerEmail,
        projectAddress,
        notes: projectNotes,
        elevationData: elevations,
        measurements: projectTotals,
        totalSquareFeet: projectTotals.totalSidingSF,
        totalOutsideCornerLF: projectTotals.totalOutsideCornerLF,
        totalInsideCornerLF: projectTotals.totalInsideCornerLF,
        totalTrimboardLF: projectTotals.totalTrimboardLF,
        // Manufacturer selections
        manufacturerSelections: [{
          manufacturerId: selectedManufacturer,
          manufacturerName: availableManufacturers.find(m => m.id === selectedManufacturer)?.name || '',
          productLineId: selectedProductLine,
          productLineName: selectedProduct?.name || '',
          colorId: selectedColor,
          colorName: selectedColorObj?.name || '',
          colorHex: selectedColorObj?.hexCode || '',
          category: 'siding',
          pricePerUnit: selectedProduct?.pricePerUnit || 0,
          unit: selectedProduct?.unit || 'sq_ft'
        }]
      };

      // Save to takeoffs localStorage
      let allTakeoffs = [];
      const savedTakeoffs = localStorage.getItem('takeoffs');
      if (savedTakeoffs) {
        allTakeoffs = JSON.parse(savedTakeoffs);
      }

      if (editingTakeoffData) {
        // Update existing takeoff
        const index = allTakeoffs.findIndex(t => t.id === editingTakeoffData.id);
        if (index !== -1) {
          allTakeoffs[index] = takeoffProject;
        }
      } else {
        // Add new takeoff
        allTakeoffs.push(takeoffProject);
      }

      localStorage.setItem('takeoffs', JSON.stringify(allTakeoffs));

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
            name: `${projectTypeName} Project ${existingProjectsOfType.length + 1}`,
            projectType: takeoffProject.type,
            status: 'in_progress',
            priority: 'medium',
            estimatedCost: Math.round(finalProjectCost),
            actualCost: Math.round(finalProjectCost),
            description: `${projectTypeName} project for ${customerName}`,
            createdDate: new Date(),
            updatedDate: new Date(),
            takeoffs: [takeoffProject]
          };

          const updatedCustomers = customers.map(c => 
            c.id === selectedCustomer 
              ? { 
                  ...c, 
                  projects: [...(c.projects || []), newProject],
                  updatedDate: new Date()
                }
              : c
          );
          
          localStorage.setItem('averageJoeCustomers', JSON.stringify(updatedCustomers));
          setCustomers(updatedCustomers);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Call onSave callback if provided
      if (onSave) {
        onSave(takeoffProject);
      }
    } catch (error) {
      console.error('Error saving takeoff:', error);
      alert('Error saving takeoff. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (showSummary) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            🏠 Siding Calculator - Project Summary
          </h2>
          <button
            onClick={() => setShowSummary(false)}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← Back to Measurements
          </button>
        </div>

        {/* Customer & Project Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">👤 Customer & Project Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Customer *
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a customer...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && getCustomerProjects(selectedCustomer).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add to Existing Project (Optional)
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="">Create new project...</option>
                  {getCustomerProjects(selectedCustomer).map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - ${project.estimatedCost?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                placeholder="customer@email.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Address
              </label>
              <input
                type="text"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                placeholder="Project address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Notes
              </label>
              <textarea
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                placeholder="Additional project notes..."
              />
            </div>
          </div>
        </div>

        {/* Material Selection & Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Material Selection & Pricing</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">Choose Your Materials</span>
                <span className="text-red-500">*</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Manufacturer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Manufacturer
                </label>
                <select
                  value={selectedManufacturer}
                  onChange={(e) => {
                    setSelectedManufacturer(e.target.value);
                    setSelectedProductLine('');
                    setSelectedColor('');
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Line
                  </label>
                  <select
                    value={selectedProductLine}
                    onChange={(e) => {
                      setSelectedProductLine(e.target.value);
                      setSelectedColor('');
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Siding Color
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getColors(selectedManufacturer, selectedProductLine).map(color => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedColor === color.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color.hexCode }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {color.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Project Estimate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Project Estimate</h3>
            
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Base Materials & Labor</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${Math.round(pricing.baseCost).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Selected Materials</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${Math.round(pricing.materialCost).toLocaleString()}
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
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-4">🏗️</div>
                <p>Select materials above to see pricing</p>
              </div>
            )}
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
                      Calculated: {calc.calculatedQuantity.toFixed(2)} {calc.unit} • ${calc.pricePerUnit}/{calc.unit}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity</div>
                      <input
                        type="number"
                        step="0.01"
                        value={calc.overrideQuantity ?? calc.finalQuantity}
                        onChange={(e) => handleHardwareOverride(calc.hardwareId, 'quantity', e.target.value)}
                        className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-sm"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{calc.unit}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price/${calc.unit}</div>
                      <input
                        type="number"
                        step="0.01"
                        value={calc.overridePrice ?? calc.finalPricePerUnit}
                        onChange={(e) => handleHardwareOverride(calc.hardwareId, 'price', e.target.value)}
                        className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-sm"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatCalculationMethod(
                          hardwareCalculations.find(h => h.hardwareId === calc.hardwareId)?.calculationMethod || 'fixed_quantity'
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
                      <div className="font-bold text-green-600 dark:text-green-400">
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
                            addGenericHardware(hardware);
                          } else if (isAlreadyAdded) {
                            removeGenericHardware(hardware.id);
                          }
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isInManufacturerHardware
                            ? 'border-gray-300 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : isAlreadyAdded
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                        disabled={isInManufacturerHardware}
                      >
                        <div className="font-medium text-sm mb-1">{hardware.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{hardware.description}</div>
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${hardware.pricePerUnit}/{hardware.unit}
                        </div>
                        {isInManufacturerHardware && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Already in manufacturer hardware
                          </div>
                        )}
                        {isAlreadyAdded && !isInManufacturerHardware && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Added to project
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Elevation Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Elevation Breakdown</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Click any elevation to edit measurements</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {elevations.map((elevation, index) => {
              const elevationInfo = SIDING_ELEVATIONS[index];
              const elevationData = calculateSidingElevation(elevation);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentElevationIndex(index);
                    setShowSummary(false);
                  }}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">{elevationInfo.icon}</div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{elevationInfo.name}</h4>
                  {elevation.completed ? (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      <div>✓ Complete</div>
                      <div>Area: {elevationData.netSF.toFixed(2)} sq ft</div>
                      <div>Outside Corners: {elevationData.totalOutsideCornerLF.toFixed(2)} LF</div>
                      <div>Inside Corners: {elevationData.totalInsideCornerLF.toFixed(2)} LF</div>
                      <div>Trimboard: {elevationData.totalTrimboardLF.toFixed(2)} LF</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Not completed</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowSummary(false)}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Measurements
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={saveTakeoff}
              disabled={isSaving || !selectedCustomer || !selectedManufacturer || !selectedProductLine || !selectedColor}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isSaving || !selectedCustomer || !selectedManufacturer || !selectedProductLine || !selectedColor
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaving ? '💾 Saving...' : '💾 Save Project'}
            </button>
            
            <button
              onClick={() => {
                // Generate and download report logic here
                alert('Download functionality will be implemented');
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              📄 Download Final Report
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
            ✅ Takeoff saved successfully!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            🏠 Siding Calculator - {currentElevationInfo.name}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentElevationIndex + 1} of {SIDING_ELEVATIONS.length}
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← Back to Takeoffs
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {SIDING_ELEVATIONS.map((elev, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentElevationIndex ? 'bg-green-600 text-white' :
                index === currentElevationIndex ? 'bg-blue-600 text-white' :
                'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {index < currentElevationIndex ? '✓' : index + 1}
              </div>
              <div className="text-xs mt-1 text-center">
                <div className="font-medium">{elev.name}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentElevationIndex + 1) / SIDING_ELEVATIONS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Elevation Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="text-4xl mr-4">{currentElevationInfo.icon}</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{currentElevationInfo.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{currentElevationInfo.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Measurements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Length (ft) *
            </label>
            <input
              type="number"
              step="0.1"
              value={currentElevation.length}
              onChange={(e) => updateCurrentElevation('length', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter length in feet"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height (ft) *
            </label>
            <input
              type="number"
              step="0.1"
              value={currentElevation.height}
              onChange={(e) => updateCurrentElevation('height', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter height in feet"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Window & Door Deductions (sq ft)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentElevation.windowDoorDeductions}
              onChange={(e) => updateCurrentElevation('windowDoorDeductions', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
              placeholder="Total area to subtract for windows and doors"
            />
          </div>
        </div>

        {/* Outside Corners */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Outside Corners
            </label>
            <button
              onClick={() => addCorner('outside')}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Add Corner
            </button>
          </div>
          {currentElevation.outsideCorners?.map((corner, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="number"
                step="0.1"
                placeholder="Height (ft)"
                value={corner.height}
                onChange={(e) => updateCorner('outside', index, 'height', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Linear Feet"
                value={corner.linearFeet}
                onChange={(e) => updateCorner('outside', index, 'linearFeet', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
              />
              <button
                onClick={() => removeCorner('outside', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Inside Corners */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Inside Corners
            </label>
            <button
              onClick={() => addCorner('inside')}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Add Corner
            </button>
          </div>
          {currentElevation.insideCorners?.map((corner, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="number"
                step="0.1"
                placeholder="Height (ft)"
                value={corner.height}
                onChange={(e) => updateCorner('inside', index, 'height', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Linear Feet"
                value={corner.linearFeet}
                onChange={(e) => updateCorner('inside', index, 'linearFeet', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
              />
              <button
                onClick={() => removeCorner('inside', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Trimboard */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Trimboard
            </label>
            <button
              onClick={addTrimboard}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Add Trim
            </button>
          </div>
          {currentElevation.trimboard?.map((trim, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2">
              <input
                type="number"
                step="0.1"
                placeholder="Linear Feet"
                value={trim.linearFeet}
                onChange={(e) => updateTrimboard(index, 'linearFeet', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
              />
              <select
                value={trim.profile}
                onChange={(e) => updateTrimboard(index, 'profile', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
              >
                {TRIM_PROFILES.map(profile => (
                  <option key={profile.id} value={profile.id}>{profile.name}</option>
                ))}
              </select>
              <div></div>
              <button
                onClick={() => removeTrimboard(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Current Elevation Summary */}
        {(currentElevation.length && currentElevation.height) && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Elevation Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Gross Area:</span>
                <div className="font-medium">{(parseFloat(currentElevation.length || 0) * parseFloat(currentElevation.height || 0)).toFixed(2)} sq ft</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Net Area:</span>
                <div className="font-medium">
                  {(parseFloat(currentElevation.length || 0) * parseFloat(currentElevation.height || 0) - parseFloat(currentElevation.windowDoorDeductions || 0)).toFixed(2)} sq ft
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Outside Corners:</span>
                <div className="font-medium">
                  {(currentElevation.outsideCorners || []).reduce((sum, corner) => 
                    sum + (parseFloat(corner.height || 0) || parseFloat(corner.linearFeet || 0)), 0
                  ).toFixed(2)} LF
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Inside Corners:</span>
                <div className="font-medium">
                  {(currentElevation.insideCorners || []).reduce((sum, corner) => 
                    sum + (parseFloat(corner.height || 0) || parseFloat(corner.linearFeet || 0)), 0
                  ).toFixed(2)} LF
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentElevationIndex(Math.max(0, currentElevationIndex - 1))}
          disabled={currentElevationIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentElevationIndex === 0
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          ← Previous
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentElevationIndex + 1} of {SIDING_ELEVATIONS.length} elevations
        </div>

        <button
          onClick={goToNextElevation}
          disabled={!isCurrentElevationComplete()}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !isCurrentElevationComplete()
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : currentElevationIndex === SIDING_ELEVATIONS.length - 1
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {currentElevationIndex === SIDING_ELEVATIONS.length - 1 ? 'Complete & Review' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default SidingCalculator;