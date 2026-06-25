import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/context/ToastContext';
import { useRecommendationProgress } from '@/hooks/useRecommendationProgress';
import { useApi } from '@/hooks/useApi';
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Bus,
  Check,
  Hourglass,
  Leaf,
  Lightbulb,
  Monitor,
  Plus,
  Recycle,
  RotateCcw,
  Sprout,
  Trash2,
  Trophy,
  Utensils,
  Zap,
} from 'lucide-react';
import ProgressTrackerWrapper from './ProgressTrackerWrapper';

// Unified recommendations list matching the Smart Recommendations view
const PRESETS = [
  {
    id: 'bus',
    category: 'transport',
    badge: 'HIGH IMPACT',
    badgeColor: 'bg-red-50 text-red-500 border border-red-100',
    title: 'Use School Buses More Efficiently',
    description: 'Optimizing bus routes and fuller occupancy can reduce fuel use by 20-30% across the school community.',
    reduction: '-450 kg CO2',
    reductionUnit: '/month',
    visualType: 'bus',
    personalSaving: 42.0,
    actionDesc: 'Switching to school buses twice a week reduces individual car usage significantly.',
    trackingConfig: {
      field: 'transportation.mode',
      value: 'bus',
      defaultWeight: 42,
      goal: 5,
      period: 'week',
      operator: '=='
    }
  },
  {
    id: 'food',
    category: 'food',
    badge: 'MEDIUM IMPACT',
    badgeColor: 'bg-green-50 text-green-600 border border-green-100',
    title: 'Try Vegetarian Days',
    description: '1-2 vegetarian days per week in the canteen can cut food emissions by up to 40%.',
    reduction: '-280 kg CO2',
    reductionUnit: '/month',
    visualType: 'fork-knife',
    personalSaving: 20.0,
    actionDesc: 'Try a vegetarian meal once or twice a week during canteen school lunches.',
    trackingConfig: {
      field: 'food.mealType',
      value: 'vegetarian',
      goal: 2,
      period: 'week',
      operator: '=='
    }
  },
  {
    id: 'waste',
    category: 'waste',
    badge: 'MEDIUM IMPACT',
    badgeColor: 'bg-[#E2F0D9] text-[#0A3D25] border border-[#C5E0B4]',
    title: 'Improve Waste Sorting',
    description: 'Reducing contamination in recycling bins saves energy and reduces landfill waste significantly.',
    reduction: '-190 kg CO2',
    reductionUnit: '/mo',
    visualType: 'bin',
    personalSaving: 19.0,
    actionDesc: 'Reducing contamination in recycling bins saves energy and reduces landfill waste significantly.',
    trackingConfig: {
      field: 'wasteAndPlastic.segregated',
      value: true,
      goal: 7,
      period: 'week',
      operator: '=='
    }
  },
  {
    id: 'energy',
    category: 'energy',
    badge: 'EASY WIN',
    badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
    title: 'Switch Off Lights & Fans',
    description: 'Turn off when not in use. A small habit that leads to a big impact over a school term.',
    reduction: '-120 kg CO2',
    reductionUnit: '/mo',
    visualType: 'lightbulb',
    personalSaving: 12.0,
    actionDesc: 'Developing the habit of turning off electrical appliances when leaving the room.',
    trackingConfig: {
      field: 'energy.usageHours',
      value: 2,
      goal: 5,
      period: 'week',
      operator: '<='
    }
  },
  {
    id: 'lunch',
    category: 'food',
    badge: 'MEDIUM IMPACT',
    badgeColor: 'bg-green-50 text-green-600 border border-green-100',
    title: 'Zero Waste Lunch Friday',
    description: 'Commit to using zero single-use plastics and zero food waste every Friday.',
    reduction: '-185 kg CO2',
    reductionUnit: '/mo',
    visualType: 'fork-knife',
    personalSaving: 18.5,
    actionDesc: 'Commit to using zero single-use plastics and zero food waste every Friday.',
    trackingConfig: {
      field: 'food.foodWasteGrams',
      value: 20,
      goal: 1,
      period: 'week',
      operator: '<'
    }
  },
  {
    id: 'walk-cycle',
    category: 'transport',
    badge: 'HIGH IMPACT',
    badgeColor: 'bg-red-50 text-red-500 border border-red-100',
    title: 'Walk or Cycle for Short Trips',
    description: 'Active commute for distances under 2km significantly reduces carbon emissions and improves health.',
    reduction: '-350 kg CO2',
    reductionUnit: '/month',
    visualType: 'bus',
    personalSaving: 35.0,
    actionDesc: 'Walk or cycle for trips within 2km to reduce fossil fuel dependence.',
    trackingConfig: {
      field: 'transportation.mode',
      value: 'walk',
      goal: 3,
      period: 'week',
      operator: '=='
    }
  },
  {
    id: 'reduce-food-waste',
    category: 'food',
    badge: 'MEDIUM IMPACT',
    badgeColor: 'bg-green-50 text-green-600 border border-green-100',
    title: 'Reduce Food Waste',
    description: 'Minimizing leftover food reduces methane emissions from landfills and saves resources.',
    reduction: '-240 kg CO2',
    reductionUnit: '/month',
    visualType: 'fork-knife',
    personalSaving: 24.0,
    actionDesc: 'Serve appropriate portions and consume meals completely to minimize food waste.',
    trackingConfig: {
      field: 'food.foodWasteGrams',
      value: 40,
      goal: 7,
      period: 'week',
      operator: '<='
    }
  },
  {
    id: 'local-seasonal',
    category: 'food',
    badge: 'EASY WIN',
    badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
    title: 'Choose Local & Seasonal Foods',
    description: 'Local and seasonal produce reduces transportation emissions and supports local farming.',
    reduction: '-170 kg CO2',
    reductionUnit: '/month',
    visualType: 'sprout',
    personalSaving: 17.0,
    actionDesc: 'Prefer locally grown and seasonal produce to reduce food transportation carbon footprint.',
    trackingConfig: {
      field: 'food.foodWasteGrams',
      value: 30,
      goal: 6,
      period: 'week',
      operator: '<'
    }
  },
  {
    id: 'natural-daylight',
    category: 'energy',
    badge: 'MEDIUM IMPACT',
    badgeColor: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
    title: 'Maximize Natural Daylight',
    description: 'Study near windows during the day to utilize Nepal\'s abundant sunshine year-round.',
    reduction: '-160 kg CO2',
    reductionUnit: '/month',
    visualType: 'lightbulb',
    personalSaving: 16.0,
    actionDesc: 'Open curtains and study near windows to reduce artificial lighting requirements.',
    trackingConfig: {
      field: 'energy.usageHours',
      value: 1,
      goal: 5,
      period: 'week',
      operator: '<'
    }
  },
  {
    id: 'natural-ventilation',
    category: 'energy',
    badge: 'EASY WIN',
    badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
    title: 'Use Natural Ventilation',
    description: 'Rely on natural air flow instead of air conditioning for most of the year in Nepal.',
    reduction: '-130 kg CO2',
    reductionUnit: '/month',
    visualType: 'lightbulb',
    personalSaving: 13.0,
    actionDesc: 'Open windows for ventilation instead of using AC for most months of the year.',
    trackingConfig: {
      field: 'energy.usageHours',
      value: 3,
      goal: 4,
      period: 'week',
      operator: '<='
    }
  },
  {
    id: 'reusable-bottles',
    category: 'waste',
    badge: 'EASY WIN',
    badgeColor: 'bg-blue-50 text-blue-500 border border-blue-100',
    title: 'Swap to Reusable Bottles',
    description: 'Using refillable water bottles eliminates single-use plastic waste significantly.',
    reduction: '-104 kg CO2',
    reductionUnit: '/month',
    visualType: 'bin',
    personalSaving: 10.4,
    actionDesc: 'Use a reusable water bottle and fill from taps instead of buying bottled water.',
    trackingConfig: {
      field: 'wasteAndPlastic.plasticItemCount',
      value: 1,
      goal: 7,
      period: 'week',
      operator: '<='
    }
  },
  {
    id: 'reduce-plastics',
    category: 'waste',
    badge: 'MEDIUM IMPACT',
    badgeColor: 'bg-[#E2F0D9] text-[#0A3D25] border border-[#C5E0B4]',
    title: 'Reduce Single-Use Plastics',
    description: 'Eliminating single-use plastics reduces waste and prevents environmental contamination.',
    reduction: '-140 kg CO2',
    reductionUnit: '/month',
    visualType: 'bin',
    personalSaving: 14.0,
    actionDesc: 'Avoid single-use plastic bags, straws, and packaging by using sustainable alternatives.',
    trackingConfig: {
      field: 'wasteAndPlastic.plasticItemCount',
      value: 2,
      goal: 7,
      period: 'week',
      operator: '<'
    }
  }
];

