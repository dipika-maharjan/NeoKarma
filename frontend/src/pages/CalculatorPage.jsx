'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Card, Button, ToggleButtonGroup, SegmentedYesNo, NumericStepper 
} from '@/components/ui';
import { logDailyCarbon, getTodayLog } from '@/lib/actions/calculatorActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Zap, Leaf, Droplets, UtensilsCrossed, Bike, Wind, AlertCircle, Trees 
} from 'lucide-react';

const CalculatorPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [todayLog, setTodayLog] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    transportationMode: 'bus',
    transportationDistanceKm: 0,
    foodMealType: 'vegetarian',
    usedSingleUsePlastic: null,
    wastedFood: null,
    energyUsageHours: 0,
    extraProfileAnswer: null
  });

  // Transportation options with icons
  const transportationOptions = [
    { value: 'walk', label: 'Walk', icon: <Leaf size={24} /> },
    { value: 'bicycle', label: 'Bicycle', icon: <Bike size={24} /> },
    { value: 'bus', label: 'Bus', icon: <Wind size={24} /> },
    { value: 'motorbike', label: 'Motorbike', icon: <Bike size={24} /> },
    { value: 'car', label: 'Car', icon: <Zap size={24} /> }
  ];

  // Food options
  const foodOptions = [
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'non-vegetarian', label: 'Non-veg' }
  ];

  // Check if today's log already exists
  useEffect(() => {
    const checkTodayLog = async () => {
      if (isAuthenticated) {
        try {
          const log = await getTodayLog();
          if (log) {
            setTodayLog(log);
          }
        } catch (err) {
          console.error('Error checking today log:', err);
        }
      }
    };
    checkTodayLog();
  }, [isAuthenticated]);

  const handleTransportChange = (mode) => {
    setFormData(prev => ({ ...prev, transportationMode: mode }));
    setErrors(prev => ({ ...prev, transportationMode: '' }));
  };

  const handleFoodChange = (type) => {
    setFormData(prev => ({ ...prev, foodMealType: type }));
    setErrors(prev => ({ ...prev, foodMealType: '' }));
  };

  const handleDistanceChange = (value) => {
    setFormData(prev => ({ ...prev, transportationDistanceKm: value }));
    setErrors(prev => ({ ...prev, transportationDistanceKm: '' }));
  };

  const handleEnergyChange = (value) => {
    setFormData(prev => ({ ...prev, energyUsageHours: value }));
    setErrors(prev => ({ ...prev, energyUsageHours: '' }));
  };

  const handlePlasticChange = (value) => {
    setFormData(prev => ({ ...prev, usedSingleUsePlastic: value }));
    setErrors(prev => ({ ...prev, usedSingleUsePlastic: '' }));
  };

  const handleFoodWasteChange = (value) => {
    setFormData(prev => ({ ...prev, wastedFood: value }));
    setErrors(prev => ({ ...prev, wastedFood: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.transportationDistanceKm < 0) {
      newErrors.transportationDistanceKm = 'Distance must be positive';
    }
    if (formData.energyUsageHours < 0) {
      newErrors.energyUsageHours = 'Hours must be positive';
    }
    if (formData.usedSingleUsePlastic === null) {
      newErrors.usedSingleUsePlastic = 'Please select an option';
    }
    if (formData.wastedFood === null) {
      newErrors.wastedFood = 'Please select an option';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Convert yes/no responses to waste count
      const wasteCount = (formData.usedSingleUsePlastic ? 1 : 0) + (formData.wastedFood ? 1 : 0);
      
      const payload = {
        transportationMode: formData.transportationMode,
        transportationDistanceKm: formData.transportationDistanceKm,
        foodMealType: formData.foodMealType,
        wasteAndPlasticCount: wasteCount,
        energyUsageHours: formData.energyUsageHours,
        ...(formData.extraProfileAnswer !== null && { extraAnswer: formData.extraProfileAnswer })
      };

      await logDailyCarbon(payload);
      // Navigate to result page
      router.push('/calculator/result');
    } catch (error) {
      console.error('Error logging carbon:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Failed to submit. Please try again.' 
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Card>
          <p className="text-center text-gray-600">Please log in to access the calculator</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Log Today's Carbon
            </h1>
            <p className="text-gray-600">Track your daily activities and emissions</p>
          </div>
          {todayLog && (
            <Link href="/calculator/result">
              <Button variant="secondary">
                Today's Carbon Footprint →
              </Button>
            </Link>
          )}
        </div>

        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Transport Card */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Bike className="text-[#1B5E20]" size={24} />
                <h2 className="text-xl font-bold text-gray-900">1. Transport</h2>
              </div>

              <div className="space-y-6">
                <ToggleButtonGroup
                  options={transportationOptions}
                  selected={formData.transportationMode}
                  onChange={handleTransportChange}
                  label="Choose your transport mode"
                  fullWidth={true}
                  size="md"
                />

                <NumericStepper
                  value={formData.transportationDistanceKm}
                  onChange={handleDistanceChange}
                  label="Distance traveled"
                  unit="km"
                  min={0}
                  max={200}
                  step={0.5}
                  decimals={1}
                />
                {errors.transportationDistanceKm && (
                  <p className="text-red-600 text-sm">{errors.transportationDistanceKm}</p>
                )}
              </div>
            </Card>

            {/* 2. Food Card */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="text-[#1B5E20]" size={24} />
                <h2 className="text-xl font-bold text-gray-900">2. Food</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    What did you eat?
                  </label>
                  <div className="flex gap-2">
                    {foodOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleFoodChange(opt.value)}
                        className={`
                          flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm 
                          transition-all duration-200 border-2
                          ${formData.foodMealType === opt.value
                            ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#1B5E20]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Waste & Plastic Card */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="text-[#1B5E20]" size={24} />
                <h2 className="text-xl font-bold text-gray-900">3. Waste</h2>
              </div>

              <div className="space-y-4">
                <SegmentedYesNo
                  value={formData.usedSingleUsePlastic}
                  onChange={handlePlasticChange}
                  label="Did you use single-use plastic today?"
                  size="md"
                />
                {errors.usedSingleUsePlastic && (
                  <p className="text-red-600 text-sm">{errors.usedSingleUsePlastic}</p>
                )}

                <SegmentedYesNo
                  value={formData.wastedFood}
                  onChange={handleFoodWasteChange}
                  label="Did you waste food today?"
                  size="md"
                />
                {errors.wastedFood && (
                  <p className="text-red-600 text-sm">{errors.wastedFood}</p>
                )}
              </div>
            </Card>

            {/* 4. Energy Card */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-[#1B5E20]" size={24} />
                <h2 className="text-xl font-bold text-gray-900">4. Energy</h2>
              </div>

              <NumericStepper
                value={formData.energyUsageHours}
                onChange={handleEnergyChange}
                label="Electricity & appliance use"
                unit="hours"
                min={0}
                max={24}
                step={0.5}
                decimals={1}
              />
              {errors.energyUsageHours && (
                <p className="text-red-600 text-sm mt-2">{errors.energyUsageHours}</p>
              )}
            </Card>
          </div>

          {/* Motivational Panel */}
          <Card className="bg-gradient-to-br from-[#E8F5E9] to-[#F1F4F2] border-[#C8E6C9]">
            <div className="flex items-center gap-4">
              <Trees className="text-[#1B5E20] flex-shrink-0" size={32} />
              <div>
                <p className="text-lg font-semibold text-[#1B5E20] mb-1">
                  Keep logging to maintain your streak!
                </p>
                <p className="text-sm text-gray-700">
                  Every day you log adds to your environmental impact tracking journey.
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            disabled={submitting}
            className="w-full rounded-full h-12 text-lg"
          >
            Calculate my emission →
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CalculatorPage;
