'use client';

import React from 'react';
import RecommendationsView from '@/components/RecommendationsView';

export default function PlanPage() {
  return <RecommendationsView />;
}




// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   CalendarClock,
//   Check,
//   ChevronDown,
//   ClipboardCheck,
//   Footprints,
//   Leaf,
//   Lightbulb,
//   LockKeyhole,
//   Recycle,
//   Sprout,
//   Users
// } from 'lucide-react';
// import RecommendationsView from '@/components/RecommendationsView';
// import { useAuth } from '@/context/AuthContext';
// import { getDashboardSummary } from '@/lib/actions/dashboardActions';
// import { getTodayLog } from '@/lib/actions/calculatorActions';
// import PhaseUnlockCelebration from '@/components/PhaseUnlockCelebration';

// const URBAN_STARTER_PLAN = [
//   {
//     week: 'Week 1',
//     title: 'Understand your transport impact',
//     icon: Footprints,
//     tasks: [
//       ['w1-log-travel', 'Notice how you travel to school each day and log it honestly', 'Awareness task'],
//       ['w1-walk-cycle', 'Try walking or cycling one day this week if possible', '0.5 kg CO2 reduction | Easy'],
//       ['w1-plastic-count', 'Count how many single-use plastic items you use in one day', 'Awareness task']
//     ]
//   },
//   {
//     week: 'Week 2',
//     title: 'Food and waste awareness',
//     icon: Recycle,
//     tasks: [
//       ['w2-veg-lunch', 'Choose vegetarian lunch at least twice this week', '1.2 kg CO2 reduction | Easy'],
//       ['w2-bottle', 'Bring a reusable water bottle instead of buying plastic', '0.3 kg CO2 reduction | Easy'],
//       ['w2-compost', 'Check if your school canteen has a composting system', 'Awareness task']
//     ]
//   },
//   {
//     week: 'Week 3',
//     title: 'Collective action',
//     icon: Users,
//     tasks: [
//       ['w3-classmates', 'Talk to 3 classmates about your carbon footprint results', 'Awareness task'],
//       ['w3-lights-off', 'Suggest a lights-off rule during breaks to your teacher', '0.5 kg CO2 reduction | Easy'],
//       ['w3-walk-twice', 'Walk or cycle to school at least twice this week', '1.0 kg CO2 reduction | Medium']
//     ]
//   },
//   {
//     week: 'Week 4',
//     title: 'Prepare for your personalized plan',
//     icon: ClipboardCheck,
//     tasks: [
//       ['w4-log-30', 'Complete your 30th daily log to unlock your AI plan', 'Milestone task'],
//       ['w4-review-streak', 'Review your streak because consistency earns the highest score', 'Milestone task'],
//       ['w4-countdown', 'Your personalized plan unlocks soon', 'Countdown milestone']
//     ]
//   }
// ];

// const RURAL_STARTER_PLAN = [
//   {
//     week: 'Week 1',
//     title: 'Map your daily route and energy use',
//     icon: Footprints,
//     tasks: [
//       ['rw1-route', 'Notice how you travel to school: walking, bicycle, bus, motorbike, or shared jeep', 'Awareness task'],
//       ['rw1-safe-walk', 'If safe, walk with friends at least one extra day this week', '0.4 kg CO2 reduction | Easy'],
//       ['rw1-evening-energy', 'Write down when lights, phone charging, or TV are used at home after school', 'Awareness task']
//     ]
//   },
//   {
//     week: 'Week 2',
//     title: 'Cleaner cooking and less smoke',
//     icon: Leaf,
//     tasks: [
//       ['rw2-firewood', 'Log firewood use honestly if your home cooks with firewood', 'Awareness task'],
//       ['rw2-dry-wood', 'Ask your family if firewood can be kept dry before cooking to reduce smoke', '0.5 kg CO2 reduction | Easy'],
//       ['rw2-ventilation', 'Notice whether the cooking area has good airflow or a chimney', 'Health and climate task']
//     ]
//   },
//   {
//     week: 'Week 3',
//     title: 'Water, waste, and local resources',
//     icon: Recycle,
//     tasks: [
//       ['rw3-bottle', 'Carry a reusable bottle instead of buying plastic packets or bottles', '0.3 kg CO2 reduction | Easy'],
//       ['rw3-waste-separate', 'Separate organic waste from plastic waste at home or school for one week', 'Awareness task'],
//       ['rw3-water-care', 'Check if taps are left running at school and remind classmates to close them', 'Water protection task']
//     ]
//   },
//   {
//     week: 'Week 4',
//     title: 'Community action before unlock',
//     icon: Users,
//     tasks: [
//       ['rw4-garden', 'Help care for a school garden, sapling, or compost pit if available', 'Community task'],
//       ['rw4-talk-family', 'Share one carbon habit you noticed with someone at home', 'Awareness task'],
//       ['rw4-log-30', 'Complete your 30th daily log to unlock your personalized rural plan', 'Milestone task']
//     ]
//   }
// ];

