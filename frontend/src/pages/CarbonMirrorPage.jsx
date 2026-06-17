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
import { useAuth } from '@/context/AuthContext';

const CARD_CLASS = 'rounded-[10px] border border-[#E0E5E2] bg-white';
const CARD_PADDING = 'p-5 md:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]';
const EYEBROW_CLASS = 'text-[13px] font-bold uppercase tracking-wider text-[#4A5550]';
const BODY_CLASS = 'text-[16px] text-[#4A5550]';
const CARD_TITLE_CLASS = 'text-[18px] font-bold leading-tight';

const CarbonMirrorPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mirrorData, setMirrorData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const data = await getCarbonMirror();
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

  if (!isAuthenticated) {
    return null;
  }

  const mirrorPayload = mirrorData?.data ?? mirrorData ?? {};
  const totalEmitted = Number(
    mirrorPayload?.thisMonth?.kgCO2
      ?? mirrorPayload?.today?.kgCO2
      ?? mirrorPayload?.monthly?.totalEmissionKg
      ?? mirrorPayload?.totalEmissionKg
      ?? mirrorPayload?.totalKgCO2
      ?? 11.8
  );
  const comparison = mirrorPayload?.monthComparison ?? {};
  const comparedDelta = Number(comparison?.deltaKg ?? 0);
  const lastMonthEmitted = Number(
    comparison?.previousKg
      ?? mirrorPayload?.lastMonth?.kgCO2
      ?? mirrorPayload?.lastMonthKgCO2
      ?? (comparedDelta
        ? totalEmitted + (comparison?.direction === 'worsened' ? -comparedDelta : comparedDelta)
        : 14.2)
  );
  const improvement = Number(
    comparison?.direction === 'worsened'
      ? 0
      : comparison?.percentChange
        ?? Math.max(0, Math.round(((lastMonthEmitted - totalEmitted) / lastMonthEmitted) * 100))
  );
  const currentScore = mirrorPayload?.impactScore ?? mirrorData?.impactScore ?? 82;
  const scoreGoal = 94;

  const shareInsight = () => {
    const shareText = `I emitted ${totalEmitted.toFixed(1)} kg CO2 this month and improved ${improvement}% from last month.`;

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
              This is your carbon mirror
            </h1>
            <p className={BODY_CLASS}>This Month&apos;s Impact Overview</p>
          </div>

          <div className={`${CARD_CLASS} flex items-center justify-between gap-6 border-[#E0E5E2] px-5 py-4`}>
            <div>
              <p className={`mb-1 ${EYEBROW_CLASS}`}>You Emitted</p>
              <p className="text-[20px] font-extrabold leading-none text-[#0A3D25]">
                {totalEmitted.toFixed(1)} <span className="text-[14px]">kg CO₂</span>
              </p>
              <p className="mt-1.5 text-[13px] font-bold text-[#1B5E20]">
                ~ {improvement}% better than last month
              </p>
            </div>

            <div className="hidden h-10 w-px bg-gray-100 sm:block" />

            <button
              type="button"
              onClick={shareInsight}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0A3D25] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#072B1A]"
            >
              <Share2 size={16} />
              Share insight
            </button>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className={`${CARD_CLASS} ${CARD_PADDING} border-[#FFCDD2] bg-[#FFEBEE]`}>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFCDD2] text-[#D32F2F]">
                <AlertTriangle size={18} />
              </span>
              <h2 className={`${CARD_TITLE_CLASS} text-[#C62828]`}>Environmental Cost</h2>
            </div>

            <div className="relative mb-5 h-[200px] overflow-hidden rounded-xl">
              <Image
                src="/carbonmirror1.png"
                alt="Dry cracked ground showing environmental cost"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[18px] font-extrabold leading-tight !text-white">
                  Cutting down half a tree
                </p>
                <p className="text-[14px] font-normal !text-white/85">
                  Current monthly footprint equivalent
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-[#FFCDD2] bg-white px-4 py-3 text-[#17202A]">
                <Skull size={18} className="text-[#D32F2F]" />
                <span className="text-[14px] font-semibold">Particulate matter generated: </span>
                <span className="text-[14px] font-extrabold text-[#D32F2F]">12g</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#FFCDD2] bg-white px-4 py-3 text-[#17202A]">
                <Droplet size={18} className="text-[#D32F2F]" />
                <span className="text-[14px] font-semibold">Indirect water pollution: </span>
                <span className="text-[14px] font-extrabold text-[#D32F2F]">15L</span>
              </div>
            </div>
          </div>

          <div className={`${CARD_CLASS} ${CARD_PADDING} border-[#C8E6C9] bg-[#E8F5E9]`}>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8E6C9] text-[#1B5E20]">
                <Leaf size={18} fill="currentColor" />
              </span>
              <h2 className={`${CARD_TITLE_CLASS} text-[#1B5E20]`}>Positive Progress</h2>
            </div>

            <div className="relative mb-5 h-[200px] overflow-hidden rounded-xl">
              <Image
                src="/carbonmirror2.png"
                alt="Young trees growing in healthy soil"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[18px] font-extrabold leading-tight !text-white">
                  2 trees this month
                </p>
                <p className="text-[14px] font-normal !text-white/85">
                  Saved through collective improvement
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-[#C8E6C9] bg-white/70 px-4 py-3 text-[#17202A]">
                <BadgeCheck size={18} className="text-[#1B5E20]" fill="currentColor" />
                <span className="text-[14px] font-semibold">Emissions avoided: </span>
                <span className="text-[14px] font-extrabold text-[#1B5E20]">4.2kg</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#C8E6C9] bg-white/70 px-4 py-3 text-[#17202A]">
                <Sparkles size={18} className="text-[#1B5E20]" fill="currentColor" />
                <span className="text-[14px] font-semibold">This month&apos;s improvement: </span>
                <span className="text-[14px] font-extrabold text-[#1B5E20]">10%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className={`${CARD_CLASS} border-[#E0E5E2] p-5`}>
            <h3 className={`mb-1 ${EYEBROW_CLASS}`}>What If We Change?</h3>
            <p className="mb-4 text-[15px] font-bold text-[#0A3D25]">
              Small habits, big results
            </p>
            <p className={`mb-4 max-w-[230px] ${BODY_CLASS}`}>
              If you switch to the bus twice a week:
            </p>
            <div className="flex items-center gap-4 rounded-lg bg-[#C7EEDC] px-4 py-4 text-[#0A3D25]">
              <Bus size={22} />
              <div>
                <p className="text-[15px] font-bold">
                  Save 42 kg CO₂
                </p>
                <p className="text-[13px] text-[#0A3D25]/90 font-medium">
                  Estimated monthly reduction
                </p>
              </div>
            </div>
          </div>

          <div className={`${CARD_CLASS} border-[#E0E5E2] p-5 md:p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]`}>
            <h3 className={`mb-6 ${EYEBROW_CLASS}`}>Monthly Trend</h3>
            <div className="flex h-[88px] items-end gap-2">
              {[58, 78, 44, 28].map((height, index) => (
                <div
                  key={height}
                  className={`w-[42px] rounded-t-md ${
                    index === 3 ? 'bg-[#0A3D25]' : 'bg-[#E1E8E5]'
                  }`}
                  style={{ height }}
                />
              ))}
              {[24, 18, 12].map((height) => (
                <div
                  key={height}
                  className="w-[42px] rounded-t-md border-2 border-dashed border-[#E1E8E5]"
                  style={{ height }}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-[13px] font-semibold text-[#4A5550]">
              <span>Jan</span>
              <span className="font-bold text-[#0A3D25]">(April)</span>
              <span>July</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[10px] bg-[#0A3D25] p-5 md:p-6 text-white shadow-sm">
            <div className="absolute -bottom-7 -right-8 h-24 w-24 rounded-full border-[11px] border-white/10" />
            <h3 className={`${CARD_TITLE_CLASS} mb-2 !text-white`}>Next Milestone</h3>
            <p className="mb-6 text-[14px] leading-relaxed !text-white/80">
              Improve your score by 12 points to save 2 trees.
            </p>
            <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-[#CBE3D8]">
              <span>Current: {currentScore}/100</span>
              <span>Goal: {scoreGoal}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#A8E0C7]"
                style={{ width: `${Math.min(100, (currentScore / scoreGoal) * 100)}%` }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CarbonMirrorPage;
