'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { logDailyCarbon } from '@/lib/actions/calculatorActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Bike,
  Bus,
  Car,
  Footprints,
  ForkKnife,
  Minus,
  Plus,
  Trash2,
  Zap
} from 'lucide-react';

const CalculatorPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    transportationMode: 'walk',
    transportationDistanceKm: 12,
    foodMealType: 'vegetarian',
    usedSingleUsePlastic: false,
    wastedFood: false,
    energyUsageHours: 3,
    extraProfileAnswer: null
  });

  const transportationOptions = [
    { value: 'walk', label: 'Walk', icon: <Footprints size={21} strokeWidth={2.5} /> },
    { value: 'bicycle', label: 'Bicycle', icon: <Bike size={21} strokeWidth={2.5} /> },
    { value: 'bus', label: 'Bus', icon: <Bus size={21} strokeWidth={2.5} /> },
    { value: 'motorbike', label: 'Motorbike', icon: <Bike size={21} strokeWidth={2.5} /> },
    { value: 'car', label: 'Car', icon: <Car size={21} strokeWidth={2.5} /> }
  ];

  const foodOptions = [
    { value: 'vegetarian', label: 'Vegetarian', estimate: '0.9 kg CO2' },
    { value: 'mixed', label: 'Mixed', estimate: '1.5 kg CO2' },
    { value: 'non-vegetarian', label: 'Non-Veg', estimate: '2.5 kg CO2' }
  ];

  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', submit: '' }));
  };

  const changeNumber = (field, amount, min, max) => {
    setFormData(prev => {
      const nextValue = Math.min(max, Math.max(min, Number(prev[field]) + amount));
      return { ...prev, [field]: nextValue };
    });
    setErrors(prev => ({ ...prev, [field]: '', submit: '' }));
  };

  const handleNumberInput = (field, value, min, max) => {
    const parsed = value === '' ? 0 : Number(value);
    if (!Number.isNaN(parsed)) {
      setField(field, Math.min(max, Math.max(min, parsed)));
    }
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

  const Stepper = ({ label, value, field, unit, max, step = 1 }) => (
    <div>
      <label className="block text-[14px] font-bold tracking-wide text-[#17202A] mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeNumber(field, -step, 0, max)}
          disabled={value <= 0}
          className="h-10 w-10 rounded-lg border border-[#BFCBC5] bg-[#EEF3FE] text-[#1B2733] disabled:text-gray-300 disabled:bg-white flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={15} />
        </button>
        <input
          type="number"
          value={value}
          min={0}
          max={max}
          step={step}
          onChange={(event) => handleNumberInput(field, event.target.value, 0, max)}
          className="h-10 w-20 rounded-lg border border-[#BFCBC5] bg-white text-center text-[15px] font-medium text-[#111827] outline-none focus:border-[#004332]"
        />
        <button
          type="button"
          onClick={() => changeNumber(field, step, 0, max)}
          disabled={value >= max}
          className="h-10 w-10 rounded-lg border border-[#BFCBC5] bg-[#EEF3FE] text-[#1B2733] disabled:text-gray-300 disabled:bg-white flex items-center justify-center"
          aria-label={`Increase ${label}`}
        >
          <Plus size={15} />
        </button>
        {unit && <span className="ml-3 text-[16px] text-[#4A5550]">{unit}</span>}
      </div>
    </div>
  );

  const YesNo = ({ label, value, onChange, error }) => (
    <div>
      <p className="mb-2.5 text-[15px] font-bold text-[#17202A]">{label}</p>
      <div className="grid grid-cols-2 rounded-xl border border-[#BFCBC5] bg-[#EEF3FE] p-1">
        {[true, false].map(option => {
          const selected = value === option;
          return (
            <button
              key={String(option)}
              type="button"
              onClick={() => onChange(option)}
              className={`h-8 rounded-lg text-[14px] font-semibold transition-all ${
                selected
                  ? 'bg-white text-[#004332] shadow-sm'
                  : 'text-[#17202A] hover:text-[#004332]'
              }`}
            >
              {option ? 'Yes' : 'No'}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFA]">
        <div className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-sm">
          <p className="text-center text-gray-600">Please log in to access the calculator</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16 xl:py-9">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-8 grid grid-cols-1 items-center gap-5 lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_560px]">
          <div>
            <h1 className="text-[32px] font-extrabold leading-tight text-[#053D2F] md:text-[34px]">
              Log Today&apos;s Carbon
            </h1>
            <p className="mt-1 text-[16px] text-[#4A5550]">
              Fill in the details below to understand your environmental footprint. All fields are optional.
            </p>
          </div>
          <Link href="/calculator/result" className="block">
            <Button
              variant="primary"
              className="h-[50px] w-full rounded-full bg-[#004332] text-[19px] font-bold hover:bg-[#003729]"
            >
              Today&apos;s Carbon Footprint
            </Button>
          </Link>
        </div>

        {errors.submit && (
          <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.42fr_1fr] xl:grid-cols-[1.48fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-6">
              <div className="mb-7 flex items-center gap-2 text-[#17202A]">
                <Bus size={22} className="text-[#004332]" />
                <h2 className="text-[24px] font-extrabold leading-none">1. Transport</h2>
              </div>
              <p className="mb-[18px] text-[16px] text-[#4A5550]">How did you travel to school today?</p>
              <div className="mb-6 grid grid-cols-5 gap-2">
                {transportationOptions.map(option => {
                  const selected = formData.transportationMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setField('transportationMode', option.value)}
                      className={`flex h-[75px] min-w-0 flex-col items-center justify-center rounded-[10px] border text-[12px] font-semibold transition-all ${
                        selected
                          ? 'border-[#00724E] bg-[#C7EEDC] text-[#004332]'
                          : 'border-[#BFCBC5] bg-white text-[#17202A] hover:border-[#00724E]'
                      }`}
                    >
                      <span className="mb-1 flex h-6 items-center justify-center text-[#004332]">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
              <Stepper
                label="Distance (km)"
                value={formData.transportationDistanceKm}
                field="transportationDistanceKm"
                max={200}
                step={1}
              />
              {errors.transportationDistanceKm && (
                <p className="mt-2 text-sm text-red-600">{errors.transportationDistanceKm}</p>
              )}
            </section>

            <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-6">
              <div className="mb-7 flex items-center gap-2 text-[#17202A]">
                <ForkKnife size={22} className="text-[#004332]" />
                <h2 className="text-[24px] font-extrabold leading-none">2. Lunch</h2>
              </div>
              <p className="mb-[18px] text-[16px] text-[#4A5550]">What did you have for lunch?</p>
              <div className="grid grid-cols-3 gap-4">
                {foodOptions.map(option => {
                  const selected = formData.foodMealType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setField('foodMealType', option.value)}
                      className={`h-[74px] rounded-[10px] border text-center transition-all ${
                        selected
                          ? 'border-[#00724E] bg-[#C7EEDC] text-[#004332]'
                          : 'border-[#BFCBC5] bg-white text-[#17202A] hover:border-[#00724E]'
                      }`}
                    >
                      <span className="block text-[16px] font-medium">{option.label}</span>
                      <span className="mt-1 block text-[12px] text-[#4A5550]">{option.estimate}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="pt-8 text-center lg:pt-7">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                disabled={submitting}
                className="mx-auto h-[50px] w-full max-w-[450px] rounded-full bg-[#004332] text-[19px] font-bold hover:bg-[#003729]"
              >
                Calculate my emission →
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-6">
              <div className="mb-7 flex items-center gap-2 text-[#17202A]">
                <Trash2 size={21} className="text-[#004332]" />
                <h2 className="text-[24px] font-extrabold leading-none">3. Waste &amp; Plastic</h2>
              </div>
              <div className="space-y-[26px]">
                <YesNo
                  label="Did you use single-use plastic today?"
                  value={formData.usedSingleUsePlastic}
                  onChange={(value) => setField('usedSingleUsePlastic', value)}
                  error={errors.usedSingleUsePlastic}
                />
                <YesNo
                  label="Did you waste food today?"
                  value={formData.wastedFood}
                  onChange={(value) => setField('wastedFood', value)}
                  error={errors.wastedFood}
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-6">
              <div className="mb-7 flex items-center gap-2 text-[#17202A]">
                <Zap size={23} className="text-[#004332]" />
                <h2 className="text-[24px] font-extrabold leading-none">4. Energy</h2>
              </div>
              <p className="mb-[18px] text-[16px] text-[#4A5550]">
                Approx. hours of electricity use (at school + home)
              </p>
              <Stepper
                label=""
                value={formData.energyUsageHours}
                field="energyUsageHours"
                unit="Hours"
                max={24}
                step={1}
              />
              {errors.energyUsageHours && (
                <p className="mt-2 text-sm text-red-600">{errors.energyUsageHours}</p>
              )}
            </section>

            <section className="relative min-h-[252px] overflow-hidden rounded-xl bg-[#E2F7F3] p-5 md:p-6">
              <div className="absolute bottom-0 right-0 h-28 w-32 opacity-25">
                <div className="absolute bottom-0 right-0 h-24 w-24 rotate-12 border-[12px] border-[#4E666B]" />
                <div className="absolute bottom-3 right-16 h-20 w-20 rotate-12 border-[10px] border-[#4E666B]" />
              </div>
              <p className="absolute left-6 top-[88px] max-w-[210px] text-[20px] font-extrabold leading-[1.25] text-[#004332]">
                Keep logging to maintain your streak!
              </p>
              <span className="absolute left-6 top-[166px] text-xl">🔥</span>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalculatorPage;