// const StarterPlanView = ({ summary, hasLoggedToday }) => {
//   const { user } = useAuth();
//   const router = useRouter();
//   const isRural = (summary?.student?.locationType || user?.locationType) === 'rural';
//   const starterPlan = isRural ? RURAL_STARTER_PLAN : URBAN_STARTER_PLAN;
//   const totalLogsCount = summary?.totalLogsCount ?? 0;
//   const daysUntilPersonalized = summary?.daysUntilPersonalized ?? Math.max(0, 30 - totalLogsCount);
//   const progress = Math.min(100, (totalLogsCount / 30) * 100);
//   const userId = user?._id || user?.id;
//   const storageKey = userId ? `neokarma_starter_plan_${isRural ? 'rural' : 'urban'}_${userId}` : null;
//   const [completed, setCompleted] = useState({});
//   const [openWeeks, setOpenWeeks] = useState(() => new Set(['Week 1']));
//   const [isCompletedLoaded, setIsCompletedLoaded] = useState(false);

//   useEffect(() => {
//     if (!storageKey) return;
//     try {
//       const stored = localStorage.getItem(storageKey);
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         setCompleted((current) => ({ ...parsed, ...current }));
//       }
//     } catch (error) {
//       console.error('Unable to parse starter plan progress:', error);
//     } finally {
//       setIsCompletedLoaded(true);
//     }
//   }, [storageKey]);

//   useEffect(() => {
//     if (!storageKey || !isCompletedLoaded) return;
//     localStorage.setItem(storageKey, JSON.stringify(completed));
//   }, [completed, storageKey, isCompletedLoaded]);

//   const completedCount = useMemo(() => Object.values(completed).filter(Boolean).length, [completed]);
//   const totalTasks = starterPlan.reduce((sum, week) => sum + week.tasks.length, 0);

//   const toggleWeek = (week) => {
//     setOpenWeeks((current) => {
//       const next = new Set(current);
//       if (next.has(week)) next.delete(week);
//       else next.add(week);
//       return next;
//     });
//   };

//   return (
//     <main className="starter-plan-shell min-h-[calc(100vh-76px)] bg-white px-4 py-10 text-[#17202A] md:px-8 lg:px-12 xl:px-16">
//       <div className="mx-auto w-full max-w-[1500px] space-y-8">
//         <section className="grid gap-6 md:grid-cols-[1fr_340px] md:items-center">
//           <div>
//             <p className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#B36B10]/80">Starter phase</p>
//             <h1 className="text-[34px] font-extrabold leading-tight text-[#17202A] md:text-[40px]">{'Your starter plans'}</h1>
//             <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-[#4A5550]">A practical 30-day plan to keep your class moving toward climate action. Small, everyday steps add up to real school impact.</p>
//             <div className="mt-6 flex flex-wrap items-center gap-3">
//               <button
//                 type="button"
//                 onClick={() => router.push(hasLoggedToday ? '/calculator/result' : '/calculator')}
//                 className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A3D25] px-6 text-[15px] font-bold text-white hover:bg-[#072B1A] shadow-sm"
//               >
//                 {hasLoggedToday ? "See today's log" : 'Log Today →'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => router.push('/plans')}
//                 className="inline-flex h-12 items-center justify-center rounded-full border border-[#DCEAE3] bg-white px-6 text-[15px] font-semibold text-[#4A5550] hover:bg-[#F9FFFC]"
//               >
//                 View all plans
//               </button>
//               <div className="rounded-full bg-[#F7FCF8] px-4 py-2 text-sm font-semibold text-[#0A3D25] border border-[#E0E5E2]">{completedCount}/{totalTasks} tasks checked</div>
//             </div>
//           </div>