// Initial set of committed actions matching the Figma Action Plan screenshot precisely
const INITIAL_PLAN_ITEMS = [
  {
    id: 'bus',
    category: 'transport',
    title: 'Use School Buses More Efficiently',
    description: 'Switching to school buses twice a week reduces individual car usage significantly.',
    saving: 42.0,
    completed: false,
    icon: '🚌'
  },
  {
    id: 'energy',
    category: 'energy',
    title: 'Switch Off Lights & Fans',
    description: 'Developing the habit of turning off electrical appliances when leaving the room.',
    saving: 12.0,
    completed: true,
    icon: '💡'
  },
  {
    id: 'lunch',
    category: 'food',
    title: 'Zero Waste Lunch Friday',
    description: 'Commit to using zero single-use plastics and zero food waste every Friday.',
    saving: 18.5,
    completed: false,
    icon: '🍽️'
  },
  // Extra hidden completed tasks configured to sum up to exactly 84.2 kg CO2 saved and 5/8 completed status!
  {
    id: 'bottle',
    category: 'waste',
    title: 'Bring Reusable Steel Bottle',
    description: 'Stop using disposable single-use plastic water bottles on campus.',
    saving: 15.0,
    completed: true,
    icon: '🥤'
  },
  {
    id: 'paper',
    category: 'waste',
    title: 'Recycle Classroom Paper',
    description: 'Collect used pages for school-wide recycling projects.',
    saving: 10.2,
    completed: true,
    icon: '📄'
  },
  {
    id: 'led',
    category: 'energy',
    title: 'Classroom LED Bulbs Swap',
    description: 'Collaborate with class monitor to swap old tube lights for eco-LEDs.',
    saving: 32.0,
    completed: true,
    icon: '💡'
  },
  {
    id: 'smartboard',
    category: 'energy',
    title: 'Power Down Smartboards',
    description: 'Turn off the presentation smartboards immediately after teacher exits.',
    saving: 15.0,
    completed: true,
    icon: '🖥️'
  },
  {
    id: 'vegtuesday',
    category: 'food',
    title: 'Eco-Club Vegetarian Tuesday',
    description: 'Switch lunch meal to healthy local vegetarian items every Tuesday.',
    saving: 20.0,
    completed: false,
    icon: '🥦'
  }
];

