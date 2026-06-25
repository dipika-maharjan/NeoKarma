'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { logDailyCarbon } from '@/lib/actions/calculatorActions';
import { getEmissionFactors } from '@/lib/api/emissionFactors';
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
  Zap,
  Flame
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/context/ToastContext';

const CalculatorPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('Calculator');
  const locale = useLocale();
  const formatNumber = useNumberFormatter();
  const { showNotification } = useNotifications();
    const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submissionMirror, setSubmissionMirror] = useState(null);
  const [submissionStreak, setSubmissionStreak] = useState(null);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const statusRef = useRef(null);
  const [emissionFactors, setEmissionFactors] = useState(null);

  useEffect(() => {
    if (status.message || errors.submit) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status.message, errors.submit]);
  const [factorsError, setFactorsError] = useState(null);
  const [loadingFactors, setLoadingFactors] = useState(true);

  const [formData, setFormData] = useState({
    transportationMode: 'walk',
    transportationDistanceKm: 12,
    foodMealType: 'vegetarian',
    plasticCount: 0,
    wastedFood: false,
    energyUsageHours: 3,
    energyFirewoodKg: 0,
    extraProfileAnswer: null
  });

  // Persist draft to sessionStorage so toggling locale (which may re-render server components)
  // does not lose the user's in-progress inputs.
  useEffect(() => {
    try {
      const key = 'calculatorFormDraft';
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const key = 'calculatorFormDraft';
      sessionStorage.setItem(key, JSON.stringify(formData));
    } catch (e) {
      // ignore
    }
  }, [formData]);

  const transportationOptions = [
    { value: 'walk', label: t('walk'), icon: <Footprints size={21} strokeWidth={2.5} /> },
    { value: 'bicycle', label: t('bicycle'), icon: <Bike size={21} strokeWidth={2.5} /> },
    { value: 'bus', label: t('bus'), icon: <Bus size={21} strokeWidth={2.5} /> },
    { value: 'motorbike', label: t('motorbike'), icon: <Bike size={21} strokeWidth={2.5} /> },
    { value: 'car', label: t('car'), icon: <Car size={21} strokeWidth={2.5} /> }
  ];

  const foodOptionsBase = [
    { value: 'vegan', label: t('vegan'), factorKey: 'food_vegan' },
    { value: 'vegetarian', label: t('vegetarian'), factorKey: 'food_vegetarian' },
    { value: 'mixed', label: t('mixed'), factorKey: 'food_mixed' },
    { value: 'non-vegetarian', label: t('nonVeg'), factorKey: 'food_non-vegetarian' }
  ];

  const foodOptions = foodOptionsBase.map((option) => {
    const factor = emissionFactors?.[option.factorKey];
    return {
      ...option,
      estimate: loadingFactors
        ? t('loading')
        : factor != null
          ? t('kgCO2', { value: formatNumber(factor, { maximumFractionDigits: 1 }) })
          : ''
    };
  });

  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '', submit: '' }));
  };

  useEffect(() => {
    let mounted = true;

    const loadFactors = async () => {
      try {
        const map = await getEmissionFactors();
        if (mounted) {
          setEmissionFactors(map);
        }
      } catch (err) {
        if (mounted) {
          setFactorsError(t('unableToLoadFactors'));
        }
      } finally {
        if (mounted) {
          setLoadingFactors(false);
        }
      }
    };

    loadFactors();
    return () => {
      mounted = false;
    };
  }, [t]);

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
      newErrors.transportationDistanceKm = t('distancePositive');
    }
    if (formData.energyUsageHours < 0) {
      newErrors.energyUsageHours = t('hoursPositive');
    }
    if (formData.wastedFood === null) {
      newErrors.wastedFood = t('selectOption');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent rapid resubmission (within 2 seconds of last successful submission)
    const now = Date.now();
    if (now - lastSubmissionTime < 2000) {
      return;
    }
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        transportationMode: formData.transportationMode,
        transportationDistanceKm: formData.transportationDistanceKm,
        foodMealType: formData.foodMealType,
        wasteAndPlasticCount: formData.plasticCount,
        energyUsageHours: formData.energyUsageHours,
        energyFirewoodKg: formData.energyFirewoodKg,
        ...(formData.extraProfileAnswer !== null && { extraAnswer: formData.extraProfileAnswer })
      };

      const response = await logDailyCarbon(payload, locale);
      // clear draft on successful submit
      try { sessionStorage.removeItem('calculatorFormDraft'); } catch (e) {}

      if (!response) {
        // offline saved fallback
        setStatus({ type: 'success', message: 'Saved locally — will sync when online.' });
        return;
      }

      const message = response.message || '';
      // set banner type: duplicate -> neutral/info, new -> success
      const isDuplicate = message.toLowerCase().includes('already exists');
      setStatus({ type: isDuplicate ? 'info' : 'success', message });

      // Trigger notification
      if (isDuplicate) {
          showToast('You already logged today. Come back tomorrow!', { type: 'info', duration: 3000 });
        showNotification({
          id: `log-duplicate-${new Date().toISOString()}`,
          type: 'info',
          title: 'Already logged today',
          message: 'You have already logged your carbon footprint today. Logs reset daily.',
          createdAt: new Date().toISOString(),
          unread: true
        });
      } else {
          showToast('Log saved! Great job!', { type: 'success', duration: 3000 });
        showNotification({
          id: `log-saved-${new Date().toISOString()}`,
          type: 'success',
          title: 'Daily log saved',
          message: 'Great job! Your latest log is now part of your progress tracking.',
          actionLabel: 'See result',
          actionHref: '/calculator/result',
          createdAt: new Date().toISOString(),
          unread: true
        });
        // Update last submission time on successful new log
        setLastSubmissionTime(Date.now());
      }

      // update in-place mirror and streak from response data (avoid re-fetch)
      if (response.data && response.data.mirror) {
        setSubmissionMirror(response.data.mirror);
      } else if (response.data && response.data.log && response.data.log.mirror) {
        setSubmissionMirror(response.data.log.mirror);
      }
      if (response.data && response.data.updatedStreak) {
        setSubmissionStreak(response.data.updatedStreak);
      }
    } catch (error) {
      console.error('Error logging carbon:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || t('submitFailed')
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
          aria-label={t('decrease', { label })}
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
          aria-label={t('increase', { label })}
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
              {option ? t('yes') : t('no')}
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
          <p className="text-center text-gray-600">{t('pleaseLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16 xl:py-9">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-[32px] font-extrabold leading-tight text-[#0A3D25] md:text-[34px]">
              {t('title')}
            </h1>
            <p className="mt-1 text-[16px] text-[#4A5550]">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/calculator/result" className="block w-full md:w-auto">
            <Button
              variant="primary"
              className="h-12 px-8 rounded-full bg-[#0A3D25] text-[15px] font-bold text-white hover:bg-[#072B1A] transition-colors shadow-none w-full md:w-auto flex items-center justify-center"
            >
              {t('logToday')}
            </Button>
          </Link>
        </div>

        {status.message && (
          <div
            ref={statusRef}
            className={`mb-5 rounded-lg border px-4 py-3 text-[13px] font-semibold ${
              status.type === 'success'
                ? 'border-[#BEE8D3] bg-[#E8F5E9] text-[#0A3D25]'
                : 'border-[#D1ECF1] bg-[#E9F7FC] text-[#0C5460]'
            }`}
          >
            {status.message}
          </div>
        )}

        {submissionMirror && (
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#E0E5E2] bg-white p-4">
              <p className="text-sm font-bold text-[#17202A]">{t('carbonMirror')}</p>
              <p className="mt-2 text-[15px] text-[#4A5550]">{submissionMirror.story || ''}</p>
            </div>
            <div className="rounded-xl border border-[#E0E5E2] bg-white p-4">
              <p className="text-sm font-bold text-[#17202A]">{t('treesEquivalent')}</p>
              <p className="mt-2 text-[20px] font-extrabold text-[#0A3D25]">{submissionMirror.treesEquivalent ?? submissionMirror.treesEquivalent === 0 ? submissionMirror.treesEquivalent : '--'}</p>
            </div>
          </div>
        )}

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
                <Bus size={22} className="text-[#0A3D25]" />
                <h2 className="text-[24px] font-extrabold leading-none">{t('transportTitle')}</h2>
              </div>
              <p className="mb-[18px] text-[16px] text-[#4A5550]">{t('transportQuestion')}</p>
              <div className="mb-6 grid grid-cols-3 gap-2 md:grid-cols-5">
                {transportationOptions.map(option => {
                  const selected = formData.transportationMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setField('transportationMode', option.value)}
                      className={`flex min-h-[75px] min-w-0 flex-col items-center justify-center rounded-[10px] border px-2 text-[12px] font-semibold transition-all ${
                        selected
                          ? 'border-[#0A3D25] bg-[#C7EEDC] text-[#0A3D25]'
                          : 'border-[#BFCBC5] bg-white text-[#17202A] hover:border-[#0A3D25]'
                      }`}
                    >
                      <span className="mb-1 flex h-6 items-center justify-center text-[#0A3D25]">{option.icon}</span>
                      <span className="break-words text-center">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              <Stepper
                label={t('distance')}
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
                <ForkKnife size={22} className="text-[#0A3D25]" />
                <h2 className="text-[24px] font-extrabold leading-none">{t('lunchTitle')}</h2>
              </div>
              <p className="mb-[18px] text-[16px] text-[#4A5550]">{t('lunchQuestion')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {foodOptions.map(option => {
                  const selected = formData.foodMealType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setField('foodMealType', option.value)}
                      className={`flex items-center justify-center h-12 rounded-lg border text-center transition-all ${
                        selected
                          ? 'border-[#0A3D25] bg-[#C7EEDC] text-[#0A3D25] font-semibold'
                          : 'border-[#BFCBC5] bg-white text-[#17202A] hover:border-[#0A3D25]'
                      }`}
                    >
                      <span className="text-[15px] font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="hidden lg:block pt-8 text-center lg:pt-7">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                disabled={submitting}
                className="mx-auto h-12 w-full max-w-[320px] rounded-full bg-[#0A3D25] text-[15px] font-bold text-white hover:bg-[#072B1A] transition-colors"
              >
                {t('calculateEmission')}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-6">
              <div className="mb-7 flex items-center gap-2 text-[#17202A]">
                <Trash2 size={21} className="text-[#0A3D25]" />
                <h2 className="text-[24px] font-extrabold leading-none">{t('wasteTitle')}</h2>
              </div>
              <div className="space-y-[26px]">
                <div>
                  <p className="mb-[18px] text-[16px] text-[#4A5550]">{t('plasticQuestion')}</p>
                  <p className="mb-3 text-[13px] text-[#4A5550]">{t('plasticHelper')}</p>
                  <Stepper
                    label=""
                    value={formData.plasticCount}
                    field="plasticCount"
                    unit="items"
                    max={100}
                    step={1}
                  />
                </div>
                <YesNo
                  label={t('foodWasteQuestion')}
                  value={formData.wastedFood}
                  onChange={(value) => setField('wastedFood', value)}
                  error={errors.wastedFood}
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-6">
              <div className="mb-7 flex items-center gap-2 text-[#17202A]">
                <Zap size={23} className="text-[#0A3D25]" />
                <h2 className="text-[24px] font-extrabold leading-none">{t('energyTitle')}</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="mb-[18px] text-[16px] text-[#4A5550]">
                    {t('electricityQuestion')}
                  </p>
                  <Stepper
                    label=""
                    value={formData.energyUsageHours}
                    field="energyUsageHours"
                    unit={t('hours')}
                    max={24}
                    step={1}
                  />
                  {errors.energyUsageHours && (
                    <p className="mt-2 text-sm text-red-600">{errors.energyUsageHours}</p>
                  )}
                </div>

                <div className="border-t border-[#E0E5E2] pt-6">
                  <p className="mb-[18px] text-[16px] text-[#4A5550]">
                    {t('firewoodQuestion')}
                  </p>
                  <Stepper
                    label=""
                    value={formData.energyFirewoodKg}
                    field="energyFirewoodKg"
                    unit="kg"
                    max={20}
                    step={0.5}
                  />
                  <p className="mt-2 text-[13px] text-[#4A5550]">
                    {t('leaveZero')}
                  </p>
                </div>
              </div>
            </section>

            {/* Button below Energy section on mobile, before Streak */}
            <div className="pt-6 text-center lg:hidden">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                disabled={submitting}
                className="mx-auto h-12 w-full max-w-[320px] rounded-full bg-[#0A3D25] text-[15px] font-bold text-white hover:bg-[#072B1A] transition-colors"
              >
                {t('calculateEmission')}
              </Button>
            </div>

            <section className="relative overflow-hidden rounded-xl bg-[#E8F5E9] border border-[#BEE8D3] p-6 text-[#1B5E20]">
              <div className="absolute -bottom-10 -right-10 h-28 w-28 opacity-10 rounded-full bg-[#1B5E20]" />
              <div className="flex items-center gap-3">
                <Flame size={20} className="text-[#1B5E20]" />
                <div>
                  <p className="text-[16px] font-extrabold text-[#1B5E20]">
                    {t('streakTitle')}
                  </p>
                  <p className="text-[13px] text-[#1B5E20]/80 mt-1">
                    {t('streakSubtitle')}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalculatorPage;