//           <div className="rounded-[32px] bg-gradient-to-br from-[#EFF8F2] via-[#F7FAF6] to-[#FFF8EE] p-6 shadow-[0_18px_40px_rgba(34,28,15,0.08)]">
//             <div className="mb-3 flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-bold text-[#B36B10]">Personalized plan unlock</p>
//                 <p className="mt-1 text-2xl font-extrabold text-[#2F2A1F]">{daysUntilPersonalized} days left</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-sm font-semibold text-[#5B4A3A]">{totalLogsCount}/30 days</p>
//                 <p className="text-xs text-[#7A6A59]">Keep building your baseline</p>
//               </div>
//             </div>
//             <div className="h-4 w-full overflow-hidden rounded-full bg-white shadow-inner">
//               <div className="h-full rounded-full bg-gradient-to-r from-[#0A3D25] to-[#77C9A6] transition-all duration-700" style={{ width: `${progress}%` }} />
//             </div>
//             <p className="mt-3 text-sm text-[#6B5C4C]">Your personalized plan unlocks after 30 days. Meanwhile, try a few actions from this starter plan every week.</p>
//           </div>
//         </section>

//         <section className="rounded-2xl border border-[#E8F1EA] bg-white p-6 shadow-sm md:p-7">
//           <div className="space-y-4">
//             {starterPlan.map((week) => {
//               const Icon = week.icon;
//               const isOpen = openWeeks.has(week.week);
//               return (
//                 <div key={week.week} className="overflow-hidden rounded-xl border border-[#EEF6EF] bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
//                   <button
//                     type="button"
//                     onClick={() => toggleWeek(week.week)}
//                     className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FBFFFB]"
//                   >
//                     <span className="flex items-center gap-3">
//                       <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1FBF5] text-[#0A3D25] shadow-sm">
//                         <Icon size={20} />
//                       </span>
//                       <span>
//                         <span className="block text-[12px] font-extrabold uppercase tracking-wider text-[#4A5550]">{week.week}</span>
//                         <span className="block text-[18px] font-extrabold text-[#17202A]">{week.title}</span>
//                       </span>
//                     </span>
//                     <ChevronDown className={`text-[#4A5550] transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
//                   </button>

//                   {isOpen && (
//                     <div className="grid gap-3 border-t border-[#EEF6EF] bg-[#FFFFFF] p-4 lg:grid-cols-3">
//                       {week.tasks.map(([id, text, meta]) => {
//                         const isDone = Boolean(completed[id]);
//                         return (
//                           <button
//                             type="button"
//                             key={id}
//                             onClick={() => setCompleted((current) => ({ ...current, [id]: !current[id] }))}
//                             className={`flex h-full w-full items-start gap-3 rounded-lg border p-4 text-left transition-all ${isDone ? 'border-[#D6EFE0] bg-[#F7FFFA] shadow-sm' : 'border-gray-100 bg-white hover:border-[#CFE7D5] hover:bg-[#FBFFFB]'}`}
//                           >
//                             <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isDone ? 'border-[#0A3D25] bg-[#0A3D25] text-white' : 'border-gray-300 text-transparent'}`}>
//                               <Check size={14} />
//                             </span>
//                             <span className="flex-1">
//                               <span className={`block text-[14px] font-semibold ${isDone ? 'text-[#0A3D25] line-through' : 'text-[#17202A]'}`}>{text}</span>
//                               <span className="mt-1 block text-[12px] font-medium text-[#6A7C73]">{meta}</span>
//                             </span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </section>

