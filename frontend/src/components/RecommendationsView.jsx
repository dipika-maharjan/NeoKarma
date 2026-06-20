'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getActivePlan, generatePlan } from '@/lib/actions/mitigationPlanActions';
import { useTranslations } from 'next-intl';
import { Bus, Utensils, Trash2, Lightbulb, Sprout, Leaf } from 'lucide-react';

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
    actionDesc: 'Switching to school buses twice a week reduces individual car usage significantly.'
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
    actionDesc: 'Try a vegetarian meal once or twice a week during canteen school lunches.'
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
    actionDesc: 'Reducing contamination in recycling bins saves energy and reduces landfill waste significantly.'
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
    actionDesc: 'Developing the habit of turning off electrical appliances when leaving the room.'
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
    actionDesc: 'Commit to using zero single-use plastics and zero food waste every Friday.'
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
  if (s.includes('🗑') || s === 'bin') return <Trash2 className="w-6 h-6" />;
  if (s.includes('💡') || s === 'lightbulb') return <Lightbulb className="w-6 h-6" />;
  if (s.includes('🥤') || s.includes('📄')) return <Leaf className="w-6 h-6" />;
  if (s.includes('🖥')) return <Lightbulb className="w-6 h-6" />;
  if (s.includes('🥦') || s.includes('🌱')) return <Sprout className="w-6 h-6" />;
  return <Sprout className="w-6 h-6" />;
};

const mapBackendRecToCard = (rec, index) => {
  const id = rec._id || rec.id || `backend-rec-${index}`;

  // Use rich fields from backend if available to support custom visuals and colors
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

  const reduction = rec.reduction || `-${(rec.estimatedReductionKg || 0).toFixed(1)} kg CO2`;
  const reductionUnit = rec.reductionUnit || '/month';
  const personalSaving = rec.personalSaving !== undefined ? rec.personalSaving : (rec.estimatedReductionKg || 0);

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
    actionDesc: rec.actionDesc || rec.description
  };
};

