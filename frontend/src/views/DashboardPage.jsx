'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getStreak } from '@/lib/actions/streakActions';
import { getTodayLog, getCachedStreak } from '@/lib/actions/calculatorActions';
import { getScoreConfig } from '@/lib/actions/scoreConfigActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('Dashboard');
  const tStatus = useTranslations('Status');
  const tCarbon = useTranslations('CarbonMirror');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [scoreConfig, setScoreConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        // Check for cached streak first (updated immediately after log submission)
        const cachedStreak = getCachedStreak();
        
        const [dashData, today, config] = await Promise.all([
          getDashboardSummary(),
          getTodayLog(),
          getScoreConfig()
        ]);
        
        // Use cached streak if available, otherwise fetch fresh
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
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const studentName =
    dashboardData?.student?.name?.split(' ')[0] ||
    user?.firstName ||
    user?.name?.split(' ')[0] ||
    'User';

  const todayEmission = typeof todayLog?.totalEmissionKg === 'number'
    ? Number(todayLog.totalEmissionKg)
    : (typeof dashboardData?.weekly?.averagePerDay === 'number' ? Number(dashboardData.weekly.averagePerDay) : null);
  const weeklyTotal = typeof dashboardData?.weekly?.totalEmissionKg === 'number'
    ? Number(dashboardData.weekly.totalEmissionKg)
    : null;
  const weeklyAverage = dashboardData?.weekly?.averagePerDay ?? null;
  const monthlyAverage = dashboardData?.monthly?.averagePerDay ?? weeklyAverage ?? null;
  const monthlyReduction = (monthlyAverage !== null && weeklyAverage !== null)
    ? Math.max(0, Math.round(((monthlyAverage - weeklyAverage) / monthlyAverage) * 100))
    : null;
  const impactScore = Number.isFinite(streakData?.participationScore)
    ? Math.min(100, Math.max(0, Math.round(streakData.participationScore)))
    : null;
  const goldThreshold = scoreConfig?.goldThreshold ?? 800;
  const silverThreshold = scoreConfig?.silverThreshold ?? 600;
  const scoreStatus = impactScore !== null
    ? impactScore >= goldThreshold ? tStatus('gold') : impactScore >= silverThreshold ? tStatus('silver') : tStatus('bronze')
    : tStatus('none');
  const scorePercent = impactScore !== null ? Math.min(100, Math.max(0, impactScore)) : 0;
  const nextMilestone = impactScore !== null
    ? impactScore >= silverThreshold ? 'Gold' : 'Silver'
    : 'Silver';
  const weeklyBars = Array.isArray(dashboardData?.weekly?.dailyValues)
    ? dashboardData.weekly.dailyValues.map(v => Number(v))
    : [];
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
  // Cards are now static and vertically centered

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
          <section
            className="relative min-h-[100px] overflow-hidden rounded-xl p-4 text-white card-float card-compact hero md:min-h-[110px] md:p-5"
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
                <div className="relative z-10">
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#A2CBA0]">
                    {t('todayEmission')}
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-[32px] hero-number font-extrabold leading-none">
                      {todayEmission !== null ? todayEmission.toFixed(1) : '--'}
                    </span>
                    <span className="pb-1 text-[16px] font-bold text-[#BCE5D1]">kg CO2</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#BCE5D1]">{t('youDoingBetter')}</p>
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
                    {weeklyTotal !== null ? weeklyTotal.toFixed(1) : '--'} kg CO2
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
                </>
              )}
            </section>

            <section className="rounded-[10px] border border-[#BEE8D3] bg-[#C7EEDC] p-5 card-float flex flex-col justify-center">
              <p className="text-[14px] font-bold tracking-wide text-[#4A6B5D]">{t('monthlyReduction')}</p>
              <div className="mt-2 flex items-center gap-8">
                <div>
                  <ArrowDown size={23} className="mb-1 text-[#4A6B5D]" />
                  <p className="text-[24px] font-extrabold text-[#4A6B5D]">
                    {monthlyReduction !== null ? `${monthlyReduction}%` : '--'}
                  </p>
                </div>
                <p className="max-w-[220px] text-[14px] leading-relaxed text-[#6A7C73]">
                  {t('greatProgress')}
                </p>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-[0.55fr_1.55fr]">
          <section className="min-h-[230px] overflow-hidden rounded-[10px] border border-[#E0E5E2] bg-white px-6 py-7 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.1)]">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="mb-3 text-[12px] font-bold tracking-wide text-[#4A5550]">{t('impactScore')}</p>
              <div
                className="relative flex h-[96px] w-[96px] items-center justify-center rounded-full p-[7px]"
                style={{
                  background: `conic-gradient(#0A3D25 ${scorePercent * 3.6}deg, #E3ECE7 0deg)`
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <span className="text-[28px] font-extrabold text-[#17202A]">
                    {impactScore !== null ? impactScore : '--'}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[16px] font-extrabold text-[#17202A]">{scoreStatus}</p>
              <p className="mt-0.5 text-[12px] font-medium text-[#6A756F]">
                Toward {nextMilestone} status
              </p>
            </div>
          </section>

          <Link href="/carbon-mirror" className="block">
            <section className="group relative min-h-[230px] overflow-hidden rounded-[10px] border border-[#E0E5E2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.1)]">
              <div className="grid min-h-[230px] grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative z-10 flex flex-col justify-center px-6 py-7 md:px-8">
                  <h2 className="text-[22px] font-extrabold leading-tight text-[#17202A] md:text-[24px]">
                    The Carbon Mirror
                  </h2>
                  <p className="mt-3 max-w-[410px] text-[13px] leading-relaxed text-[#4A5550]">
                    The Carbon Mirror tracks your carbon footprint and provides actionable insights. Your impact is a reflection of your daily choices. Let&apos;s make them count.
                  </p>
                  <span className="mt-5 inline-flex h-10 w-fit items-center justify-center rounded-full border-2 border-[#0A3D25] bg-white px-6 text-[12px] font-bold text-[#0A3D25] transition-colors group-hover:bg-[#E8F5E9]">
                    Open Carbon Mirror
                  </span>
                </div>
                <div className="relative min-h-[210px] overflow-hidden bg-[#F8FBF7]">
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
