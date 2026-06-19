'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  BadgeCheck,
  Bus,
  Droplet,
  Leaf,
  Share2,
  Skull,
  Sparkles,
} from 'lucide-react';
import { getCarbonMirror } from '@/lib/actions/mirrorActions';
import { getAppConfig } from '@/lib/actions/configActions';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';

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
  const [appConfig, setAppConfig] = useState(null);
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
        const data = await getCarbonMirror(locale);
        if (data) {
          setMirrorData(data);
        }
      } catch (err) {
        console.error('Error loading mirror data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, router]);

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
  const summaryMessage = comparison?.message || t('trackProgressDefault');

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

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1500px]">
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
              {monthlyMirror.kgCO2
                ? t('trendPlaceholder')
                : t('addMoreLogs')}
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
