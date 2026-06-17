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
import { useAuth } from '@/context/AuthContext';
import { getTodayLog } from '@/lib/actions/calculatorActions';

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

  useEffect(() => {
    const fetchResult = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const log = await getTodayLog();
        if (!log) {
          router.push('/calculator');
          return;
        }
        setTodayLog(log);
      } catch (err) {
        console.error('Error fetching today log:', err);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchResult();
    }
  }, [isAuthenticated, router]);

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
              <p>{error || 'No log data found. Please log your activities first.'}</p>
            </div>
            <Link href="/calculator" className="mt-4 inline-block">
              <Button variant="primary">Go Back to Calculator</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const emissionKg = getEmissionValue(todayLog);
  const breakdown = getBreakdown(todayLog);
  const averageEmission = 5.2;
  const percentageBelow = Math.max(0, Math.round(((averageEmission - emissionKg) / averageEmission) * 100));
  const treesEquivalent = Math.max(0.1, emissionKg / 21.77).toFixed(2);
  const distanceEquivalent = Math.max(0.1, emissionKg / 0.4).toFixed(0);
  const emissionProgress = Math.min(100, (emissionKg / averageEmission) * 100);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 font-sans md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-8">
          <h1 className="mb-2 text-[32px] font-extrabold leading-tight text-[#0A3D25] md:text-[34px]">
            Your Carbon Footprint Today
          </h1>
          <p className="text-[16px] text-[#4A5550]">
            Small steps today create a sustainable world for tomorrow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_0.95fr]">
          <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] md:p-6">
            <div className="grid min-h-[200px] grid-cols-1 items-center gap-6 md:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#4A5550]">
                  Daily Total
                </p>
                <div className="flex items-end gap-2 text-[#0A3D25]">
                  <span className="text-[58px] font-extrabold leading-none md:text-[66px]">
                    {emissionKg.toFixed(1)}
                  </span>
                  <span className="pb-2 text-[19px] font-extrabold text-[#A2CBA0]">
                    kg CO₂
                  </span>
                </div>
                <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-[13px] font-bold tracking-[0.03em] text-[#1B5E20]">
                  <Leaf size={16} fill="currentColor" />
                  Great result! {percentageBelow}% lower than your average.
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-h-[126px] rounded-lg border border-[#E0E5E2] bg-[#FAFAFA] p-4">
                  <TreePine className="mb-2 text-[#0A3D25]" size={22} fill="currentColor" />
                  <p className="text-[13px] text-[#4A5550]">Equivalent to</p>
                  <p className="text-[19px] font-bold leading-tight text-[#0A3D25]">
                    {treesEquivalent} trees
                  </p>
                  <p className="mt-1 max-w-[180px] text-[12px] leading-snug text-gray-500">
                    needed to absorb this daily
                  </p>
                </div>
                <div className="min-h-[126px] rounded-lg border border-[#E0E5E2] bg-[#FAFAFA] p-4">
                  <Car className="mb-2 text-[#0A3D25]" size={22} fill="currentColor" />
                  <p className="text-[13px] text-[#4A5550]">Equivalent to</p>
                  <p className="text-[19px] font-bold leading-tight text-[#0A3D25]">
                    {distanceEquivalent} miles
                  </p>
                  <p className="mt-1 max-w-[180px] text-[12px] leading-snug text-gray-500">
                    driven in a standard car
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl bg-[#0A3D25] p-5 md:p-6 text-white shadow-sm">
            <div className="space-y-7">
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="text-[15px] text-[#CBE3D8]">Your Emission</span>
                    <span className="text-[19px] font-bold">{emissionKg.toFixed(1)} kg</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#72B99C]"
                      style={{ width: `${emissionProgress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="text-[15px] text-[#CBE3D8]">Your Average</span>
                    <span className="text-[19px] font-bold">{averageEmission.toFixed(1)} kg</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[85%] rounded-full bg-[#72B99C]" />
                  </div>
                </div>
              </div>

              <p className="max-w-[360px] pt-12 text-[14px] italic leading-relaxed text-[#F1FFF8] md:pt-14">
                &quot;You are leading the way! Keep up the sustainable choices.&quot;
              </p>
            </div>
            <Medal
              className="absolute bottom-5 right-7 text-white/5"
              size={96}
              strokeWidth={1.4}
            />
          </section>

          <Link
            href="/carbon-mirror"
            className="block overflow-hidden rounded-xl border border-[#E0E5E2] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-md lg:row-start-2"
          >
            <div
              className="flex h-[180px] items-end bg-cover bg-center p-6"
              style={{ backgroundImage: 'url(/carbon-result-screen.png)' }}
            >
              <h2 className="text-[22px] font-extrabold !text-white">
                Carbon Mirror
              </h2>
            </div>
            <div className="p-6">
              <p className="mb-6 max-w-[720px] text-[16px] leading-relaxed text-[#4B5350]">
                Visualize the collective impact of your actions. See how small daily
                reductions add up to forests protected.
              </p>
              <div className="flex h-11 items-center justify-center gap-3 rounded-full bg-[#E8F5E9] text-[14px] font-extrabold tracking-[0.03em] text-[#1B5E20]">
                <Eye size={18} />
                View Carbon Mirror
              </div>
            </div>
          </Link>

          <section className="rounded-xl border border-[#E0E5E2] bg-white p-5 md:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)] lg:row-start-2">
            <div className="flex h-full min-h-[240px] flex-col justify-center">
              <Award className="mb-5 text-[#0A3D25]" size={28} />
              <h2 className="mb-3 text-[20px] font-bold text-[#111827]">
                Your Impact Score
              </h2>
              <p className="mb-6 max-w-[360px] text-[15px] leading-relaxed text-[#4B5350]">
                We score consistency, not perfection. Keep making small changes to see
                your impact grow over time.
              </p>
              <Link href="/score" className="block">
                <div className="flex h-11 max-w-[240px] items-center justify-center rounded-full bg-[#0A3D25] hover:bg-[#072B1A] transition-colors text-[14px] font-bold text-white">
                  View Impact Score
                </div>
              </Link>
              <div className="mt-7 grid grid-cols-2 gap-3 text-[13px] text-[#65716D]">
                <span>Transport: {(breakdown.transportKg || 0).toFixed(2)} kg</span>
                <span>Food: {(breakdown.foodKg || 0).toFixed(2)} kg</span>
                <span>Waste: {(breakdown.wasteKg || 0).toFixed(2)} kg</span>
                <span>Energy: {(breakdown.energyKg || 0).toFixed(2)} kg</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;
