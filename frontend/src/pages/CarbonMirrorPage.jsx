'use client';

import React, { useState, useEffect } from 'react';
import { Card, MetricCard, Button, Skeleton } from '@/components/ui';
import { getCarbonMirror, getWhatIfScenario } from '@/lib/actions/mirrorActions';
import { useAuth } from '@/context/AuthContext';
import { Leaf, Zap, Utensils, Car } from 'lucide-react';

const CarbonMirrorPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mirrorData, setMirrorData] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simValues, setSimValues] = useState({
    transportMultiplier: 1,
    foodMultiplier: 1,
    energyMultiplier: 1
  });
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCarbonMirror();
        setMirrorData(data);
      } catch (err) {
        console.error('Error loading mirror data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleSimulation = async () => {
    try {
      const result = await getWhatIfScenario(simValues);
      setSimResult(result);
    } catch (err) {
      console.error('Error running simulation:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <p className="text-center text-gray-600">Please log in to view the carbon mirror</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-screen-2xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-[#1B5E20] to-[#43A047] rounded-3xl p-12 text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Carbon Mirror</h1>
            <p className="text-lg text-green-100">See your environmental impact through a new lens</p>
          </div>
        </div>

        {/* Current Mirror */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card><Skeleton height="h-48" /></Card>
            <Card><Skeleton height="h-48" /></Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="flex flex-col items-center justify-center py-12">
              <Leaf className="text-[#1B5E20] mb-4" size={48} />
              <p className="text-sm text-gray-600 mb-2">Today's Emissions</p>
              <p className="text-5xl font-bold text-gray-900 mb-4">
                {mirrorData?.kgCO2?.toFixed(2) || 0}
              </p>
              <p className="text-sm text-gray-600">kg CO₂e</p>
            </Card>

            <Card className="flex flex-col items-center justify-center py-12 bg-[#E8F5E9]">
              <Leaf className="text-[#1B5E20] mb-4" size={48} />
              <p className="text-sm text-gray-600 mb-2">Tree Equivalent</p>
              <p className="text-5xl font-bold text-[#1B5E20] mb-4">
                {mirrorData?.treesEquivalent?.toFixed(1) || 0}
              </p>
              <p className="text-sm text-gray-600">trees needed</p>
            </Card>
          </div>
        )}

        {/* Breakdown */}
        {!loading && mirrorData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <MetricCard
              label="Transport"
              value={mirrorData?.breakdown?.transportKg || 0}
              unit="kg"
              icon={Car}
            />
            <MetricCard
              label="Food"
              value={mirrorData?.breakdown?.foodKg || 0}
              unit="kg"
              icon={Utensils}
            />
            <MetricCard
              label="Waste"
              value={mirrorData?.breakdown?.wasteKg || 0}
              unit="kg"
              icon={Leaf}
            />
            <MetricCard
              label="Energy"
              value={mirrorData?.breakdown?.energyKg || 0}
              unit="kg"
              icon={Zap}
            />
          </div>
        )}

        {/* What-If Simulator */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What-If Simulator</h2>
          <p className="text-gray-600 mb-6">Explore how different choices impact your carbon footprint</p>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium text-gray-900">Transportation</label>
                <span className="text-[#1B5E20] font-bold">{(simValues.transportMultiplier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={simValues.transportMultiplier}
                onChange={(e) => setSimValues(prev => ({ ...prev, transportMultiplier: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Adjust how much you reduce transport emissions</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium text-gray-900">Food Choices</label>
                <span className="text-[#1B5E20] font-bold">{(simValues.foodMultiplier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={simValues.foodMultiplier}
                onChange={(e) => setSimValues(prev => ({ ...prev, foodMultiplier: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Adjust food consumption emissions</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium text-gray-900">Energy Usage</label>
                <span className="text-[#1B5E20] font-bold">{(simValues.energyMultiplier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={simValues.energyMultiplier}
                onChange={(e) => setSimValues(prev => ({ ...prev, energyMultiplier: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Adjust energy consumption emissions</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-8"
            onClick={handleSimulation}
          >
            Calculate Scenario
          </Button>

          {simResult && (
            <div className="mt-8 p-6 bg-[#E8F5E9] rounded-xl">
              <h3 className="font-bold text-gray-900 mb-4">Simulation Result</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Original Emissions</p>
                  <p className="text-2xl font-bold text-gray-900">{simResult?.originalKg?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">New Emissions</p>
                  <p className="text-2xl font-bold text-[#1B5E20]">{simResult?.hypotheticalKg?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reduction</p>
                  <p className="text-2xl font-bold text-green-600">{simResult?.reductionPercent?.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.location.href = '/dashboard'}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarbonMirrorPage;