const renderIcon = (iconStr) => {
  if (!iconStr) return <Sprout className="w-6 h-6" />;
  const s = iconStr.toString();
  if (s.includes('🚌') || s === 'bus') return <Bus className="w-6 h-6" />;
  if (s.includes('🍽') || s === 'fork-knife') return <Utensils className="w-6 h-6" />;
  if (s.includes('🗑') || s === 'bin') return <Recycle className="w-6 h-6" />;
  if (s.includes('💡') || s === 'lightbulb') return <Lightbulb className="w-6 h-6" />;
  if (s.includes('🥤') || s.includes('📄')) return <Leaf className="w-6 h-6" />;
  if (s.includes('🖥')) return <Lightbulb className="w-6 h-6" />;
  if (s.includes('🥦') || s.includes('🌱')) return <Sprout className="w-6 h-6" />;
  return <Sprout className="w-6 h-6" />;
};

const mapBackendRecToCard = (rec, index) => {
  const id = rec._id || rec.id || `backend-rec-${index}`;

  const badge = rec.badge || (
    rec.effortLevel === 'medium' ? 'MEDIUM IMPACT' :
      rec.effortLevel === 'high' ? 'HIGH IMPACT' : 'EASY WIN'
  );

  const badgeColor = rec.badgeColor || (
    rec.effortLevel === 'medium' ? 'bg-green-50 text-green-600 border border-green-100' :
      rec.effortLevel === 'high' ? 'bg-red-50 text-red-500 border border-red-100' :
        'bg-blue-50 text-blue-500 border border-blue-100'
  );

  let category = rec.category || 'general';
  if (category === 'transportation') category = 'transport';

  let visualType = rec.visualType;
  if (!visualType) {
    if (category === 'transport') visualType = 'bus';
    else if (category === 'food') visualType = 'fork-knife';
    else if (category === 'waste') visualType = 'bin';
    else visualType = 'lightbulb';
  }

  const reduction = rec.reduction || `-${(rec.estimatedReductionKg || rec.saving || 0).toFixed(1)} kg CO2`;
  const reductionUnit = rec.reductionUnit || '/month';
  const personalSaving = rec.personalSaving !== undefined ? rec.personalSaving : (rec.estimatedReductionKg || rec.saving || 0);

  return {
    id,
    category,
    badge,
    badgeColor,
    title: rec.text || rec.title,
    description: rec.description,
    reduction,
    reductionUnit,
    visualType,
    personalSaving,
    actionDesc: rec.actionDesc || rec.description,
    trackingConfig: rec.trackingConfig
  };
};

