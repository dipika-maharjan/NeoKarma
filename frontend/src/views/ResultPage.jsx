'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Award,
  Car,
  Eye,
  Leaf,
  Medal,
  TreePine
} from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getAppConfig } from '@/lib/actions/configActions';
import { useAuth } from '@/context/AuthContext';
import { getTodayLog } from '@/lib/actions/calculatorActions';
import { useTranslations } from 'next-intl';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';

const getEmissionValue = (log) => Number(
  log?.totalEmissionKg
    ?? log?.log?.totalEmissionKg
    ?? log?.data?.totalEmissionKg
    ?? log?.data?.log?.totalEmissionKg
    ?? log?.totalKgCO2
    ?? log?.totalEmission
    ?? 0
);

const getBreakdown = (log) => (
  log?.breakdown
    ?? log?.log?.breakdown
    ?? log?.data?.breakdown
    ?? log?.data?.log?.breakdown
    ?? {}
);

const ResultPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayLog, setTodayLog] = useState(null);
  const [error, setError] = useState(null);
  const [averageEmission, setAverageEmission] = useState(null);
  const [appConfig, setAppConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [distanceEquivalent, setDistanceEquivalent] = useState(null);
  const t = useTranslations('Result');
  const formatNumber = useNumberFormatter();

  useEffect(() => {
    const fetchResult = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const [log, config] = await Promise.all([
          getTodayLog(),
          getAppConfig().catch((err) => {
            setConfigError(t('failedToLoadConfig'));
            return null;
          })
        ]);

        if (!log) {
          router.push('/calculator');
          return;
        }

        setTodayLog(log);
        if (config) {
          setAppConfig(config);
        }

        try {
          const dash = await getDashboardSummary();
          setAverageEmission(dash?.weekly?.averagePerDay ?? null);
        } catch (e) {
          setAverageEmission(null);
        }
      } catch (err) {
        console.error('Error fetching today log:', err);
        setError(t('failedToLoadResults'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchResult();
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!todayLog) return;
    
    let mounted = true;
    async function compute() {
      try {
        const ef = await import('@/lib/api/emissionFactors');
        const map = await ef.getEmissionFactors();
        const emissionKgValue = getEmissionValue(todayLog);
        const factor = map['transportation_car'] ?? map['transportation_bus'] ?? map['transportation_motorbike'];
        if (factor && emissionKgValue) {
          const val = Math.max(0.1, emissionKgValue / factor);
          if (mounted) setDistanceEquivalent(Math.round(val));
        } else if (mounted) {
          setDistanceEquivalent('--');
        }
      } catch (err) {
        if (mounted) setDistanceEquivalent('--');
      }
    }
    compute();
    return () => { mounted = false; };
  }, [todayLog]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-10 md:px-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-6">
          <Skeleton height="h-16" />
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[2fr_0.95fr]">
            <Skeleton height="h-80" />
            <Skeleton height="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !todayLog) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-10 md:px-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-[14px] border border-[#E2E8E2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={24} />
              <p>{error || t('noLog')}</p>
            </div>
            <Link href="/calculator" className="mt-4 inline-block">
              <Button variant="primary">{t('goBack')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const emissionKg = getEmissionValue(todayLog);
  const breakdown = getBreakdown(todayLog);
  const percentageBelow = averageEmission ? Math.max(0, Math.round(((averageEmission - emissionKg) / averageEmission) * 100)) : null;
  const dailyTreeAbsorptionKg = appConfig?.dailyTreeAbsorptionKg ?? null;
  const treesEquivalent = emissionKg && dailyTreeAbsorptionKg
    ? Math.max(0.1, emissionKg / dailyTreeAbsorptionKg)
    : null;
  const emissionProgress = averageEmission ? Math.min(100, (emissionKg / averageEmission) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 font-sans md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-8">
          <h1 className="mb-2 text-[32px] font-extrabold leading-tight text-[#0A3D25] md:text-[34px]">
            {t('title')}
          </h1>
          <p className="text-[16px] text-[#4A5550]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_0.95fr]">
          {/* LEFT CARD (Total Carbon) - Shrunk from p-5/p-6 to py-4 px-5 */}
          <section className="rounded-xl border border-[#E0E5E2] bg-white py-4 px-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            {/* Removed min-h-[200px] requirement */}
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="mb-1 text-[13px] font-bold uppercase tracking-[0.14em] text-[#4A5550]">
                  {t('dailyTotal')}
                </p>
                <div className="flex items-end gap-2 text-[#0A3D25]">
                  <span className="text-[58px] font-extrabold leading-none md:text-[66px]">
                    {formatNumber(emissionKg, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="pb-1 text-[19px] font-extrabold text-[#A2CBA0]">
                    {t('unitKgCO2')}
                  </span>
                </div>
                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-1.5 text-[13px] font-bold tracking-[0.03em] text-[#1B5E20]">
                  <Leaf size={16} fill="currentColor" />
                  {percentageBelow !== null ? t('greatResult', { percentage: percentageBelow }) : t('dailyResultAvailable')}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Reduced inner grid min-h from 126px to 100px and compacted padding */}
                <div className="min-h-[100px] rounded-lg border border-[#E0E5E2] bg-[#FAFAFA] p-3 flex flex-col justify-between">
                  <div>
                    <TreePine className="mb-1 text-[#0A3D25]" size={20} fill="currentColor" />
                    <p className="text-[12px] text-[#4A5550]">{t('equivalentTo')}</p>
                    <p className="text-[18px] font-bold leading-tight text-[#0A3D25]">
                      {treesEquivalent ? t('treesEquivalent', { count: formatNumber(Number(treesEquivalent), {}) }) : '--'}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] leading-tight text-gray-500">
                    {t('neededToAbsorb')}
                  </p>
                </div>
                
                {/* Reduced inner grid min-h from 126px to 100px and compacted padding */}
                <div className="min-h-[100px] rounded-lg border border-[#E0E5E2] bg-[#FAFAFA] p-3 flex flex-col justify-between">
                  <div>
                    <Car className="mb-1 text-[#0A3D25]" size={20} fill="currentColor" />
                    <p className="text-[12px] text-[#4A5550]">{t('equivalentTo')}</p>
                    <p className="text-[18px] font-bold leading-tight text-[#0A3D25]">
                      {distanceEquivalent && distanceEquivalent !== '--' ? t('milesEquivalent', { count: formatNumber(Number(distanceEquivalent), {}) }) : '--'}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] leading-tight text-gray-500">
                    {t('drivenInCar')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT CARD (Comparison Panel) - Shrunk using py-4 and tighter layout flex */}
          <section className="relative overflow-hidden rounded-xl bg-[#0A3D25] py-4 px-5 text-white shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <span className="text-[14px] text-[#CBE3D8]">{t('yourEmission')}</span>
                  <span className="text-[18px] font-bold">{formatNumber(emissionKg, { maximumFractionDigits: 1 })} {t('unitKgCO2')}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#72B99C]"
                    style={{ width: `${emissionProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <span className="text-[14px] text-[#CBE3D8]">{t('yourAverage')}</span>
                  <span className="text-[18px] font-bold">{averageEmission ? formatNumber(averageEmission, { maximumFractionDigits: 1 }) : '--'} {t('unitKgCO2')}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[85%] rounded-full bg-[#72B99C]" />
                </div>
              </div>
            </div>

            {/* Changed from heavy top padding (pt-12/pt-14) to a clean mt-4 margin */}
            <p className="max-w-[360px] mt-4 text-[13px] italic leading-relaxed text-[#F1FFF8]">
              {t('quote')}
            </p>
            <Medal
              className="absolute bottom-2 right-4 text-white/5"
              size={80}
              strokeWidth={1.4}
            />
          </section>

          {/* ROW 2 - REMAINED UNTOUCHED */}
          <Link
            href="/carbon-mirror"
            className="block overflow-hidden rounded-xl border border-[#E0E5E2] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-md lg:row-start-2"
          >
            <div
              className="flex h-[180px] items-end bg-cover bg-center p-6"
              style={{ backgroundImage: 'url(/carbon-result-screen.png)' }}
            >
              <h2 className="text-[22px] font-extrabold !text-white">
                {t('carbonMirrorTitle')}
              </h2>
            </div>
            <div className="p-6">
              <p className="mb-6 max-w-[720px] text-[16px] leading-relaxed text-[#4B5350]">
                {t('carbonMirrorDescription')}
              </p>
              <div className="flex h-11 items-center justify-center gap-3 rounded-full bg-[#E8F5E9] text-[14px] font-extrabold tracking-[0.03em] text-[#1B5E20]">
                <Eye size={18} />
                {t('viewCarbonMirror')}
              </div>
            </div>
          </Link>

          <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 md:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)] lg:row-start-2">
            <div className="flex h-full min-h-[240px] flex-col justify-center">
              <Award className="mb-5 text-[#0A3D25]" size={28} />
              <h2 className="mb-3 text-[20px] font-bold text-[#111827]">
                {t('impactScoreTitle')}
              </h2>
              <p className="mb-6 max-w-[360px] text-[15px] leading-relaxed text-[#4B5350]">
                {t('impactScoreDesc')}
              </p>
              <Link href="/score" className="block">
                <div className="flex h-11 max-w-[240px] items-center justify-center rounded-full bg-[#0A3D25] hover:bg-[#072B1A] transition-colors text-[14px] font-bold text-white">
                  {t('viewImpactScore')}
                </div>
              </Link>
              <div className="mt-7 grid grid-cols-2 gap-3 text-[13px] text-[#65716D]">
                <span>{t('transport')}: {formatNumber(breakdown.transportKg || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('unitKgCO2')}</span>
                <span>{t('food')}: {formatNumber(breakdown.foodKg || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('unitKgCO2')}</span>
                <span>{t('waste')}: {formatNumber(breakdown.wasteKg || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('unitKgCO2')}</span>
                <span>{t('energy')}: {formatNumber(breakdown.energyKg || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('unitKgCO2')}</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;