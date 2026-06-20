'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bus,
  CalendarDays,
  Flame,
  Leaf,
  Lock,
  Route,
  Share2,
  TreePine
} from 'lucide-react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { getCarbonMirror } from '@/lib/actions/mirrorActions';
import { getDailyLogHistory } from '@/lib/actions/calculatorActions';
import { getAppConfig } from '@/lib/actions/configActions';
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getTodayLog } from '@/lib/actions/calculatorActions';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';
import PhaseUnlockCelebration from '@/components/PhaseUnlockCelebration';

const CARD_CLASS = 'rounded-[10px] border border-[#E0E5E2] bg-white';
const CARD_PADDING = 'p-5 md:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]';
const EYEBROW_CLASS = 'text-[13px] font-bold uppercase tracking-wider text-[#4A5550]';
const BODY_CLASS = 'text-[16px] text-[#4A5550]';
const CARD_TITLE_CLASS = 'text-[18px] font-bold leading-tight';

const CarbonMirrorPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [mirrorData, setMirrorData] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [appConfig, setAppConfig] = useState(null);
  const [phaseData, setPhaseData] = useState(null);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [error, setError] = useState(null);
  const t = useTranslations('CarbonMirror');
  const tImg = useTranslations('Images');
  const tResult = useTranslations('Result');
  const formatNumber = useNumberFormatter();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        setError(null);
        const attempts = 2;
        let summary = null;
        let todayLog = null;
        for (let i = 0; i < attempts; i++) {
          try {
            [summary, todayLog] = await Promise.all([getDashboardSummary(), getTodayLog()]);
            break;
          } catch (e) {
            if (i === attempts - 1) throw e;
            await new Promise((r) => setTimeout(r, 250));
          }
        }

        setPhaseData(summary);
        setHasLoggedToday(!!todayLog);

        if (summary?.phase !== 'onboarding') {
          const data = await getCarbonMirror();
          if (data) {
            setMirrorData(data);
          }
        }
      } catch (err) {
        console.error('Error loading mirror data:', err);
        setError(err?.message || 'Failed to load mirror data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, router, locale]);

  useEffect(() => {
    let mounted = true;

    const loadConfig = async () => {
      try {
        const config = await getAppConfig();
        if (mounted) setAppConfig(config);
      } catch (err) {
        console.error('Unable to load app config for mirror page:', err);
      }
    };

    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const mirrorPayload = mirrorData?.data ?? mirrorData ?? {};
  const todayMirror = mirrorPayload?.today ?? {};
  const monthlyMirror = mirrorPayload?.thisMonth ?? {};
  const comparison = mirrorPayload?.monthComparison ?? {};
  const totalEmitted = Number(monthlyMirror.kgCO2 ?? todayMirror.kgCO2 ?? 0);
  const improvement = comparison?.direction === 'worsened'
    ? 0
    : Number.isFinite(comparison?.percentChange)
      ? comparison.percentChange
      : null;
  const currentScore = Number.isFinite(mirrorPayload?.impactScore)
    ? mirrorPayload.impactScore
    : null;
  const scoreGoal = appConfig?.impactScoreGoal;
  const scoreGoalText = scoreGoal ?? 'Loading…';
  const progressPercent = currentScore !== null && scoreGoal ? Math.min(100, (currentScore / scoreGoal) * 100) : 0;
  const mirrorStatus = todayMirror.status || monthlyMirror.status || 'balanced';
  const summaryMessage = comparison?.message || 'Track your progress month over month.';
  const totalLogsCount = phaseData?.totalLogsCount ?? 0;
  const daysUntilPersonalized = phaseData?.daysUntilPersonalized ?? Math.max(0, 30 - totalLogsCount);
  const onboardingProgress = Math.min(100, (totalLogsCount / 30) * 100);

  const shareInsight = () => {
    const kg = formatNumber(totalEmitted, { maximumFractionDigits: 1 });
    const improvementPart = improvement !== null ? ` and improved ${formatNumber(improvement, { maximumFractionDigits: 0 })}% from last month` : '';
    const shareText = t('shareText', { kg, improvementPart });

    if (navigator.share) {
      navigator.share({
        title: 'My Carbon Mirror',
        text: shareText,
        url: window.location.href,
      });
      return;
    }

    navigator.clipboard?.writeText(shareText);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8ff] px-6 py-10 font-sans">
        <div className="mx-auto max-w-[1840px] animate-pulse space-y-8">
          <div className="h-24 rounded-lg bg-white" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-[520px] rounded-lg bg-white" />
            <div className="h-[520px] rounded-lg bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff6f6] px-6 py-10 font-sans">
        <div className="mx-auto max-w-[900px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#B33B2E]">Could not load Carbon Mirror</h2>
            <p className="mt-3 text-sm text-[#4A3F2F]">{error}</p>
            <div className="mt-4 flex gap-3">
              <button onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const [summary, todayLog] = await Promise.all([getDashboardSummary(), getTodayLog()]);
                  setPhaseData(summary);
                  setHasLoggedToday(!!todayLog);
                  if (summary?.phase !== 'onboarding') {
                    const data = await getCarbonMirror();
                    setMirrorData(data);
                  }
                } catch (err) {
                  setError(err?.message || 'Retry failed');
                } finally {
                  setLoading(false);
                }
              }} className="inline-flex items-center gap-2 rounded-full bg-[#0A3D25] px-4 py-2 text-white">Retry</button>
              <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 rounded-full border px-4 py-2">Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phaseData?.phase === 'onboarding') {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
        <div className="carbon-onboarding-shell mx-auto w-full max-w-[1500px] space-y-8">
          <section className="relative overflow-hidden rounded-[32px] border border-[#E6F0E9] bg-white p-10 shadow-[0_30px_60px_rgba(10,61,37,0.08)] md:p-12">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0A3D25] via-[#2A7A4D] to-[#77C9A6]" />
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[#0A3D25]/75">
                  Personalized insights unlock soon
                </p>
                <h1 className="text-[32px] font-extrabold leading-tight text-[#0A3D25] md:text-[38px]">
                  Your Carbon Mirror is forming
                </h1>
                <p className="hidden">
                  तपाईंको कार्बन दर्पण बन्दैछ
                </p>
                <p className="mt-1 text-[18px] font-bold text-[#1B5E20]">
                  {'\u0924\u092A\u093E\u0908\u0902\u0915\u094B \u0915\u093E\u0930\u094D\u092C\u0928 \u0926\u0930\u094D\u092A\u0923 \u092C\u0928\u094D\u0926\u0948\u091B'}
                </p>
                <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#33443D]">
                  Log your daily habits for 30 days and we will show you your class&apos;s collective environmental story in trees saved, water protected, and real Nepal impact.
                </p>
                <div className="mt-6 max-w-2xl">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0A3D25] mr-2" />
                    <div className="flex-1 text-[13px] font-semibold text-[#0A3D25]">{totalLogsCount} days logged</div>
                    <div className="text-[13px] font-medium text-[#2E5F3F]">{daysUntilPersonalized} days to unlock</div>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0A3D25] via-[#2A7A4D] to-[#77C9A6] transition-all duration-700"
                      style={{ width: `${onboardingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => router.push('/carbon-mirror/intro')}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#0A3D25] bg-white px-6 text-[15px] font-semibold text-[#0A3D25] transition-colors hover:bg-[#F6FFF7] shadow-sm"
                  >
                    See how Carbon Mirror works
                  </button>
                  {hasLoggedToday ? (
                    <button
                      type="button"
                      onClick={() => router.push('/calculator/result')}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A3D25] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#072B1A] shadow"
                    >
                      See today&apos;s log
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push('/calculator')}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A3D25] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#072B1A] shadow"
                    >
                      Log Today →
                    </button>
                  )}
                </div>
              </div>

              <div className="relative mx-auto h-64 w-64 rounded-full bg-white shadow-[0_28px_80px_rgba(10,61,37,0.12)] flex items-center justify-center">
                <div className="absolute h-[92%] w-[92%] rounded-full border border-[#E6F3EA]" />
                <div className="absolute h-[80%] w-[80%] rounded-full border border-[#EEF7F0]" />
                <div className="absolute h-[70%] w-[70%] overflow-hidden rounded-full border border-[#DDEFE0]">
                  <Image src="/earth_gauge_bg.png" alt="" fill className="object-cover opacity-95 grayscale-[8%]" />
                </div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 rounded-full bg-white px-5 py-3 text-center shadow-sm">
                  <p className="text-[13px] font-extrabold tracking-wider text-[#0A3D25]">{totalLogsCount}/30 DAYS</p>
                  <p className="mt-1 text-[12px] font-medium text-[#4A5550]">Your baseline is being built</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-extrabold text-[#17202A]">Here is what you will see</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {[
                {
                  title: 'Environmental Cost',
                  line: 'Cutting down X trees',
                  caption: "This will show your class's environmental footprint as real-world impact",
                  bg: 'bg-[#FFFBF8]',
                  border: 'border-[#F5DED8]',
                  text: 'text-[#B33B2E]',
                  img: '/carbonmirror1.png'
                },
                {
                  title: 'Positive Progress',
                  line: 'Trees you protected',
                  caption: 'This will show how your collective improvement is making a difference',
                  bg: 'bg-[#F4FBF5]',
                  border: 'border-[#D7E8D4]',
                  text: 'text-[#1B5E20]',
                  img: '/carbonmirror2.png'
                }
              ].map((card) => (
                <div key={card.title} className={`overflow-hidden rounded-[28px] border ${card.border} ${card.bg} p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]`}>
                  <div className="relative mb-6 h-[200px] overflow-hidden rounded-[24px]">
                    <Image src={card.img} alt="" fill className="object-cover grayscale opacity-65 blur-[1px]" />
                    <div className="absolute inset-0 bg-white/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[#0A3D25] shadow-lg">
                        <Lock size={24} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-[20px] font-extrabold ${card.text}`}>{card.title}</h3>
                    <p className="mt-2 text-[16px] font-bold text-[#17202A]">{card.line}</p>
                  </div>
                  <p className="mt-5 text-[14px] leading-relaxed text-[#4A5550]">{card.caption}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-extrabold text-[#17202A]">Small actions, visible impact</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ['Class impact story', 'See whether your class is reducing tree loss or protecting more trees as daily logs build up.', TreePine, 'text-green-700 bg-green-50'],
                ['What-if choices', 'Preview how simple switches, like taking the bus twice a week, can lower class emissions.', Route, 'text-amber-700 bg-amber-50'],
                ['Monthly progress', 'Track how your class changes month by month once the 30-day baseline is ready.', CalendarDays, 'text-teal-700 bg-teal-50']
              ].map(([title, body, Icon, color]) => (
                <div key={title} className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <span className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
                    <Icon size={20} />
                  </span>
                  <h3 className="text-[18px] font-extrabold text-[#17202A]">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#4A5550]">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] bg-[#0A3D25] px-8 py-8 text-white shadow-[0_24px_60px_rgba(10,61,37,0.16)] md:flex md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-[26px] font-extrabold !text-white">Keep your mirror growing</h2>
              <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold !text-white/85">
                <Flame size={18} className="text-[#F4C06A]" />
                {totalLogsCount} day streak - keep going!
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(hasLoggedToday ? '/calculator/result' : '/calculator')}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-[15px] font-bold text-[#0A3D25] transition-colors hover:bg-[#E8F5E9] md:mt-0"
            >
              {hasLoggedToday ? 'See today\'s log' : 'Log Today\'s Carbon →'}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <PhaseUnlockCelebration summary={phaseData} />
      <div className="mx-auto w-full max-w-[1500px]">
        {daysUntilPersonalized > 0 && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-[#F2E3C4] bg-[#FFF8EE] p-6 shadow-[0_6px_24px_rgba(34,28,15,0.04)]">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-[78%]">
                <div className="mb-3 inline-flex items-center gap-3">
                  <span className="rounded-full bg-[#FFF1D9] px-3 py-1 text-[12px] font-bold text-[#B36B10]">STARTER PHASE</span>
                </div>
                <h2 className="text-[26px] font-extrabold text-[#2F2A1F]">Your personalized AI plan unlocks after 30 days of logging</h2>
                <p className="mt-2 text-[15px] text-[#4A3F2F]">While your personalized plan is being prepared, start with practical actions that fit rural Nepal homes, schools, and communities.</p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-[#164224]">
                    <span>{totalLogsCount} of 30 days completed</span>
                    <span className="text-sm font-medium text-[#164224]">{daysUntilPersonalized} days left</span>
                  </div>
                  <div className="h-3 rounded-full bg-white overflow-hidden">
                    <div className="h-full rounded-full bg-[#0A3D25]" style={{ width: `${onboardingProgress}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(hasLoggedToday ? '/calculator/result' : '/calculator')}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A3D25] px-6 text-[15px] font-bold text-white hover:bg-[#072B1A]"
                >
                  {hasLoggedToday ? 'See today\'s log' : 'Log Today →'}
                </button>
              </div>
            </div>
          </section>
        )}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-[32px] font-extrabold leading-tight text-[#0A3D25] md:text-[34px]">
              {t('title')}
            </h1>
            <p className={BODY_CLASS}>{t('overview')}</p>
          </div>

          <div className={`${CARD_CLASS} flex items-center justify-between gap-6 border-[#E0E5E2] px-5 py-4`}>
            <div>
              <p className={`mb-1 ${EYEBROW_CLASS}`}>{t('youEmitted')}</p>
              <p className="text-[20px] font-extrabold leading-none text-[#0A3D25]">
                {formatNumber(totalEmitted, { maximumFractionDigits: 1 })} <span className="text-[14px]">{tResult('unitKgCO2')}</span>
              </p>
              <p className="mt-1.5 text-[13px] font-bold text-[#1B5E20]">
                {improvement !== null ? t('improvementText', { improvement }) : ''}
              </p>
            </div>

            <div className="hidden h-10 w-px bg-gray-100 sm:block" />

            <button
              type="button"
              onClick={shareInsight}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0A3D25] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#072B1A]"
            >
              <Share2 size={16} />
              {t('shareInsight')}
            </button>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className={`${CARD_CLASS} ${CARD_PADDING} border-[#FFCDD2] bg-[#FFEBEE]`}>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFCDD2] text-[#D32F2F]">
                <AlertTriangle size={18} />
              </span>
              <h2 className={`${CARD_TITLE_CLASS} text-[#C62828]`}>{t('environmentalCost')}</h2>
            </div>

            <div className="relative mb-5 h-[200px] overflow-hidden rounded-xl">
              <Image
                src="/carbonmirror1.png"
                alt="Environmental impact illustration"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[18px] font-extrabold leading-tight !text-white">
                  {todayMirror.treesEquivalent ? t('treesEquivalentToday', { count: formatNumber(todayMirror.treesEquivalent, {}) }) : t('currentTreeEquivalence')}
                </p>
                <p className="text-[14px] font-normal !text-white/85">
                  {todayMirror.story || t('latestDaily')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {todayMirror.story ? (
                <div className="rounded-lg border border-[#FFCDD2] bg-white px-4 py-4 text-[#17202A]">
                  <p className="text-[14px]">{todayMirror.story}</p>
                </div>
              ) : (
                <div className="rounded-lg border border-[#FFCDD2] bg-white px-4 py-4 text-[#17202A]">
                  <p className="text-[14px]">{t('dailyMirrorPlaceholder')}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`${CARD_CLASS} ${CARD_PADDING} border-[#C8E6C9] bg-[#E8F5E9]`}>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8E6C9] text-[#1B5E20]">
                <Leaf size={18} fill="currentColor" />
              </span>
              <h2 className={`${CARD_TITLE_CLASS} text-[#1B5E20]`}>{t('positiveProgress')}</h2>
            </div>

            <div className="relative mb-5 h-[200px] overflow-hidden rounded-xl">
              <Image
                src="/carbonmirror2.png"
                alt="Positive progress visualization"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[18px] font-extrabold leading-tight !text-white">
                  {monthlyMirror.treesEquivalent ? t('treesEquivalentThisMonth', { count: formatNumber(monthlyMirror.treesEquivalent, {}) }) : t('monthlyMirrorSummary')}
                </p>
                <p className="text-[14px] font-normal !text-white/85">
                  {summaryMessage}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {comparison?.direction ? (
                <div className="rounded-lg border border-[#C8E6C9] bg-white/70 px-4 py-4 text-[#17202A]">
                  <p className="text-[14px]">{comparison.message}</p>
                </div>
              ) : (
                <div className="rounded-lg border border-[#C8E6C9] bg-white/70 px-4 py-4 text-[#17202A]">
                  <p className="text-[14px]">{t('monthlyComparisonPlaceholder')}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className={`${CARD_CLASS} border-[#E0E5E2] p-5`}>
            <h3 className={`mb-1 ${EYEBROW_CLASS}`}>{t('whatIfTitle')}</h3>
            <p className="mb-4 text-[15px] font-bold text-[#0A3D25]">
              {t('smallHabits')}
            </p>
            <p className={`mb-4 max-w-[230px] ${BODY_CLASS}`}>
              {t('useLoggedData')}
            </p>
            <div className="flex items-center gap-4 rounded-lg bg-[#C7EEDC] px-4 py-4 text-[#0A3D25]">
              <Bus size={22} />
              <div>
                <p className="text-[15px] font-bold">
                  {t('compareChoices')}
                </p>
                <p className="text-[13px] text-[#0A3D25]/90 font-medium">
                  {t('simulationsNote')}
                </p>
              </div>
            </div>
          </div>

          <div className={`${CARD_CLASS} border-[#E0E5E2] p-5 md:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]`}>
            <h3 className={`mb-6 ${EYEBROW_CLASS}`}>{t('monthlyTrend')}</h3>
            <div className="min-h-[88px] rounded-xl border border-dashed border-[#E1E8E5] bg-[#F7FCF8] p-6 text-[14px] leading-relaxed text-[#4A5550]">
              {dailyHistory.length > 0 ? (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#E5F2E8" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => value.slice(5)} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip formatter={(value) => `${formatNumber(value, { maximumFractionDigits: 1 })} kg`} />
                      <Area type="monotone" dataKey="totalEmissionKg" stroke="#0A3D25" fill="#D0E8D7" fillOpacity={0.7} strokeWidth={2} />
                      <Line type="monotone" dataKey="totalEmissionKg" stroke="#0A3D25" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                t('addMoreLogs')
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[10px] bg-[#0A3D25] p-5 md:p-6 text-white shadow-sm">
            <div className="absolute -bottom-7 -right-8 h-24 w-24 rounded-full border-[11px] border-white/10" />
            <h3 className={`${CARD_TITLE_CLASS} mb-2 !text-white`}>{t('nextMilestone')}</h3>
            <p className="mb-6 text-[14px] leading-relaxed !text-white/80">
              {t('keepImproving')}
            </p>
            <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-[#CBE3D8]">
              <span>{t('currentLabel')} {currentScore !== null ? `${formatNumber(currentScore, {})}/100` : '--'}</span>
              <span>{t('goalLabel')} {scoreGoalText}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#A8E0C7]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CarbonMirrorPage;