//         <section className="grid gap-5 md:grid-cols-3">
//           {[
//             ['Personalized plan locked', 'Complete 30 days of logs to unlock ML-generated recommendations.', LockKeyhole],
//             [isRural ? 'Start with local habits' : 'Start with easy wins', isRural ? 'Focus on safe walking, cleaner cooking awareness, water care, and school gardens.' : 'Choose practical transport, food, waste, and energy actions this month.', isRural ? Sprout : Lightbulb],
//             ['Keep your streak alive', 'Consistent logging gives your future plan better data.', Leaf]
//           ].map(([title, body, Icon]) => (
//             <div key={title} className="rounded-xl border border-[#E8F1EA] bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
//               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1FBF5] text-[#0A3D25] shadow-sm">
//                 <Icon size={20} />
//               </div>
//               <h3 className="text-[17px] font-extrabold text-[#17202A]">{title}</h3>
//               <p className="mt-2 text-[14px] leading-relaxed text-[#4A5550]">{body}</p>
//             </div>
//           ))}
//         </section>
//       </div>
//     </main>
//   );
// };

// export default function PlanPage() {
//   const { isAuthenticated } = useAuth();
//   const router = useRouter();
//   const [summary, setSummary] = useState(null);
//   const [hasLoggedToday, setHasLoggedToday] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadPhase = async () => {
//       if (!isAuthenticated) {
//         router.push('/login');
//         return;
//       }

//       try {
//         setError(null);
//         // try multiple times for transient failures
//         const attempts = 2;
//         let summaryResult = null;
//         let todayLog = null;
//         for (let i = 0; i < attempts; i++) {
//           try {
//             [summaryResult, todayLog] = await Promise.all([getDashboardSummary(), getTodayLog()]);
//             break;
//           } catch (e) {
//             if (i === attempts - 1) throw e;
//             // small backoff
//             await new Promise((r) => setTimeout(r, 250));
//           }
//         }

//         setSummary(summaryResult);
//         setHasLoggedToday(!!todayLog);
//       } catch (err) {
//         console.error('Unable to load phase for plan page:', err);
//         setError(err?.message || 'Failed to load plan data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isAuthenticated) loadPhase();
//   }, [isAuthenticated, router]);

//   if (!isAuthenticated) return null;

//   if (loading) {
//     return (
//       <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
//         <div className="mx-auto max-w-[1500px] space-y-5">
//           <div className="h-32 animate-pulse rounded-2xl bg-white" />
//           <div className="h-96 animate-pulse rounded-2xl bg-white" />
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-[calc(100vh-76px)] bg-[#FEF2F2] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
//         <div className="mx-auto max-w-[900px]">
//           <div className="rounded-2xl bg-white p-6 shadow-sm">
//             <h2 className="text-xl font-bold text-[#B33B2E]">Unable to load your plan</h2>
//             <p className="mt-3 text-sm text-[#5B4A3A]">{error}</p>
//             <div className="mt-4 flex gap-3">
//               <button onClick={() => {
//                 setLoading(true);
//                 setError(null);
//                 // re-run loader
//                 (async () => {
//                   try {
//                     const [summaryResult, todayLog] = await Promise.all([getDashboardSummary(), getTodayLog()]);
//                     setSummary(summaryResult);
//                     setHasLoggedToday(!!todayLog);
//                   } catch (err) {
//                     setError(err?.message || 'Retry failed');
//                   } finally {
//                     setLoading(false);
//                   }
//                 })();
//               }} className="inline-flex items-center gap-2 rounded-full bg-[#0A3D25] px-4 py-2 text-white">Retry</button>
//               <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 rounded-full border px-4 py-2">Go to Dashboard</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (summary?.phase === 'onboarding') {
//     return <StarterPlanView summary={summary} hasLoggedToday={hasLoggedToday} />;
//   }

//   return (
//     <>
//       <PhaseUnlockCelebration summary={summary} />
//       <RecommendationsView />
//     </>
//   );
// }
