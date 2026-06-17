'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, ProgressRing, Skeleton, StatCard } from '@/components/ui';
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getStreak } from '@/lib/actions/streakActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { AlertCircle, Leaf, TrendingDown, Award, Trees } from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const [dashData, streakInfo] = await Promise.all([
          getDashboardSummary(),
          getStreak()
        ]);
        setDashboardData(dashData);
        setStreakData(streakInfo);
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

  // Mock chart data
  const weeklyChartData = [
    { day: 'Mon', emissions: 2.4 },
    { day: 'Tue', emissions: 2.1 },
    { day: 'Wed', emissions: 2.8 },
    { day: 'Thu', emissions: 2.3 },
    { day: 'Fri', emissions: 1.9 },
    { day: 'Sat', emissions: 2.6 },
    { day: 'Sun', emissions: 2.2 }
  ];

  const todayEmission = dashboardData?.dailyEmissionsKG || 2.4;
  const weeklyAverage = dashboardData?.weeklyAverageKG || 2.3;
  const monthlyReduction = dashboardData?.monthlyReductionPercent || 12;
  const impactScore = dashboardData?.impactScore || 75;
  const streakDays = streakData?.current || 6;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Good morning, {user?.firstName || user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-gray-600">Track your environmental impact</p>
          </div>
          <Link href="/calculator">
            <Button variant="primary" size="lg">
              + Log Today's Carbon
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Top Row: Today's Emission + Right Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Emission Card */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card><Skeleton height="h-64" /></Card>
            ) : (
              <Card className="bg-gradient-to-br from-[#1B5E20] to-[#0D3D14] text-white">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider mb-4 text-green-100">
                    Today's Emission
                  </p>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-6xl md:text-7xl font-black">
                      {todayEmission.toFixed(2)}
                    </span>
                    <span className="text-2xl font-medium text-green-100">kg CO₂</span>
                  </div>
                  <p className="text-green-100 text-lg">
                    {todayEmission < weeklyAverage 
                      ? '👏 Better than your weekly average!'
                      : 'Keep working to reduce emissions'}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column Stacked */}
          <div className="space-y-6">
            {/* This Week Card */}
            {loading ? (
              <Card><Skeleton height="h-28" /></Card>
            ) : (
              <Card>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  This Week
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {weeklyAverage.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600">kg avg</span>
                </div>
                <div className="flex gap-0.5 items-end h-8">
                  {weeklyChartData.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-[#1B5E20] rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${(day.emissions / 3) * 100}%` }}
                      title={`${day.day}: ${day.emissions}kg`}
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Monthly Reduction Card */}
            {loading ? (
              <Card><Skeleton height="h-28" /></Card>
            ) : (
              <Card className="bg-gradient-to-br from-[#E8F5E9] to-[#F1F4F2] border-[#C8E6C9]">
                <p className="text-sm font-semibold text-[#1B5E20] uppercase tracking-wider mb-3">
                  Monthly Reduction
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#1B5E20]">
                    {monthlyReduction}%
                  </span>
                  <span className="text-sm text-gray-700">improvement</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">vs. last month</p>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Row: 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Impact Score Ring */}
          {loading ? (
            <Card><Skeleton height="h-64" /></Card>
          ) : (
            <Card className="flex flex-col items-center justify-center py-8">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-6">
                Impact Score
              </p>
              <div className="relative inline-flex flex-col items-center">
                <ProgressRing
                  value={impactScore}
                  max={100}
                  size={140}
                />
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-600">/100</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-[#1B5E20] mt-6">
                {impactScore >= 80 ? '🏆 Gold Status' : impactScore >= 60 ? '🥈 Silver Status' : '🥉 Bronze Status'}
              </p>
            </Card>
          )}

          {/* Carbon Mirror Teaser */}
          {loading ? (
            <Card><Skeleton height="h-64" /></Card>
          ) : (
            <Link href="/carbon-mirror">
              <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Visual Impact
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    The Carbon Mirror
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    See what your emissions mean in real terms
                  </p>
                  <Button variant="secondary" size="sm">
                    Open Mirror
                  </Button>
                </div>
              </Card>
            </Link>
          )}

          {/* Decorative Forest Panel */}
          {loading ? (
            <Card><Skeleton height="h-64" /></Card>
          ) : (
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white flex flex-col items-center justify-center py-8 overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <Trees size={200} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3 text-green-100">
                  You're Making a Difference
                </p>
                <p className="text-lg font-bold">
                  Keep going! Your daily actions matter.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Action Links */}
        <div className="flex gap-4 flex-wrap justify-center md:justify-start">
          <Link href="/calculator">
            <Button variant="primary" size="lg">
              Log Activity
            </Button>
          </Link>
          <Link href="/carbon-mirror">
            <Button variant="secondary" size="lg">
              View Carbon Mirror
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
