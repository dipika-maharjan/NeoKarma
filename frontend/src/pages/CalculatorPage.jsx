'use client';

import React, { useState } from 'react';
import { Card, Input, Select, Button } from '@/components/ui';
import { logDailyCarbon, getTodayLog } from '@/lib/actions/calculatorActions';
import { useAuth } from '@/context/AuthContext';
import Skeleton from '@/components/ui/Skeleton';

const CalculatorPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);
  const [formData, setFormData] = useState({
    transportationMode: 'bus',
    transportationDistanceKm: 0,
    foodMealType: 'vegetarian',
    wasteAndPlasticCount: 0,
    energyUsageHours: 0
  });
  const [errors, setErrors] = useState({});

  const transportationOptions = [
    { value: 'walk', label: 'Walking' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'bus', label: 'Bus' },
    { value: 'motorbike', label: 'Motorbike' },
    { value: 'car', label: 'Car' }
  ];

  const foodOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian' },
    { value: 'vegan', label: 'Vegan' }
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.transportationDistanceKm < 0) {
      newErrors.transportationDistanceKm = 'Distance cannot be negative';
    }
    if (formData.wasteAndPlasticCount < 0) {
      newErrors.wasteAndPlasticCount = 'Count cannot be negative';
    }
    if (formData.energyUsageHours < 0) {
      newErrors.energyUsageHours = 'Hours cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await logDailyCarbon(formData);
      setTodayLogged(true);
      // Navigate to result page or show success
      window.location.href = '/result';
    } catch (error) {
      console.error('Error logging carbon:', error);
      setErrors({ submit: error.message || 'Failed to submit' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <p className="text-center text-gray-600">Please log in to access the calculator</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Carbon Calculator</h1>
          <p className="text-gray-600">Log your daily activities and calculate your carbon footprint</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Transportation</h2>
                  <div className="space-y-4">
                    <Select
                      label="Mode of Transport"
                      name="transportationMode"
                      value={formData.transportationMode}
                      onChange={handleChange}
                      options={transportationOptions}
                      required
                    />
                    <Input
                      label="Distance (km)"
                      type="number"
                      name="transportationDistanceKm"
                      value={formData.transportationDistanceKm}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      required
                      error={errors.transportationDistanceKm}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Food</h2>
                  <div className="space-y-4">
                    <Select
                      label="Meal Type"
                      name="foodMealType"
                      value={formData.foodMealType}
                      onChange={handleChange}
                      options={foodOptions}
                      required
                    />
                    <Input
                      label="Food Waste (grams)"
                      type="number"
                      name="wasteAndPlasticCount"
                      value={formData.wasteAndPlasticCount}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      error={errors.wasteAndPlasticCount}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Energy</h2>
                  <Input
                    label="Appliance Usage (hours)"
                    type="number"
                    name="energyUsageHours"
                    value={formData.energyUsageHours}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    required
                    error={errors.energyUsageHours}
                  />
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full"
                >
                  Calculate Impact
                </Button>
              </form>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton height="h-6" />
                  <Skeleton height="h-6" />
                  <Skeleton height="h-6" />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport:</span>
                    <span className="font-medium text-gray-900">
                      {(formData.transportationDistanceKm * 0.2).toFixed(2)} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food:</span>
                    <span className="font-medium text-gray-900">
                      {formData.foodMealType === 'non-vegetarian' ? '2.8' : '1.2'} kg
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600 font-medium">Total Estimate:</span>
                    <span className="font-bold text-[#1B5E20] text-lg">
                      {(
                        (formData.transportationDistanceKm * 0.2) +
                        (formData.foodMealType === 'non-vegetarian' ? 2.8 : 1.2)
                      ).toFixed(2)} kg
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card variant="highlight">
              <h3 className="text-lg font-bold text-[#1B5E20] mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>- Walk or cycle for short distances</li>
                <li>- Use public transport when possible</li>
                <li>- Reduce meat consumption</li>
                <li>- Minimize energy usage at home</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
