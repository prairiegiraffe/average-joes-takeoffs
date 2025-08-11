import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HardwareAccessory, CalculationMethod, Distributor, TakeoffType } from '../types';
import { getAllGenericHardware } from '../utils/genericHardware';
import { formatCalculationMethod } from '../utils/hardwareCalculations';

interface EditingHardware extends Partial<HardwareAccessory> {
  id?: string;
}

export default function GenericHardware() {
  const navigate = useNavigate();
  const [genericHardware, setGenericHardware] = useState<HardwareAccessory[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHardware, setEditingHardware] = useState<EditingHardware | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<EditingHardware>({
    name: '',
    description: '',
    sku: '',
    pricePerUnit: 0,
    unit: 'piece',
    calculationMethod: 'fixed_quantity',
    calculationValue: 1,
    isRequired: false,
    category: 'roofing',
    distributorId: ''
  });

  const categories = [
    { value: 'all', label: 'All Takeoff Types' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'siding', label: 'Siding' },
    { value: 'stone', label: 'Stone Siding' },
    { value: 'windows', label: 'Windows' },
    { value: 'gutters', label: 'Gutters' },
    { value: 'insulation', label: 'Insulation' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'drywall', label: 'Drywall' },
    { value: 'painting', label: 'Painting' },
    { value: 'general', label: 'General' }
  ];

  const calculationMethods: CalculationMethod[] = [
    'per_square_foot',
    'per_linear_foot', 
    'per_piece',
    'percentage',
    'fixed_quantity'
  ];

  useEffect(() => {
    loadGenericHardware();
    loadDistributors();
  }, []);

  const loadGenericHardware = () => {
    const savedGenericHardware = localStorage.getItem('genericHardware');
    if (savedGenericHardware) {
      const parsed = JSON.parse(savedGenericHardware);
      setGenericHardware(parsed);
    } else {
      const defaultGenericHardware = getAllGenericHardware();
      setGenericHardware(defaultGenericHardware);
      localStorage.setItem('genericHardware', JSON.stringify(defaultGenericHardware));
    }
  };

  const loadDistributors = () => {
    const savedDistributors = localStorage.getItem('averageJoeDistributors');
    if (savedDistributors) {
      const parsed = JSON.parse(savedDistributors).map((d: any) => ({
        ...d,
        createdDate: new Date(d.createdDate),
        updatedDate: new Date(d.updatedDate)
      }));
      setDistributors(parsed);
    } else {
      // No distributors available yet
    }
  };

  const filteredHardware = selectedCategory === 'all' 
    ? genericHardware 
    : genericHardware.filter(item => item.category === selectedCategory);

  const handleAddNew = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      pricePerUnit: 0,
      unit: 'piece',
      calculationMethod: 'fixed_quantity',
      calculationValue: 1,
      isRequired: false,
      category: 'roofing',
      distributorId: ''
    });
    setEditingHardware(null);
    setShowForm(true);
  };

  const handleEdit = (hardware: HardwareAccessory) => {
    setFormData({
      name: hardware.name,
      description: hardware.description || '',
      sku: hardware.sku || '',
      pricePerUnit: hardware.pricePerUnit,
      unit: hardware.unit,
      calculationMethod: hardware.calculationMethod,
      calculationValue: hardware.calculationValue,
      isRequired: hardware.isRequired,
      category: hardware.category,
      distributorId: hardware.distributorId || ''
    });
    setEditingHardware(hardware);
    setShowForm(true);
  };

  const handleDelete = (hardwareId: string) => {
    if (window.confirm('Are you sure you want to delete this hardware item?')) {
      const updatedHardware = genericHardware.filter(item => item.id !== hardwareId);
      setGenericHardware(updatedHardware);
      localStorage.setItem('genericHardware', JSON.stringify(updatedHardware));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.pricePerUnit <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedHardware: HardwareAccessory[];

    if (editingHardware) {
      // Update existing hardware
      updatedHardware = genericHardware.map(item => 
        item.id === editingHardware.id 
          ? { ...item, ...formData } as HardwareAccessory
          : item
      );
    } else {
      // Add new hardware
      const newHardware: HardwareAccessory = {
        id: `generic-custom-${Date.now()}`,
        ...formData
      } as HardwareAccessory;
      updatedHardware = [...genericHardware, newHardware];
    }

    setGenericHardware(updatedHardware);
    localStorage.setItem('genericHardware', JSON.stringify(updatedHardware));
    setShowForm(false);
    setEditingHardware(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHardware(null);
  };

  const getDistributorName = (distributorId?: string) => {
    if (!distributorId) return 'None assigned';
    const distributor = distributors.find(d => d.id === distributorId);
    return distributor ? distributor.companyName : 'Unknown distributor';
  };

  const getCalculationLabel = (method: CalculationMethod) => {
    switch (method) {
      case 'per_square_foot': return 'Value per sq ft';
      case 'per_linear_foot': return 'Value per linear ft';
      case 'per_piece': return 'Coverage per piece (sq ft)';
      case 'percentage': return 'Percentage of material';
      case 'fixed_quantity': return 'Fixed quantity';
      default: return 'Value';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/manufacturers')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Manufacturers
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Generic Hardware Management</h1>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-4">
        <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
          Filter by Takeoff Type:
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={handleAddNew}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hardware Item
        </button>
      </div>

      {/* Hardware Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHardware.map((hardware) => (
          <div key={hardware.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{hardware.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{hardware.description}</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      hardware.category === 'roofing' ? 'bg-blue-100 text-blue-800' :
                      hardware.category === 'siding' ? 'bg-green-100 text-green-800' :
                      hardware.category === 'windows' ? 'bg-yellow-100 text-yellow-800' :
                      hardware.category === 'gutters' ? 'bg-purple-100 text-purple-800' :
                      hardware.category === 'insulation' ? 'bg-pink-100 text-pink-800' :
                      hardware.category === 'flooring' ? 'bg-orange-100 text-orange-800' :
                      hardware.category === 'drywall' ? 'bg-gray-100 text-gray-800' :
                      hardware.category === 'painting' ? 'bg-red-100 text-red-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {hardware.category}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(hardware)}
                    className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(hardware.id)}
                    className="text-red-600 hover:text-red-900 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</dt>
                    <dd className="text-sm text-gray-900 font-medium">{hardware.sku || 'No SKU'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price</dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      ${hardware.pricePerUnit.toFixed(2)} / {hardware.unit}
                    </dd>
                  </div>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Calculation Method</dt>
                  <dd className="text-sm text-gray-900">
                    {formatCalculationMethod(hardware.calculationMethod)} ({hardware.calculationValue})
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</dt>
                  <dd className="text-sm text-gray-900">
                    {getDistributorName(hardware.distributorId)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredHardware.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <p className="text-gray-500 mb-4">No hardware items found for the selected takeoff type.</p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first hardware item
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingHardware ? 'Edit Hardware Item' : 'Add New Hardware Item'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Product SKU"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Unit *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerUnit || 0}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit || 'piece'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="roll">Roll</option>
                    <option value="bundle">Bundle</option>
                    <option value="linear_ft">Linear Foot</option>
                    <option value="square_ft">Square Foot</option>
                    <option value="gallon">Gallon</option>
                    <option value="pound">Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Takeoff Type
                  </label>
                  <select
                    value={formData.category || 'roofing'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as HardwareAccessory['category'] })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="roofing">Roofing</option>
                    <option value="siding">Siding</option>
                    <option value="stone">Stone Siding</option>
                    <option value="windows">Windows</option>
                    <option value="gutters">Gutters</option>
                    <option value="insulation">Insulation</option>
                    <option value="flooring">Flooring</option>
                    <option value="drywall">Drywall</option>
                    <option value="painting">Painting</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calculation Method
                  </label>
                  <select
                    value={formData.calculationMethod || 'fixed_quantity'}
                    onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value as CalculationMethod })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {calculationMethods.map(method => (
                      <option key={method} value={method}>
                        {formatCalculationMethod(method)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getCalculationLabel(formData.calculationMethod || 'fixed_quantity')}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.calculationValue || 0}
                    onChange={(e) => setFormData({ ...formData, calculationValue: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distributor
                </label>
                <select
                  value={formData.distributorId || ''}
                  onChange={(e) => setFormData({ ...formData, distributorId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None assigned</option>
                  {distributors.map(distributor => (
                    <option key={distributor.id} value={distributor.id}>
                      {distributor.companyName}
                    </option>
                  ))}
                </select>
                {distributors.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No distributors available. Add distributors from the Distributors page first.</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired || false}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700">
                  Required item
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingHardware ? 'Update' : 'Add'} Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}