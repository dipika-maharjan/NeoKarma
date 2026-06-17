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

const CARD_CLASS = 'rounded-lg border bg-white';
const CARD_PADDING = 'px-8 py-8';
const EYEBROW_CLASS = 'text-[13px] font-extrabold uppercase tracking-widest text-[#3f4845]';
const BODY_CLASS = 'text-[16px] font-medium leading-6 text-[#4f5755]';
const CARD_TITLE_CLASS = 'text-[16px] font-semibold leading-6';

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
    <main className="bg-[#f8f8ff] px-6 pb-20 pt-16 font-sans md:px-12">
      <div className="mx-auto max-w-[1840px]">
        <section className="mb-8 grid items-end gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h1 className="mb-2 text-[34px] font-extrabold leading-tight text-[#073f31]">
              This is your carbon mirror
            </h1>
            <p className={BODY_CLASS}>This Month&apos;s Impact Overview</p>
          </div>

          <div className={`${CARD_CLASS} flex items-center justify-between gap-8 border-[#e5e8e7] px-6 py-6`}>
            <div>
              <p className={`mb-1 ${EYEBROW_CLASS}`}>You Emitted</p>
              <p className="text-[22px] font-extrabold leading-none text-[#073f31]">
                {totalEmitted.toFixed(1)} <span className="text-[15px]">kg CO<sub>2</sub></span>
              </p>
              <p className="mt-2 text-[13px] font-extrabold text-[#00a86b]">
                ~ {improvement}% better than last month
              </p>
            </div>

            <div className="hidden h-12 w-px bg-[#e7ebe9] sm:block" />

            <button
              type="button"
              onClick={shareInsight}
              className="inline-flex items-center gap-2 rounded-lg bg-[#073f31] px-7 py-4 text-[16px] font-semibold text-white transition hover:bg-[#052f25]"
            >
              <Share2 size={20} />
              Share this insight
            </button>
          </div>
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className={`${CARD_CLASS} ${CARD_PADDING} border-[#ffd5d1] bg-[#fffafb]`}>
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffd9d8] text-[#ff4040]">
                <AlertTriangle size={20} />
              </span>
              <h2 className={`${CARD_TITLE_CLASS} text-[#8d1717]`}>Environmental Cost</h2>
            </div>

            <div className="relative mb-6 h-[255px] overflow-hidden rounded-lg">
              <Image
                src="/carbonmirror1.png"
                alt="Dry cracked ground showing environmental cost"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-4 text-white">
                <p className="text-[20px] font-extrabold leading-tight !text-white">
                  Cutting down half a tree
                </p>
                <p className="text-[16px] font-medium !text-white">
                  Current monthly footprint equivalent
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-[#ffbeb9] bg-white px-4 py-4 text-[#222833]">
                <Skull size={22} className="text-[#ff4040]" />
                <span className="text-[16px] font-medium">Particulate matter generated: </span>
                <span className="text-[16px] font-medium text-[#ff4040]">12g</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#ffbeb9] bg-white px-4 py-4 text-[#222833]">
                <Droplet size={22} className="text-[#ff4040]" />
                <span className="text-[16px] font-medium">Indirect water pollution: </span>
                <span className="text-[16px] font-medium text-[#ff4040]">15L</span>
              </div>
            </div>
          </div>

          <div className={`${CARD_CLASS} ${CARD_PADDING} border-[#bff4df] bg-[#f1fffb]`}>
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8f5dc] text-[#00a86b]">
                <Leaf size={20} fill="currentColor" />
              </span>
              <h2 className={`${CARD_TITLE_CLASS} text-[#006c54]`}>Positive Progress</h2>
            </div>

            <div className="relative mb-6 h-[255px] overflow-hidden rounded-lg">
              <Image
                src="/carbonmirror2.png"
                alt="Young trees growing in healthy soil"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-4 text-white">
                <p className="text-[20px] font-extrabold leading-tight !text-white">
                  2 trees this month
                </p>
                <p className="text-[16px] font-medium !text-white">
                  Saved through collective improvement
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-[#75e8bb] bg-white/70 px-4 py-4 text-[#222833]">
                <BadgeCheck size={22} className="text-[#00a86b]" fill="currentColor" />
                <span className="text-[16px] font-medium">Emissions avoided: </span>
                <span className="text-[16px] font-medium text-[#00866a]">4.2kg</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#75e8bb] bg-white/70 px-4 py-4 text-[#222833]">
                <Sparkles size={22} className="text-[#00a86b]" fill="currentColor" />
                <span className="text-[16px] font-medium">This month&apos;s improvement: </span>
                <span className="text-[16px] font-medium text-[#00866a]">10%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className={`${CARD_CLASS} border-[#e3e7e5] p-6`}>
            <h3 className={`mb-2 ${EYEBROW_CLASS}`}>What If We Change?</h3>
            <p className="mb-6 text-[16px] font-medium text-[#073f31]">
              Small habits, big results
            </p>
            <p className={`mb-6 max-w-[230px] ${BODY_CLASS}`}>
              If you switch to the bus twice a week:
            </p>
            <div className="flex items-center gap-4 rounded-lg bg-[#c9f2db] px-5 py-5 text-[#2a5a4d]">
              <Bus size={25} />
              <div>
                <p className="text-[17px] font-extrabold">
                  Save 42 kg CO<sub>2</sub>
                </p>
                <p className="text-[16px] font-medium text-[#1e3430]">
                  Estimated monthly reduction
                </p>
              </div>
            </div>
          </div>

          <div className={`${CARD_CLASS} border-[#e3e7e5] p-6`}>
            <h3 className={`mb-8 ${EYEBROW_CLASS}`}>Monthly Trend</h3>
            <div className="flex h-[94px] items-end gap-2">
              {[58, 78, 44, 28].map((height, index) => (
                <div
                  key={height}
                  className={`w-[42px] rounded-t-lg ${
                    index === 3 ? 'bg-[#073f31]' : 'bg-[#cad6d2]'
                  }`}
                  style={{ height }}
                />
              ))}
              {[24, 18, 12].map((height) => (
                <div
                  key={height}
                  className="w-[42px] rounded-t-lg border-2 border-dashed border-[#d5ddda]"
                  style={{ height }}
                />
              ))}
            </div>
            <div className="mt-7 flex items-center justify-between text-[16px] font-medium text-[#4f5755]">
              <span>Jan</span>
              <span className="font-extrabold text-[#073f31]">(April)</span>
              <span>July</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg bg-[#073f31] p-6 text-white">
            <div className="absolute -bottom-7 -right-8 h-24 w-24 rounded-full border-[11px] border-white/10" />
            <h3 className={`${CARD_TITLE_CLASS} mb-2 !text-white`}>Next Milestone</h3>
            <p className="mb-7 text-[16px] font-medium leading-6 !text-white/80">
              Improve your score by 12 points to save 2 trees.
            </p>
            <div className="mb-2 flex items-center justify-between text-[16px] font-medium">
              <span>Current: {currentScore}/100</span>
              <span>Goal: {scoreGoal}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#bdf3d6]"
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
