'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, StatCard, ProgressBar, Skeleton } from '@/components/ui';
import { getTodayLog } from '@/lib/actions/calculatorActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Trees, Zap, TrendingDown, Share2, ArrowRight, AlertCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton height="h-16" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton height="h-64" />
            <Skeleton height="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !todayLog) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle size={24} />
              <p>{error || 'No log data found. Please log your activities first.'}</p>
            </div>
            <Link href="/calculator" className="mt-4 inline-block">
              <Button variant="primary">
                Go Back to Calculator
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Mock calculation data - in real app this comes from backend
  const emissionKg = todayLog.totalEmission || 2.4;
  const averageEmission = 3.2;
  const percentageBelow = Math.round(((averageEmission - emissionKg) / averageEmission) * 100);
  const treesEquivalent = (emissionKg / 0.024).toFixed(1);
  const distanceEquivalent = (emissionKg / 0.12).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 md:py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Your Carbon Footprint Today
          </h1>
          <p className="text-gray-600">
            Here's a detailed breakdown of your daily emissions
          </p>
        </div>

        {/* Main Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Emission Details Card */}
          <Card className="bg-white">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Total Emission
              </p>
              <div className="text-5xl md:text-6xl font-bold text-[#1B5E20] mb-2">
                {emissionKg.toFixed(2)}
              </div>
              <p className="text-lg text-gray-700">
                kg CO₂ equivalents
              </p>
            </div>

            {/* Comparison Badge */}
            {percentageBelow > 0 && (
              <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg p-3 mb-6 text-center">
                <p className="text-sm font-semibold text-[#1B5E20]">
                  <TrendingDown size={16} className="inline mr-1" />
                  {percentageBelow}% below your average
                </p>
              </div>
            )}

            {/* Equivalence Stats */}
            <div className="space-y-3 border-t pt-6">
              <StatCard
                label="Trees needed to offset"
                value={treesEquivalent}
                unit="trees"
                icon={<Trees size={20} />}
                compact={true}
                size="md"
              />
              <StatCard
                label="Equivalent driving distance"
                value={distanceEquivalent}
                unit="km"
                icon={<Zap size={20} />}
                compact={true}
                size="md"
              />
            </div>
          </Card>

          {/* Right: Comparison Card */}
          <Card className="bg-[#1B5E20] text-white">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-green-100 mb-4">
                Your Performance
              </p>
              
              {/* Comparison Bars */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-100">Your Emission</span>
                    <span className="text-lg font-bold">{emissionKg.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-green-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7FD8BE] rounded-full transition-all duration-500"
                      style={{ width: `${(emissionKg / averageEmission) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-100">Your Average</span>
                    <span className="text-lg font-bold">{averageEmission.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-green-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/50 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Encouraging Message */}
            <div className="border-t border-green-700/50 pt-4">
              <p className="text-sm text-green-100">
                {emissionKg < averageEmission 
                  ? '🎉 Great job! You\'re doing better than your average.'
                  : 'Keep working to reduce your emissions. You can do it!'}
              </p>
            </div>
          </Card>
        </div>

        {/* Bottom Section: 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Carbon Mirror Teaser */}
          <Link href="/carbon-mirror">
            <Card className="bg-gradient-to-br from-[#FFF5F5] to-white border-2 border-red-200 cursor-pointer hover:shadow-lg transition-shadow h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-2">
                    See Your Impact
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">
                    Carbon Mirror
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Visualize the environmental impact of your emissions
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <Button variant="secondary" size="sm" className="mt-4">
                  View Carbon Mirror
                  <ArrowRight size={16} />
                </Button>
              </div>
            </Card>
          </Link>

          {/* Impact Score Teaser */}
          <Link href="/dashboard">
            <Card className="bg-gradient-to-br from-[#E8F5E9] to-white border-2 border-[#C8E6C9] cursor-pointer hover:shadow-lg transition-shadow h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-[#1B5E20] uppercase mb-2">
                    Your Progress
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">
                    Impact Score & Streak
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Track your environmental impact score and daily streaks
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <Button variant="primary" size="sm" className="mt-4">
                  View Dashboard
                  <ArrowRight size={16} />
                </Button>
              </div>
            </Card>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/calculator">
            <Button variant="primary" size="lg">
              Log Another Activity
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => {
              // TODO: Implement share functionality
              if (navigator.share) {
                navigator.share({
                  title: 'My Carbon Footprint',
                  text: `I emitted ${emissionKg.toFixed(2)} kg CO₂ today!`,
                  url: window.location.href
                });
              }
            }}
          >
            <Share2 size={18} />
            Share Result
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

