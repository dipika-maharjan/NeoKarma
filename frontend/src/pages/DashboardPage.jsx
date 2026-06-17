'use client';

import React, { useState, useEffect } from 'react';
import { Card, MetricCard, Button, Badge, ProgressRing, Skeleton } from '@/components/ui';
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getStreak } from '@/lib/actions/streakActions';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Zap, Utensils, Car, Flame } from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, streakInfo] = await Promise.all([
          getDashboardSummary(),
          getStreak()
        ]);
        setDashboardData(dashData);
        setStreakData(streakInfo);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <p className="text-center text-gray-600">Please log in to view your dashboard</p>
        </Card>
      </div>
    );
  }

  // Mock data for charts - would come from backend
  const weeklyData = [
    { day: 'Mon', emissions: 2.4 },
    { day: 'Tue', emissions: 2.1 },
    { day: 'Wed', emissions: 2.8 },
    { day: 'Thu', emissions: 2.3 },
    { day: 'Fri', emissions: 1.9 },
    { day: 'Sat', emissions: 2.6 },
    { day: 'Sun', emissions: 2.2 }
  ];

  const monthlyData = [
    { week: 'Wk 1', emissions: 2.4 },
    { week: 'Wk 2', emissions: 2.2 },
    { week: 'Wk 3', emissions: 2.5 },
    { week: 'Wk 4', emissions: 2.1 }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Good to see you, {user?.name || 'Student'}!
            </h1>
            <p className="text-gray-600">Here is your environmental impact tracking</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/calculator'}
          >
            Log Today's Carbon
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Large Footprint Card */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card><Skeleton height="h-48" /></Card>
            ) : (
              <Card className="bg-gradient-to-br from-[#1B5E20] to-[#0D3D14] text-white">
                <div>
                  <p className="text-sm font-semibold tracking-wider uppercase mb-4 text-green-100">
                    Today's Footprint
                  </p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black">
                      {dashboardData?.dailyEmissionsKG?.toFixed(2) || '0.00'}
                    </span>
                    <span className="text-2xl font-medium text-green-100">kg CO₂e</span>
                  </div>
                  <p className="text-green-100">
                    {dashboardData?.message || 'You are making a positive impact today!'}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Streak Card */}
          <div>
            {loading ? (
              <Card><Skeleton height="h-48" /></Card>
            ) : (
              <Card>
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                    Current Streak
                  </p>
                  <ProgressRing
                    value={streakData?.current || 0}
                    max={30}
                    size={120}
                    label={`${streakData?.current || 0} days`}
                  />
                  <p className="text-xs text-gray-600 mt-6 text-center">
                    Your best: {streakData?.longest || 0} days
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Weekly Chart */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Emissions</h3>
            {loading ? (
              <Skeleton height="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="emissions" fill="#1B5E20" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Monthly Trend Chart */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Trend</h3>
            {loading ? (
              <Skeleton height="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="#1B5E20"
                    strokeWidth={2}
                    dot={{ fill: '#1B5E20', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Car className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transport
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.breakdown?.transportKg?.toFixed(2) || '0.00'} kg
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Utensils className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Food
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.breakdown?.foodKg?.toFixed(2) || '0.00'} kg
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Zap className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Energy
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.breakdown?.energyKg?.toFixed(2) || '0.00'} kg
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/carbon-mirror'}
          >
            View Carbon Mirror
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.location.href = '/calculator'}
          >
            Log More Activities
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
