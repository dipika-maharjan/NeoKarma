'use client';

import React, { useState, useEffect } from 'react';
import { Card, MetricCard, Button, Badge } from '@/components/ui';
import { getCarbonMirror } from '@/lib/actions/mirrorActions';
import { useAuth } from '@/context/AuthContext';
import { Leaf, TrendingDown, TrendingUp } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

const ResultPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mirrorData, setMirrorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMirrorData = async () => {
      try {
        const data = await getCarbonMirror();
        setMirrorData(data);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMirrorData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <p className="text-center text-gray-600">Please log in to view results</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Carbon Footprint</h1>
          <p className="text-gray-600">Today's environmental impact breakdown</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <Skeleton height="h-32" />
                </Card>
              ))}
            </>
          ) : (
            <>
              <MetricCard
                label="Total Emissions"
                value={mirrorData?.kgCO2 || 0}
                unit="kg CO₂"
                icon={Leaf}
              />
              <MetricCard
                label="Transportation"
                value={mirrorData?.breakdown?.transportKg || 0}
                unit="kg CO₂"
              />
              <MetricCard
                label="Food"
                value={mirrorData?.breakdown?.foodKg || 0}
                unit="kg CO₂"
              />
              <MetricCard
                label="Energy"
                value={mirrorData?.breakdown?.energyKg || 0}
                unit="kg CO₂"
              />
            </>
          )}
        </div>

        {!loading && mirrorData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Carbon Mirror</h2>
              <div className="bg-[#E8F5E9] rounded-xl p-8 text-center mb-6">
                <p className="text-gray-600 mb-2">Tree Equivalent</p>
                <p className="text-5xl font-bold text-[#1B5E20] mb-2">
                  {mirrorData?.treesEquivalent || 0}
                </p>
                <p className="text-sm text-gray-600">trees needed to absorb today's emissions</p>
              </div>
              <p className="text-sm text-gray-700 text-center">{mirrorData?.story || 'Your carbon footprint has been calculated.'}</p>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Insights</h2>
              <div className="space-y-4">
                {mirrorData?.status === 'improved' && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <TrendingDown className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-green-900 mb-1">Improving</p>
                      <p className="text-sm text-green-700">Your emissions are lower than yesterday.</p>
                    </div>
                  </div>
                )}
                {mirrorData?.status === 'worsened' && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <TrendingUp className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-red-900 mb-1">Increased</p>
                      <p className="text-sm text-red-700">Your emissions are higher today. Try to reduce them.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <h3 className="font-medium text-gray-900">Recommendations</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>- Use public transport more often</li>
                  <li>- Reduce meat consumption</li>
                  <li>- Minimize energy usage</li>
                </ul>
              </div>
            </Card>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.location.href = '/carbon-mirror'}
          >
            View Carbon Mirror
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
