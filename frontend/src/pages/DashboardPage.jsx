'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getStreak } from '@/lib/actions/streakActions';
import { getTodayLog } from '@/lib/actions/calculatorActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowDown, ArrowUpRight, Plus } from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const [dashData, streakInfo, today] = await Promise.all([
          getDashboardSummary(),
          getStreak(),
          getTodayLog()
        ]);
        setDashboardData(dashData);
        setStreakData(streakInfo);
        setTodayLog(today);
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

  const todayEmission = Number(todayLog?.totalEmissionKg ?? dashboardData?.weekly?.averagePerDay ?? 2.4);
  const weeklyTotal = Number(dashboardData?.weekly?.totalEmissionKg ?? 14.2);
  const weeklyAverage = Number(dashboardData?.weekly?.averagePerDay ?? 2.3);
  const monthlyAverage = Number(dashboardData?.monthly?.averagePerDay ?? weeklyAverage);
  const monthlyReduction = monthlyAverage > 0
    ? Math.max(0, Math.round(((monthlyAverage - weeklyAverage) / monthlyAverage) * 100))
    : 17;
  const impactScore = Math.min(100, Math.max(0, Math.round(streakData?.participationScore ?? 82)));
  const scoreStatus = impactScore >= 80 ? 'Gold Status' : impactScore >= 60 ? 'Silver Status' : 'Bronze Status';
  const weeklyBars = [0.45, 0.68, 0.58, 0.46, 0.75, 0.92, 0.28];

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#17202A] md:text-[34px]">
            Good morning, {studentName}!
          </h1>
          <Link
            href="/calculator"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#004332] px-8 text-[15px] font-bold text-white shadow-[0_3px_8px_rgba(0,67,50,0.25)] transition-colors hover:bg-[#003729]"
          >
            <Plus size={20} />
            Log Today&apos;s Carbon
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2.05fr_1fr]">
          <section className="relative min-h-[290px] overflow-hidden rounded-xl bg-[#07563F] p-6 text-white shadow-sm md:p-7">
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/8" />
            <div className="absolute -bottom-24 right-0 h-56 w-56 rotate-45 border-[18px] border-white/8" />
            {loading ? (
              <div className="h-full animate-pulse rounded-xl bg-white/10" />
            ) : (
              <>
                <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#72B99C]">
                  Today&apos;s Emission
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-[50px] font-extrabold leading-none">
                    {todayEmission.toFixed(1)}
                  </span>
                  <span className="pb-1 text-[22px] font-bold text-[#BCE5D1]">kg CO2</span>
                </div>
                <p className="mt-5 text-[17px] text-[#BCE5D1]">
                  You&apos;re doing better today. Keep up the green choices!
                </p>
              </>
            )}
          </section>

          <aside className="space-y-7">
            <section className="rounded-[10px] border border-[#E0E5E2] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-start justify-between">
                <p className="text-[15px] font-bold tracking-wide text-[#4A5550]">This Week</p>
                <span className="inline-flex items-center gap-0.5 text-[14px] font-bold text-[#D11212]">
                  <ArrowUpRight size={15} />
                  17%
                </span>
              </div>
              {loading ? (
                <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
              ) : (
                <>
                  <p className="mb-4 text-[24px] font-extrabold text-[#17202A]">
                    {weeklyTotal.toFixed(1)} kg CO2
                  </p>
                  <div className="flex h-12 items-end gap-1">
                    {weeklyBars.map((height, index) => (
                      <div
                        key={index}
                        className={`flex-1 rounded-sm ${index === 5 ? 'bg-[#004332]' : 'bg-[#E1E8E5]'}`}
                        style={{ height: `${Math.max(22, height * 52)}px` }}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-[10px] border border-[#BEE8D3] bg-[#C7EEDC] p-6 shadow-sm">
              <p className="text-[15px] font-bold tracking-wide text-[#4A6B5D]">Monthly Reduction</p>
              <div className="mt-2 flex items-center gap-8">
                <div>
                  <ArrowDown size={23} className="mb-1 text-[#4A6B5D]" />
                  <p className="text-[24px] font-extrabold text-[#4A6B5D]">{monthlyReduction || 17}%</p>
                </div>
                <p className="max-w-[220px] text-[14px] leading-relaxed text-[#6A7C73]">
                  Great progress compared to last month!
                </p>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.95fr]">
          <section className="min-h-[360px] rounded-xl border border-[#E0E5E2] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.08)] md:p-7">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="mb-4 text-[15px] font-bold tracking-wide text-[#4A5550]">Impact Score</p>
              <div className="relative flex h-[126px] w-[126px] items-center justify-center rounded-full border-[9px] border-[#004332]">
                <span className="text-[32px] font-extrabold text-[#17202A]">{impactScore}</span>
              </div>
              <p className="mt-5 text-[18px] font-extrabold text-[#17202A]">{scoreStatus}</p>
              <p className="mt-1 text-[14px] text-[#4A5550]">Top 5% in your grade</p>
            </div>
          </section>

          <Link href="/carbon-mirror" className="block">
            <section
              className="relative min-h-[360px] overflow-hidden rounded-xl border border-[#E0E5E2] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-lg"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #ffffff 0%, #ffffff 44%, rgba(255,255,255,0.82) 52%, rgba(255,255,255,0.18) 72%, rgba(255,255,255,0) 100%), url("/forest-visualization-preview.png")',
                backgroundPosition: 'center, right center',
                backgroundSize: 'cover, auto 100%',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="flex min-h-[360px] max-w-[420px] flex-col justify-center px-6 py-8 md:px-7">
                <h2 className="text-[25px] font-extrabold text-[#17202A]">The Carbon Mirror</h2>
                <p className="mt-3 text-[17px] leading-relaxed text-[#4A5550]">
                  Visualize how your daily commute and diet choices affect the local rhododendron forests in real-time.
                </p>
                <span className="mt-8 inline-flex h-12 w-fit items-center justify-center rounded-full border-2 border-[#004332] px-7 text-[15px] font-bold text-[#004332] transition-colors hover:bg-[#E8F5E9]">
                  Open Carbon Mirror
                </span>
              </div>
            </section>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
