'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, ProgressBar, Skeleton, StatCard, ImageOverlayCard } from '@/components/ui';
import { getCarbonMirror } from '@/lib/actions/mirrorActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Share2, TrendingDown, AlertCircle, Leaf, Droplets, 
  BarChart3, Target, Trees 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CarbonMirrorPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mirrorData, setMirrorData] = useState(null);
  const [error, setError] = useState(null);

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
        setError('Failed to load carbon mirror data');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12 px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-6">
          <Skeleton height="h-16" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton height="h-64" />
            <Skeleton height="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Mock data - replace with real backend data
  const totalEmitted = mirrorData?.totalKgCO2 || 2.4;
  const lastMonthEmitted = mirrorData?.lastMonthKgCO2 || 2.8;
  const monthlyTrend = [
    { month: 'Jan', emissions: 3.2 },
    { month: 'Feb', emissions: 3.0 },
    { month: 'Mar', emissions: 2.8 },
    { month: 'Apr', emissions: 2.6 }
  ];
  const impactScore = mirrorData?.impactScore || 75;
  const scoreGoal = 100;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12 px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              This is your carbon mirror
            </h1>
            <p className="text-gray-600">
              A visual representation of your environmental impact
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg border border-gray-200">
            <AlertCircle size={18} className="text-[#1B5E20]" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Total Emitted
              </p>
              <p className="text-base font-extrabold text-[#1B5E20]">
                {totalEmitted.toFixed(1)} kg CO₂
              </p>
              {lastMonthEmitted > totalEmitted && (
                <p className="text-xs text-green-600">
                  <TrendingDown size={12} className="inline mr-1" />
                  {((lastMonthEmitted - totalEmitted) / lastMonthEmitted * 100).toFixed(0)}% vs last month
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Share Button */}
        <div className="mb-8 flex justify-end">
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Carbon Mirror',
                  text: `My total carbon emissions: ${totalEmitted.toFixed(1)} kg CO₂`,
                  url: window.location.href
                });
              }
            }}
          >
            <Share2 size={16} />
            Share this insight
          </Button>
        </div>

        {/* Main Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Environmental Cost - Rose/Red accents */}
          <ImageOverlayCard
            backgroundImage="linear-gradient(135deg, #E53935 0%, #C62828 100%)"
            caption="Cutting down half a tree"
            stats={[
              { label: 'Particulate matter generated', value: '12.5g' },
              { label: 'Indirect water depletion', value: '450L' }
            ]}
            variant="light"
            icon={<AlertCircle size={28} />}
          />

          {/* Positive Progress - Green accents */}
          <ImageOverlayCard
            backgroundImage="linear-gradient(135deg, #1B5E20 0%, #0D3D14 100%)"
            caption="Trees you've saved with better choices"
            stats={[
              { label: 'Emissions avoided this month', value: '0.8 kg' },
              { label: 'Monthly improvement', value: '+15%' }
            ]}
            variant="light"
            icon={<Leaf size={28} />}
          />
        </div>

        {/* Three-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* What if we changed? */}
          <Card>
            <h3 className="mb-3 text-[20px] font-extrabold text-gray-900">
              What if we changed?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If you used public transport instead of a car:
            </p>
            <div className="bg-[#E8F5E9] rounded-lg p-4 border-l-4 border-[#1B5E20]">
              <p className="text-sm text-gray-700 mb-1">Estimated savings</p>
              <p className="text-2xl font-bold text-[#1B5E20]">0.6 kg CO₂</p>
              <p className="text-xs text-gray-600 mt-1">per day</p>
            </div>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <h3 className="mb-3 text-[20px] font-extrabold text-gray-900">
              Monthly Trend
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0E0E0' }}
                  formatter={(value) => `${value.toFixed(1)} kg`}
                />
                <Bar dataKey="emissions" fill="#1B5E20" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Next Milestone */}
          <Card className="bg-[#1B5E20] text-white">
            <h3 className="mb-4 text-[20px] font-extrabold">Next Milestone</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Impact Score</span>
                <span className="text-base font-extrabold">{impactScore}/{scoreGoal}</span>
              </div>
              <div className="w-full h-3 bg-green-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7FD8BE] transition-all duration-500"
                  style={{ width: `${(impactScore / scoreGoal) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-green-100">
              Keep logging daily to reach your 100-point goal!
            </p>
          </Card>
        </div>

        {/* Action Links */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/calculator">
            <Button variant="primary" size="lg">
              Log Today&apos;s Activity
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarbonMirrorPage;