const RecommendationsView = ({ onNavigateToDashboard }) => {
  const { user, updateProfile } = useAuth();
  const t = useTranslations('Plan');
  const { showNotification } = useNotifications();
  const { showToast } = useToast();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' or 'plan'
  const [addedIds, setAddedIds] = useState(new Set());
  const [planItems, setPlanItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'transport', 'energy', 'waste', 'food'
  const [isLoaded, setIsLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load plan active data using useApi SWR hook
  const { data: planData, error: planError, isLoading: isPlanLoading, mutate: mutatePlan, post: triggerGenerate } = useApi(
    user ? '/mitigation-plan' : null
  );

  // Auto-generation fallback logic
  useEffect(() => {
    const autoGenerate = async () => {
      if (planData === null && !isPlanLoading && !generating) {
        setGenerating(true);
        try {
          await triggerGenerate(null, { url: '/mitigation-plan/generate' });
          showToast('🎉 Your personalized plan is ready!', { type: 'success', duration: 4000 });
          showNotification({
            id: `plan-ready-${new Date().toISOString()}`,
            type: 'success',
            title: 'Your personalized plan is ready',
            message: "Based on your 30 days of logging, we've created a custom action plan just for you.",
            actionLabel: 'View plan',
            actionHref: '/recommendations',
            createdAt: new Date().toISOString(),
            unread: true
          });
        } catch (genErr) {
          console.warn('Could not generate plan automatically:', genErr);
        } finally {
          setGenerating(false);
        }
      }
    };
    autoGenerate();
  }, [planData, isPlanLoading, triggerGenerate, showToast, showNotification, generating]);

  // Dynamically compute recommendations list from planData SWR response
  const recommendations = useMemo(() => {
    if (!planData) return PRESETS;

    if (planData.type === 'GENERAL_PLAN') {
      const plan = planData.plan || {};
      const flatRecs = [
        ...(plan.transport || []),
        ...(plan.energy || []),
        ...(plan.diet || []),
        ...(plan.waste || [])
      ];
      return flatRecs.map((rec, index) => mapBackendRecToCard(rec, index));
    } else if (planData.type === 'WEEKLY_PLAN' || planData.type === 'MONTHLY_PLAN') {
      const recs = planData.plan?.recommendations || [];
      return recs.map((rec, index) => mapBackendRecToCard(rec, index));
    } else {
      const recs = planData.recommendations || [];
      if (recs.length > 0) {
        return recs.map((rec, index) => mapBackendRecToCard(rec, index));
      }
      return PRESETS;
    }
  }, [planData]);

  const planType = planData?.type || null;
  const logsCount = planData?.logsCount || 0;
  const dailyLogs = planData?.dailyLogs || [];
  const motivationalMessage = planData?.message || '';
  const topContributors = planData?.plan?.topContributors || [];

  const loading = isPlanLoading || generating;
  const error = planError?.message;

  // Load planItems from localStorage or backend unique to the logged-in user
  useEffect(() => {
    if (!user) return;
    
    if (user.selectedPlanItems && Array.isArray(user.selectedPlanItems)) {
      setPlanItems(user.selectedPlanItems);
    } else {
      const storageKey = `neokarma_plan_items_${user._id || user.id || 'default'}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setPlanItems(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored plan items:', e);
          setPlanItems([]);
        }
      } else {
        setPlanItems([]);
      }
    }
    setIsLoaded(true);
  }, [user]);

  // Save planItems from localStorage unique to the logged-in user
  useEffect(() => {
    if (!user || !isLoaded) return;
    const storageKey = `neokarma_plan_items_${user._id || user.id || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(planItems));
  }, [planItems, user, isLoaded]);

  // Synchronize addedIds with planItems
  useEffect(() => {
    setAddedIds(new Set(planItems.map(item => item.id)));
  }, [planItems]);

  // Add recommendation to Plan list dynamically
  const addToPlan = (rec) => {
    if (planItems.some(item => item.id === rec.id || item.title === rec.title)) {
      return;
    }

    const newItem = {
      id: rec.id,
      category: rec.category,
      title: rec.title,
      description: rec.actionDesc || rec.description,
      saving: rec.personalSaving || 15.0,
      completed: false,
      icon: rec.visualType === 'bus' ? '🚌' : rec.visualType === 'fork-knife' ? '🍽️' : rec.visualType === 'bin' ? '🗑️' : '💡',
      // CRITICAL: Copy trackingConfig for dynamic progress tracking
      trackingConfig: rec.trackingConfig || undefined,
      addedAt: new Date().toISOString()
    };

    const newPlanItems = [newItem, ...planItems];
    setPlanItems(newPlanItems);
    
    // Save to backend
    if (updateProfile) {
      updateProfile({ selectedPlanItems: newPlanItems }).catch(err => console.error("Failed to sync plan", err));
    }
    // Notify user and show quick toast
    try {
      showNotification({
        id: `plan-item-added-${new Date().toISOString()}`,
        type: 'success',
        title: 'Added to plan',
        message: `"${newItem.title}" has been added to your plan.`,
        actionLabel: 'View plan',
        actionHref: '/plan',
        createdAt: new Date().toISOString(),
        unread: true
      });
    } catch (e) {
      // ignore if notifications context unavailable
    }
    try { showToast('Added to your plan', { type: 'success', duration: 3000 }); } catch (e) { }
  };

  // Toggle completion of a task in the plan
  const toggleTaskCompleted = (id) => {
    const newPlanItems = planItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setPlanItems(newPlanItems);
    
    // Save to backend
    if (updateProfile) {
      updateProfile({ selectedPlanItems: newPlanItems }).catch(err => console.error("Failed to sync plan", err));
    }
  };

  // Archive an item from the plan
  const archivePlanItem = (id) => {
    const newPlanItems = planItems.map((item) =>
      item.id === id ? { ...item, archived: true } : item
    );
    setPlanItems(newPlanItems);
    
    // Save to backend
    if (updateProfile) {
      updateProfile({ selectedPlanItems: newPlanItems }).catch(err => console.error("Failed to sync plan", err));
    }
  };

  // Restore an archived item back to the plan
  const unarchivePlanItem = (id) => {
    const newPlanItems = planItems.map((item) =>
      item.id === id ? { ...item, archived: false } : item
    );
    setPlanItems(newPlanItems);
    
    // Save to backend
    if (updateProfile) {
      updateProfile({ selectedPlanItems: newPlanItems }).catch(err => console.error("Failed to sync plan", err));
    }
  };

  // Calculate Plan metrics (excluding archived items)
  const activeItems = planItems.filter(item => !item.archived);

  // Helper to calculate if an item should be marked as completed based on tracking progress
  const getItemCompletionStatus = (item) => {
    if (!dailyLogs || dailyLogs.length === 0) return item.completed || false;

    // Filter logs that were submitted after the plan item was added
    const itemAddedAt = item.addedAt ? new Date(item.addedAt) : new Date(0);
    const addedDate = new Date(itemAddedAt);
    addedDate.setHours(0, 0, 0, 0);

    const validLogs = dailyLogs.filter(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate >= addedDate;
    });

    if (validLogs.length === 0) return item.completed || false;

    // Calculate progress using the same logic as the tracking hook
    let percentage = 0;

    if (item.trackingConfig) {
      // Dynamic tracking config
      const fieldPath = item.trackingConfig.field;
      const operator = item.trackingConfig.operator;
      const value = item.trackingConfig.value;

      const matchingDays = validLogs.filter((log) => {
        const logValue = getFieldValueForTracking(log, fieldPath);
        if (operator === '==') return logValue === value;
        if (operator === '>=') return logValue >= value;
        if (operator === '<=') return logValue <= value;
        if (operator === 'includes') return Array.isArray(logValue) && logValue.includes(value);
        return false;
      }).length;

      const goal = item.trackingConfig.goal || 20;
      percentage = Math.min((matchingDays / goal) * 100, 100);
    } else if (item.category) {
      // Category-based tracking
      const monthlyGoals = { transport: 20, food: 8, energy: 20, waste: 28 };
      let current = 0;
      const target = monthlyGoals[item.category] || 20;

      if (item.category === 'food') {
        current = validLogs.filter(log =>
          log.food?.mealType === 'vegetarian' || log.food?.mealType === 'vegan'
        ).length;
      } else if (item.category === 'energy') {
        current = validLogs.filter(log => log.energy?.usageHours <= 2).length;
      } else if (item.category === 'transport') {
        current = validLogs.filter(log => {
          const mode = log.transportation?.mode;
          return mode === 'bus' || mode === 'walk' || mode === 'bicycle';
        }).length;
      } else if (item.category === 'waste') {
        current = validLogs.filter(log => log.wasteAndPlastic?.segregated === true).length;
      }

      percentage = Math.min((current / target) * 100, 100);
    }

    // Mark as completed if progress >= 100%
    return percentage >= 100;
  };

  // Helper to get nested field value
  const getFieldValueForTracking = (obj, fieldPath) => {
    if (!obj || !fieldPath) return undefined;
    const parts = fieldPath.split('.');
    let current = obj;
    for (const part of parts) {
      current = current?.[part];
    }
    return current;
  };
  const totalActions = activeItems.length;
  const completedActions = activeItems.filter(item => item.completed);
  const completedCount = completedActions.length;

  // Calculate CO2 saved (sum of completed items)
  const totalCO2Saved = completedActions.reduce((sum, item) => sum + item.saving, 0).toFixed(1);

  // Progress percentage
  const progressPercent = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  // Filtered plan list items
  const filteredPlanItems = planItems.filter((item) => {
    if (activeFilter === 'archived') {
      return item.archived === true;
    }
    if (item.archived) return false; // Hide archived items
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  return (
    <div className="w-full min-h-[calc(100vh-76px)] bg-[#FAFAFA] text-[#1E3322] px-4 py-8 md:px-8 lg:px-12 xl:px-16 font-sans">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* Toggle between Recommendations and Plan */}
        {activeTab === 'recommendations' ? (
          <div>
            {/* Header row with Circular Meter on the left */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full">

                {/* Left Side: Circular Progress Meter or Badge */}
                {logsCount >= 30 ? (
                  /* 30 Days AI Recommendation Enabled Badge */
                  <div className="relative flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 shrink-0 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.35)] border-2 border-white">
                    <div className="w-[88px] h-[88px] rounded-full overflow-hidden border border-amber-300">
                      <img src="/earth_gauge_bg.png" alt="Earth" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-300 animate-spin-slow" />
                    <span className="absolute -bottom-1.5 bg-[#0A3D25] text-white text-[8px] font-extrabold uppercase py-0.5 px-2 rounded-full border border-emerald-500 shadow-sm whitespace-nowrap tracking-wider font-sans">
                      Enabled
                    </span>
                  </div>
                ) : (
                  /* Circular progress bar with Earth image inside */
                  <div className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 shrink-0 bg-stone-50 border border-stone-100 rounded-full">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        className="text-stone-200"
                        strokeWidth="6"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        className="text-[#0A3D25] transition-all duration-500"
                        strokeWidth="6"
                        strokeDasharray="289.03"
                        strokeDashoffset={289.03 - (Math.min(logsCount, 30) / 30) * 289.03}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    {/* Earth Image at center */}
                    <div className="absolute flex items-center justify-center overflow-hidden w-[88px] h-[88px] rounded-full border border-stone-100 shadow-inner">
                      <img src="/earth_gauge_bg.png" alt="Earth Gauge" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Right Side: Header Text & Progress Info */}
                <div className="text-center sm:text-left">
                  <h1 className="text-[24px] md:text-[28px] lg:text-[30px] font-extrabold tracking-tight text-[#0A3D25] leading-tight">
                    {t('smartRecommendations')}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    {t('recommendationsSubtitle')}
                  </p>

                  {/* Status Indicator text under the title */}
                  <p className="text-xs text-[#0A3D25]/85 font-semibold mt-2.5">
                    {logsCount >= 30 ? (
                      <span className="flex items-center gap-1 text-amber-600 font-extrabold justify-center sm:justify-start">
                        {t('milestone30')}
                      </span>
                    ) : logsCount >= 7 ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold justify-center sm:justify-start">
                        {t('milestone7', { count: logsCount })}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 font-medium justify-center sm:justify-start">
                        {t('milestoneUnlock', { count: logsCount, remaining: 7 - logsCount })}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* View action plan button on the right */}
              <button
                onClick={() => setActiveTab('plan')}
                className="w-full lg:w-auto bg-[#0A3D25] hover:bg-[#0D5232] text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 self-stretch lg:self-center"
              >
                {t('viewMyActionPlan')} <span className="text-lg">→</span>
              </button>
            </div>

            {/* Grid layout matching Figma Screen 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-16 bg-white border border-gray-100/80 shadow-sm rounded-3xl">
                  <div className="w-12 h-12 border-4 border-[#0A3D25] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 font-medium">{t('loadingRecommendations')}</p>
                </div>
              ) : (
                recommendations.map((rec) => {
                  const isAdded = planItems.some(item => item.id === rec.id || item.title === rec.title);
                  return (
                    <div
                      key={rec.id}
                      className="bg-white border border-gray-100/80 shadow-sm rounded-3xl p-6 flex flex-col justify-between transition-all hover:shadow-md"
                    >
                      <div>
                        {/* Badge */}
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${rec.badgeColor}`}>
                          {rec.badge === 'EASY WIN' ? t('easyWin') : rec.badge === 'MEDIUM IMPACT' ? t('mediumImpact') : t('highImpact')}
                        </span>

                        {/* Main Title & Description */}
                        <h3 className="text-xl font-bold text-[#0A3D25] mt-4 tracking-tight">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                          {rec.description}
                        </p>
                      </div>

                      {/* Bottom Section with visual graphic and impact reduction / actions */}
                      <div className="mt-6 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            {t('impactReduction')}
                          </p>
                          <p className="text-lg font-extrabold text-gray-800 mt-0.5">
                            {rec.reduction}
                            <span className="text-xs font-semibold text-gray-400">
                              {rec.reductionUnit === '/mo' || rec.reductionUnit === '/month' ? t('kgPerMo') : rec.reductionUnit}
                            </span>
                          </p>
                          <button
                            onClick={() => !isAdded && addToPlan(rec)}
                            disabled={isAdded}
                            className={`mt-3 text-xs font-bold py-2.5 px-5 h-10 rounded-full transition-all border flex items-center justify-center ${isAdded
                              ? 'bg-[#E2F0D9] text-[#0A3D25] border-[#C5E0B4] opacity-80 cursor-default'
                              : 'bg-[#0A3D25] text-white border-transparent hover:bg-[#0D5232] cursor-pointer'
                              }`}
                          >
                            {isAdded ? t('added') : t('addToPlan')}
                          </button>
                        </div>

                        {/* Icon/Graphic representation */}
                        <div className="w-32 h-24 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                          {rec.visualType === 'bus' && (
                            <div className="w-full h-full relative bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Bus className="w-10 h-10" />
                            </div>
                          )}
                          {rec.visualType === 'fork-knife' && (
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                              <Utensils className="w-6 h-6" />
                            </div>
                          )}
                          {rec.visualType === 'bin' && (
                            <div className="w-full h-full relative bg-green-50 text-green-600 flex items-center justify-center">
                              <Recycle className="w-10 h-10" />
                            </div>
                          )}
                          {rec.visualType === 'lightbulb' && (
                            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                              <Lightbulb className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Figma Screen 3 - Action Plan & Commitment Dashboard */
          <div>
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-[32px] font-extrabold tracking-tight text-[#0A3D25] md:text-[34px]">
                  {t('actionPlanTitle')}
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">
                  {t('actionPlanSubtitle')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="bg-white border border-gray-300 hover:border-[#0A3D25] text-gray-700 hover:text-[#0A3D25] text-sm font-semibold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-sm"
              >
                ← {t('addMore')}
              </button>
            </div>

            {/* Dark green progress header card matching Figma precisely */}
            <div className="bg-[#0A3D25] text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 mb-8 relative overflow-hidden shadow-md">
              {/* Left Box: Total Actions */}
              <div className="flex-1 border-r border-[#155A39]/60 last:border-0 pr-6">
                <p className="text-[10px] font-bold tracking-wider text-[#A2CBA0] uppercase">
                  {t('totalActions')}
                </p>
                <p className="text-3xl font-black mt-2 flex items-baseline gap-1">
                  {totalActions < 10 ? `0${totalActions}` : totalActions}
                  <span className="text-xs font-semibold text-[#A2CBA0] normal-case tracking-normal">
                    {t('committed')}
                  </span>
                </p>
              </div>

              {/* Middle Box: CO2 Saved */}
              <div className="flex-1 border-r border-[#155A39]/60 last:border-0 px-0 md:px-6">
                <p className="text-[10px] font-bold tracking-wider text-[#A2CBA0] uppercase">
                  {t('totalCO2Saved')}
                </p>
                <p className="text-3xl font-black mt-2 flex items-baseline gap-1">
                  {totalCO2Saved}
                  <span className="text-xs font-semibold text-[#A2CBA0] normal-case tracking-normal">
                    {t('kgPerMo')}
                  </span>
                </p>
              </div>

              {/* Right Box: Overall Progress Bar */}
              <div className="flex-[2] pl-0 md:pl-6 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#A2CBA0]">{t('overallPlanProgress')}</span>
                  <span className="text-sm font-black text-white">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#155A39] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E2F0D9] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#A2CBA0] mt-2 font-medium">
                  {t('completedSummary', { completed: completedCount, total: totalActions })}
                </p>
              </div>
            </div>

            {/* Filter buttons block */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {[
                { filterKey: 'all', label: t('filterAll') || 'All' },
                { filterKey: 'transport', label: t('filterTransport') || 'Transport' },
                { filterKey: 'energy', label: t('filterEnergy') || 'Energy' },
                { filterKey: 'waste', label: t('filterWaste') || 'Waste' },
                { filterKey: 'food', label: t('filterFood') || 'Food' },
                { filterKey: 'archived', label: 'Archived' }
              ].map((btn) => {
                const isActive = activeFilter === btn.filterKey;
                return (
                  <button
                    key={btn.filterKey}
                    onClick={() => setActiveFilter(btn.filterKey)}
                    className={`text-xs font-bold py-2.5 px-5 rounded-full transition-all border cursor-pointer ${isActive
                      ? 'bg-[#0A3D25] text-white border-transparent shadow-sm'
                      : 'bg-[#F1F4F2] text-gray-500 border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Actions List Grid */}
            <div className="space-y-4">
              {filteredPlanItems.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#E2F0D9] text-[#0A3D25] rounded-full flex items-center justify-center mb-2">
                    <Sprout className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium mt-3">
                    {t('noActions')}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {t('tryAdding')}
                  </p>
                </div>
              ) : (
                filteredPlanItems.map((item) => {
                  const itemAddedAt = item.addedAt ? new Date(item.addedAt) : new Date(0);
                  const addedDate = new Date(itemAddedAt);
                  addedDate.setHours(0, 0, 0, 0);

                  const validLogs = dailyLogs ? dailyLogs.filter(log => {
                    const logDate = new Date(log.date);
                    logDate.setHours(0, 0, 0, 0);
                    return logDate >= addedDate;
                  }) : [];

                  const isCompleted = getItemCompletionStatus(item);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-100/80 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md"
                    >
                      {/* Left: Icon and Details */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-2xl bg-[#E2F0D9] text-[#0A3D25] border border-[#C5E0B4]/40 flex items-center justify-center text-xl shrink-0 select-none">
                          {renderIcon(item.icon)}
                        </div>

                        {/* Title & Desc */}
                        <div>
                          {/* Status Label Row */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-extrabold text-[#0A3D25] uppercase tracking-wider">
                              {t(`filter${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`) || item.category}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isCompleted
                              ? 'text-green-600'
                              : 'text-red-500'
                              }`}>
                              {isCompleted ? t('completed') : t('pending')}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-bold text-gray-800 tracking-tight leading-tight">
                            {item.title}
                          </h4>

                          {/* Description */}
                          <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Saving Info & Complete Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50">

                        {/* Saving */}
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            {t('potentialSaving')}
                          </p>
                          <p className="text-xs font-black text-gray-800 mt-0.5">
                            {item.saving}{t('kgCO2PerMo')}
                          </p>
                        </div>

                        {/* Complete toggle & Trash actions */}
                        <div className="flex items-center gap-4">
                          {!item.archived && <ProgressTrackerWrapper item={item} dailyLogs={validLogs} />}
                          {item.archived ? (
                            <button
                              onClick={() => unarchivePlanItem(item.id)}
                              className="px-4 h-8 rounded-xl bg-[#0A3D25] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#0D5232] transition-all flex items-center gap-1 shrink-0"
                              title="Restore Action"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => archivePlanItem(item.id)}
                              className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 hover:text-amber-600 border border-gray-100 flex items-center justify-center transition-all cursor-pointer shrink-0"
                              title={t('archiveAction') || 'Archive Action'}
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecommendationsView;
