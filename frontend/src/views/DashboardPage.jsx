'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getStreak } from '@/lib/actions/streakActions';
import { getTodayLog, getCachedStreak, getDailyLogHistory } from '@/lib/actions/calculatorActions';
import { getScoreConfig } from '@/lib/actions/scoreConfigActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('Dashboard');
  const tStatus = useTranslations('Status');
  const formatNumber = useNumberFormatter();
  const carbonMirrorT = useTranslations('CarbonMirror');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [scoreConfig, setScoreConfig] = useState(null);
  const [error, setError] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [planItems, setPlanItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const cachedStreak = getCachedStreak();
        
        const [dashData, today, config, historyResponse] = await Promise.all([
          getDashboardSummary(),
          getTodayLog(),
          getScoreConfig(),
          getDailyLogHistory()
        ]);
        
        let streakInfo = cachedStreak;
        if (!streakInfo) {
          streakInfo = await getStreak();
        }
        
        setDashboardData(dashData);
        setStreakData(streakInfo);
        setTodayLog(today);
        if (config) {
          setScoreConfig(config);
        }
        
        if (historyResponse && historyResponse.data) {
          setHistoryLogs(historyResponse.data);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(t('failedToLoadDashboard'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
      
      // Load plan items from localStorage
      const storageKey = `neokarma_plan_items_${user?._id || user?.id || 'default'}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setPlanItems(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored plan items:', e);
        }
      }
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const studentName =
    dashboardData?.student?.name?.split(' ')[0] ||
    user?.firstName ||
    user?.name?.split(' ')[0] ||
    t('userFallback');

  const todayEmission = typeof todayLog?.totalEmissionKg === 'number'
    ? Number(todayLog.totalEmissionKg)
    : (typeof dashboardData?.weekly?.averagePerDay === 'number' ? Number(dashboardData.weekly.averagePerDay) : null);
  const weeklyTotal = typeof dashboardData?.weekly?.totalEmissionKg === 'number'
    ? Number(dashboardData.weekly.totalEmissionKg)
    : null;
  const weeklyAverage = dashboardData?.weekly?.averagePerDay ?? null;
  const monthlyAverage = dashboardData?.monthly?.averagePerDay ?? weeklyAverage ?? null;
  const monthlyReduction = (monthlyAverage !== null && weeklyAverage !== null && monthlyAverage !== 0)
    ? Math.round(((monthlyAverage - weeklyAverage) / monthlyAverage) * 100)
    : null;
  const monthlyReductionMessage = monthlyReduction !== null && weeklyAverage !== null && monthlyAverage !== null
    ? t('monthlyReductionDetail', {
        weeklyAvg: formatNumber(weeklyAverage, { maximumFractionDigits: 1 }),
        monthlyAvg: formatNumber(monthlyAverage, { maximumFractionDigits: 1 })
      })
    : t('monthlyReductionPlaceholder');
  const monthlyReductionStatus = monthlyReduction !== null
    ? monthlyReduction > 0
      ? t('monthlyReductionPositive')
      : t('monthlyReductionNeutral')
    : '';
  const impactScore = (() => {
    if (!streakData || !scoreConfig) return null;
    
    const currentStreak = streakData.current || 0;
    const streakMultiplier = scoreConfig?.streakMultiplier ?? 5;
    const streakMaxPts = scoreConfig?.streakMaxPoints ?? 25;
    const streakPts = Math.min(currentStreak * streakMultiplier, streakMaxPts);

    const totalActions = planItems.length;
    const completedActions = planItems.filter((item) => item.completed);
    const completedCount = completedActions.length;
    const actionsWeight = scoreConfig?.actionsWeight ?? 35;
    const actionsDefaultPts = scoreConfig?.actionsDefaultPoints ?? 15;
    const actionsPts = totalActions > 0
      ? Math.round((completedCount / totalActions) * actionsWeight)
      : actionsDefaultPts;

    const logsCount = historyLogs.length;
    const consistencyMultiplier = scoreConfig?.consistencyMultiplier ?? 2.5;
    const consistencyMaxPts = scoreConfig?.consistencyMaxPoints ?? 25;
    const consistencyPts = Math.min(logsCount * consistencyMultiplier, consistencyMaxPts);

    const completenessThreshold = scoreConfig?.completenessThreshold ?? 3;
    const completenessHighPts = scoreConfig?.completenessHighPoints ?? 15;
    const completenessLowMultiplier = scoreConfig?.completenessLowMultiplier ?? 5;
    const completenessLowMaxPts = scoreConfig?.completenessLowMaxPoints ?? 15;
    const completenessPts = currentStreak >= completenessThreshold
      ? completenessHighPts
      : Math.min(currentStreak * completenessLowMultiplier, completenessLowMaxPts);

    const overallMaxScore = scoreConfig?.overallMaxScore ?? 100;
    const overallScore = Math.min(streakPts + actionsPts + consistencyPts + completenessPts, overallMaxScore);
    
    return overallScore;
  })();
  
  const impactScore_val = Number.isFinite(impactScore)
    ? Math.min(100, Math.max(0, Math.round(impactScore)))
    : null;
  
  const gaugeLabel = impactScore_val !== null
    ? impactScore_val >= 80 ? 'Excellent' : impactScore_val >= 50 ? 'Good impact' : 'Keep going'
    : 'Keep going';
  const goldThreshold = scoreConfig?.goldThreshold ?? 800;
  const silverThreshold = scoreConfig?.silverThreshold ?? 600;
  const scoreStatus = impactScore_val !== null
    ? impactScore_val >= goldThreshold ? tStatus('gold') : impactScore_val >= silverThreshold ? tStatus('silver') : tStatus('bronze')
    : tStatus('none');
  const scorePercent = impactScore_val !== null ? Math.min(100, Math.max(0, impactScore_val)) : 0;
  const nextMilestone = impactScore !== null
    ? impactScore >= silverThreshold ? t('goldLabel') : t('silverLabel')
    : t('silverLabel');
  const weeklyBars = Array.isArray(dashboardData?.weekly?.dailyValues)
    ? dashboardData.weekly.dailyValues.map(v => Number(v))
    : [];
  const weeklyLabels = Array.isArray(dashboardData?.weekly?.dailyLabels)
    ? dashboardData.weekly.dailyLabels
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyRows = weeklyBars.map((value, index) => ({
    label: weeklyLabels[index] ?? `Day ${index + 1}`,
    value
  }));
  const gasBubbles = (() => {
    const emission = todayEmission ?? 3.5;
    const count = Math.min(10, Math.max(4, Math.round(emission * 1.5)));
    const sizes = [28, 44, 72, 96, 140];

    return Array.from({ length: count }, (_, index) => {
      const seed = (index + 1) * 37;
      const size = sizes[index % sizes.length];
      const left = 3 + (seed % 82);
      const dur = 6 + ((seed * 7) % 90) / 10;
      const delay = -(((seed * 11) % 100) / 100) * dur;
      const opacity = 0.04 + ((seed * 13) % 60) / 1000;

      return {
        size,
        left,
        dur,
        delay,
        opacity,
        anim: `rise-sway-${(index % 4) + 1}`
      };
    });
  })();
  const emissionPlumes = [
    { left: 18, bottom: 24, width: 170, height: 48, delay: -0.8, duration: 13.5, opacity: 0.15 },
    { left: 33, bottom: 56, width: 210, height: 54, delay: -3.1, duration: 15.8, opacity: 0.13 },
    { left: 49, bottom: 30, width: 230, height: 58, delay: -5.4, duration: 16.2, opacity: 0.14 },
    { left: 64, bottom: 54, width: 190, height: 48, delay: -1.9, duration: 14.7, opacity: 0.12 },
    { left: 78, bottom: 28, width: 180, height: 46, delay: -6.8, duration: 15.4, opacity: 0.13 },
    { left: 86, bottom: 60, width: 130, height: 34, delay: -9.2, duration: 13.2, opacity: 0.1 }
  ];
  const emissionWisps = [
    { left: 8, top: 34, width: 260, delay: -1.2, duration: 15 },
    { left: 27, top: 62, width: 320, delay: -4.5, duration: 17 },
    { left: 48, top: 42, width: 300, delay: -7.6, duration: 16 },
    { left: 68, top: 68, width: 280, delay: -8.7, duration: 15.5 },
    { left: 76, top: 28, width: 220, delay: -10.1, duration: 14 }
  ];

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#17202A] md:text-[34px]">
            {t('greeting', { name: studentName })}
          </h1>
          <Link
            href="/calculator"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0A3D25] px-8 text-[15px] font-bold text-white shadow-[0_3px_8px_rgba(10,61,37,0.2)] transition-colors hover:bg-[#072B1A]"
          >
            <Plus size={20} />
            {t('logToday')}
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2.05fr_1fr]">
          {/* Hero Card Banner - Restyled with premium typography parameters matching image_3a8016.jpg */}
          <section
            className="relative min-h-[140px] overflow-hidden rounded-xl p-6 text-white card-float card-compact hero md:min-h-[160px] md:p-8 lg:p-10 flex flex-col justify-center"
            style={{
              backgroundImage: 'linear-gradient(180deg, rgba(10,61,37,0.28), rgba(10,61,37,0.16)), url("/dashboard.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {loading ? (
              <div className="h-full animate-pulse rounded-xl bg-white/10" />
            ) : (
              <>
                <div className="relative z-10 max-w-[60%]">
                  <p className="text-[13px] md:text-[14px] font-bold uppercase tracking-[0.25em] text-[#A2CBA0] opacity-90">
                    {t('todayEmission')}
                  </p>
                  <div className="mt-2 mb-2 flex items-baseline gap-2.5">
                    <span className="text-[44px] md:text-[52px] lg:text-[58px] hero-number font-black leading-none tracking-tight drop-shadow-sm">
                      {todayEmission !== null ? formatNumber(todayEmission, { maximumFractionDigits: 1 }) : '--'}
                    </span>
                    <span className="text-[18px] md:text-[22px] font-extrabold text-[#BCE5D1] tracking-wide">
                      {t('kgCO2Unit')}
                    </span>
                  </div>
                  <p className="text-[13px] md:text-[14px] font-medium text-[#D1F2E2] leading-relaxed max-w-md">
                    {t('youDoingBetter')}
                  </p>
                </div>

                <div className="gas-wrap z-0" aria-hidden>
                  {gasBubbles.map((bubble, index) => (
                    <div
                      key={`b-${index}`}
                      className="gas-bubble"
                      style={{
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        left: `${bubble.left}%`,
                        animation: `${bubble.anim} ${bubble.dur.toFixed(2)}s linear ${bubble.delay.toFixed(2)}s infinite`,
                        opacity: bubble.opacity
                      }}
                    />
                  ))}
                </div>
                <div className="smoke-wrap z-0" aria-hidden>
                  {[0, 1, 2].map((puff) => (
                    <div
                      key={puff}
                      className="smoke-puff"
                      style={{
                        left: `${12 + puff * 30}%`,
                        width: `${42 + puff * 18}px`,
                        height: `${42 + puff * 18}px`,
                        animationDelay: `-${puff * 2.5}s`
                      }}
                    />
                  ))}
                </div>
                <div className="emission-wrap z-0" aria-hidden>
                  {emissionPlumes.map((plume, index) => (
                    <div
                      key={`plume-${index}`}
                      className="emission-plume"
                      style={{
                        left: `${plume.left}%`,
                        bottom: `${plume.bottom}%`,
                        width: `${plume.width}px`,
                        height: `${plume.height}px`,
                        animationDelay: `${plume.delay}s`,
                        animationDuration: `${plume.duration}s`,
                        opacity: plume.opacity
                      }}
                    />
                  ))}
                  {emissionWisps.map((wisp, index) => (
                    <div
                      key={`wisp-${index}`}
                      className="emission-wisp"
                      style={{
                        left: `${wisp.left}%`,
                        top: `${wisp.top}%`,
                        width: `${wisp.width}px`,
                        animationDelay: `${wisp.delay}s`,
                        animationDuration: `${wisp.duration}s`
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          <aside className="space-y-7">
            <section className="rounded-[10px] border border-[#E0E5E2] bg-white p-2 h-[86px] card-float shadow-[0_2px_8px_rgba(15,23,42,0.08)] flex flex-col justify-center">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[12px] font-bold tracking-wide text-[#4A5550]">{t('thisWeek')}</p>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#0A3D25]">
                  <ArrowUpRight size={12} />
                  {monthlyReduction !== null ? `${monthlyReduction}%` : '--'}
                </span>
              </div>
              {loading ? (
                <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
              ) : (
                <>
                  <p className="mb-0.5 text-[15px] font-extrabold text-[#17202A]">
                    {weeklyTotal !== null ? `${formatNumber(weeklyTotal, { maximumFractionDigits: 1 })} ${t('kgCO2Unit')}` : '--'}
                  </p>
                  <div className="flex h-4 items-end gap-1">
                    {weeklyBars.length > 0 && (
                      weeklyBars.map((height, index) => (
                        <div
                          key={index}
                          className={`flex-1 rounded-sm ${index === 5 ? 'bg-[#0A3D25]' : 'bg-[#E1E8E5]'}`}
                          style={{ height: `${Math.max(7, height * 14)}px` }}
                        />
                      ))
                    )}
                  </div>

                  {weeklyRows.length > 0 && (
                    <div className="mt-4 overflow-hidden rounded-3xl border border-[#E7F1E9] bg-[#F7FBF7]">
                      <table className="w-full border-collapse text-left text-[12px]">
                        <thead>
                          <tr className="bg-white/80">
                            <th className="px-3 py-3 font-semibold uppercase tracking-[0.16em] text-[#4A5550]">{t('day')}</th>
                            <th className="px-3 py-3 font-semibold uppercase tracking-[0.16em] text-[#4A5550]">{t('emission')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weeklyRows.map((row, index) => (
                            <tr key={index} className="border-t border-[#E0E5E2] even:bg-white/80">
                              <td className="px-3 py-3 font-bold text-[#17202A]">{row.label}</td>
                              <td className="px-3 py-3 text-[#4A6B5D]">{formatNumber(row.value, { maximumFractionDigits: 1 })} {t('kgCO2Unit')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="rounded-[10px] border border-[#BEE8D3] bg-[#D8F5E9] p-5 card-float flex flex-col justify-between shadow-[0_2px_8px_rgba(10,61,37,0.04)]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[14px] font-bold tracking-wide text-[#3C4F44]">
                    {t('monthlyReduction')}
                  </p>
                  {monthlyReduction !== null && (
                    <span className="rounded-full border border-[#B4E5CE] bg-[#E9FBF3] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#3C4F44]">
                      {monthlyReductionStatus || t('monthlyReductionPlaceholderLabel')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-4">
                  <ArrowDown size={23} className="text-[#3C4F44]" />
                  <p className="text-[24px] font-extrabold leading-none text-[#3C4F44]">
                    {monthlyReduction !== null ? `${Math.abs(monthlyReduction)}%` : '--'}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#BFEAD5] pt-3">
                <p className="max-w-[260px] text-[14px] leading-relaxed text-[#51685B]">
                  {monthlyReductionMessage}
                </p>
              </div>
            </section>
          </aside>
        </div>

        {/* Bottom Row Sections */}
        <div className="mt-9 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[0.55fr_1.55fr]">
          <section className="flex h-full flex-col justify-center items-center overflow-hidden rounded-[10px] border border-[#E0E5E2] bg-white px-6 py-7 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.1)]">
            <div className="impact-gauge relative w-52 h-52 rounded-full flex items-center justify-center select-none">
              <div className="absolute inset-0 rounded-full bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-gray-100" />
              <div className="absolute inset-2.5 rounded-full border border-[#E5EFE9]" />
              <div
                className="absolute inset-1.5 rounded-full bg-contain bg-center bg-no-repeat opacity-100 transition-all duration-300"
                style={{ backgroundImage: "url('/earth_gauge_bg.png')" }}
              />
              <div className="absolute w-[33%] h-[33%] rounded-full bg-white/88 backdrop-blur-[2px] flex flex-col items-center justify-center shadow-[0_12px_32px_rgba(10,61,37,0.12)] border border-white z-10">
                <span className="text-3xl font-black text-gray-800 tracking-tight leading-none">
                  {impactScore_val !== null ? formatNumber(impactScore_val, { maximumFractionDigits: 0 }) : '--'}
                </span>
                <span className="text-[8px] font-bold text-[#0A3D25]/80 mt-1.5 uppercase tracking-wide">
                  {gaugeLabel}
                </span>
              </div>
              <svg className="absolute w-full h-full transform -rotate-90 z-20 pointer-events-none" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="46" className="stroke-[#E9F1ED] fill-none" strokeWidth="3" />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  className="score-meter-ring stroke-[#0A3D25] fill-none"
                  strokeWidth="4"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={scorePercent !== null ? 100 - scorePercent : 100}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </section>

          <Link href="/carbon-mirror" className="block h-full">
            <section className="group relative h-full overflow-hidden rounded-[10px] border border-[#E0E5E2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.1)]">
              <div className="grid h-full grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative z-10 flex flex-col justify-center px-6 py-7 md:px-8">
                  <h2 className="text-[22px] font-extrabold leading-tight text-[#17202A] md:text-[24px]">
                    {carbonMirrorT ? carbonMirrorT('title') : t('carbonMirrorTitle')}
                  </h2>
                  <p className="mt-3 max-w-[410px] text-[13px] leading-relaxed text-[#4A5550]">
                    {carbonMirrorT ? carbonMirrorT('overview') : t('carbonMirrorDescription')}
                  </p>
                  <span className="mt-5 inline-flex h-10 w-fit items-center justify-center rounded-full border-2 border-[#0A3D25] bg-white px-6 text-[12px] font-bold text-[#0A3D25] transition-colors group-hover:bg-[#E8F5E9]">
                    {t('openCarbonMirror')}
                  </span>
                </div>
                <div className="relative h-full min-h-[210px] overflow-hidden bg-[#F8FBF7]">
                  <div className="absolute inset-0 bg-[url('/forest-visualization-preview.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,#FFFFFF_0%,rgba(255,255,255,0.9)_18%,rgba(255,255,255,0.48)_46%,rgba(255,255,255,0)_74%)]" />
                  <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
                </div>
              </div>
            </section>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;