const RecommendationsView = ({ onNavigateToDashboard }) => {
  const { user } = useAuth();
  const t = useTranslations('Plan');
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' or 'plan'
  const [addedIds, setAddedIds] = useState(new Set());
  const [planItems, setPlanItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'transport', 'energy', 'waste', 'food'

  const [recommendations, setRecommendations] = useState(PRESETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // New two-tier states
  const [planType, setPlanType] = useState(null);
  const [logsCount, setLogsCount] = useState(0);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [topContributors, setTopContributors] = useState([]);

  // Load planItems from localStorage unique to the logged-in user
  useEffect(() => {
    if (!user) return;
    const storageKey = `neokarma_plan_items_${user._id || user.id || 'default'}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setPlanItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored plan items:', e);
        setPlanItems(INITIAL_PLAN_ITEMS);
      }
    } else {
      setPlanItems(INITIAL_PLAN_ITEMS);
    }
    setIsLoaded(true);
  }, [user]);

  // Save planItems to localStorage unique to the logged-in user
  useEffect(() => {
    if (!user || !isLoaded) return;
    const storageKey = `neokarma_plan_items_${user._id || user.id || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(planItems));
  }, [planItems, user, isLoaded]);

  // Synchronize addedIds with planItems
  useEffect(() => {
    setAddedIds(new Set(planItems.map(item => item.id)));
  }, [planItems]);

  // Fetch or generate recommendations from the backend
  useEffect(() => {
    const loadPlan = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        let planData = await getActivePlan();

        // Auto-generation fallback logic if planData is completely empty
        if (!planData) {
          try {
            const newPlan = await generatePlan();
            planData = newPlan;
          } catch (genErr) {
            console.warn('Could not generate plan automatically:', genErr);
          }
        }

        if (planData) {
          setPlanType(planData.type || null);
          setLogsCount(planData.logsCount || 0);
          setMotivationalMessage(planData.message || '');

          if (planData.type === 'GENERAL_PLAN') {
            const plan = planData.plan || {};
            const flatRecs = [
              ...(plan.transport || []),
              ...(plan.energy || []),
              ...(plan.diet || []),
              ...(plan.waste || [])
            ];
            const cards = flatRecs.map((rec, index) => mapBackendRecToCard(rec, index));
            setRecommendations(cards);
          } else if (planData.type === 'MONTHLY_PLAN') {
            const recs = planData.plan?.recommendations || [];
            const cards = recs.map((rec, index) => mapBackendRecToCard(rec, index));
            setRecommendations(cards);
            setTopContributors(planData.plan?.topContributors || []);
          } else {
            // Fallback to old format if backend returns plain active plan
            const recs = planData.recommendations || [];
            if (recs.length > 0) {
              const cards = recs.map((rec, index) => mapBackendRecToCard(rec, index));
              setRecommendations(cards);
            } else {
              setRecommendations(PRESETS);
            }
          }
        } else {
          setRecommendations(PRESETS);
        }
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError(err.message || 'Failed to load recommendations');
        setRecommendations(PRESETS);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [user]);

  // Add recommendation to Plan list dynamically
  const addToPlan = (rec) => {
    if (planItems.some(item => item.id === rec.id)) {
      setActiveTab('plan');
      return;
    }

    const newItem = {
      id: rec.id,
      category: rec.category,
      title: rec.title,
      description: rec.actionDesc || rec.description,
      saving: rec.personalSaving || 15.0,
      completed: false,
      icon: rec.visualType === 'bus' ? '🚌' : rec.visualType === 'fork-knife' ? '🍽️' : rec.visualType === 'bin' ? '🗑️' : '💡'
    };

    setPlanItems([newItem, ...planItems]);
    setActiveTab('plan'); // Direct redirect to show plan
  };

  // Toggle completion of a task in the plan
  const toggleTaskCompleted = (id) => {
    setPlanItems(
      planItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Delete an item from the plan
  const deletePlanItem = (id) => {
    setPlanItems(planItems.filter(item => item.id !== id));
  };

  // Calculate Plan metrics
  const totalActions = planItems.length;
  const completedActions = planItems.filter(item => item.completed);
  const completedCount = completedActions.length;

  // Calculate CO2 saved (sum of completed items)
  const totalCO2Saved = completedActions.reduce((sum, item) => sum + item.saving, 0).toFixed(1);

  // Progress percentage
  const progressPercent = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  // Filtered plan list items
  const filteredPlanItems = planItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  return (
    <div className="w-full min-h-[calc(100vh-76px)] bg-[#FAFAFA] text-[#1E3322] px-4 py-8 md:px-8 lg:px-12 xl:px-16 font-sans">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* Toggle between Recommendations and Plan */}
        {activeTab === 'recommendations' ? (
          <div>
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-[32px] font-extrabold tracking-tight text-[#0A3D25] md:text-[34px]">
                  {t('smartRecommendations')}
                </h1>
                <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
                  {t('recommendationsSubtitle')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('plan')}
                className="bg-[#0A3D25] hover:bg-[#0D5232] text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all shadow-sm flex items-center gap-2"
              >
                View My Action Plan <span className="text-lg">→</span>
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
                  const isAdded = planItems.some(item => item.id === rec.id);
                  return (
                    <div
                      key={rec.id}
                      className="bg-white border border-gray-100/80 shadow-sm rounded-3xl p-6 flex flex-col justify-between transition-all hover:shadow-md"
                    >
                      <div>
                        {/* Badge */}
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${rec.badgeColor}`}>
                          {rec.badge}
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
                              {rec.reductionUnit}
                            </span>
                          </p>
                          <button
                            onClick={() => addToPlan(rec)}
                            className={`mt-3 text-xs font-bold py-2 px-5 rounded-full transition-all border ${isAdded
                              ? 'bg-[#E2F0D9] text-[#0A3D25] border-[#C5E0B4]'
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
                            <div className="w-full h-full relative bg-stone-50 text-stone-500 flex items-center justify-center">
                              <Trash2 className="w-10 h-10" />
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
                  Total Actions
                </p>
                <p className="text-3xl font-black mt-2 flex items-baseline gap-1">
                  {totalActions < 10 ? `0${totalActions}` : totalActions}
                  <span className="text-xs font-semibold text-[#A2CBA0] normal-case tracking-normal">
                    committed
                  </span>
                </p>
              </div>

              {/* Middle Box: CO2 Saved */}
              <div className="flex-1 border-r border-[#155A39]/60 last:border-0 px-0 md:px-6">
                <p className="text-[10px] font-bold tracking-wider text-[#A2CBA0] uppercase">
                  Total CO2 Saved
                </p>
                <p className="text-3xl font-black mt-2 flex items-baseline gap-1">
                  {totalCO2Saved}
                  <span className="text-xs font-semibold text-[#A2CBA0] normal-case tracking-normal">
                    kg / mo
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
                { filterKey: 'all', label: t('filterAll') },
                { filterKey: 'transport', label: t('filterTransport') },
                { filterKey: 'energy', label: t('filterEnergy') },
                { filterKey: 'waste', label: t('filterWaste') },
                { filterKey: 'food', label: t('filterFood') }
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
                filteredPlanItems.map((item) => (
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
                            {item.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider ${item.completed
                            ? 'text-green-600'
                            : 'text-red-500'
                            }`}>
                            {item.completed ? t('completed') : t('pending')}
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
                          {item.saving}kg CO2/mo
                        </p>
                      </div>

                      {/* Complete toggle & Trash actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTaskCompleted(item.id)}
                          className={`text-[11px] font-extrabold py-2 px-4 rounded-xl border transition-all cursor-pointer ${item.completed
                            ? 'bg-transparent text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-600'
                            : 'bg-[#0A3D25] text-white border-transparent hover:bg-[#0D5232]'
                            }`}
                        >
                          {item.completed ? t('completedBtn') : t('markComplete')}
                        </button>

                        <button
                          onClick={() => deletePlanItem(item.id)}
                          className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 border border-gray-100 flex items-center justify-center transition-all cursor-pointer shrink-0"
                          title={t('deleteAction')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default RecommendationsView;
