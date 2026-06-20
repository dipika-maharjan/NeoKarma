import React from 'react';
import { useTranslations } from 'next-intl';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';

const DashboardSummary = ({
  onNavigateToCalculator,
  onNavigateToMirror,
  summary = {}
}) => {
  const t = useTranslations('Dashboard');
  const formatNumber = useNumberFormatter();

  const studentData = {
    name: summary.name || 'User',
    dailyEmissionsKG: summary.dailyEmissionsKG ?? null,
    impactScore: summary.impactScore ?? null,
    scoreStatus: summary.scoreStatus || t('impactScore'),
    totalTreesEquivalentKG: summary.totalTreesEquivalentKG ?? null,
    treesTrendPercentage: summary.treesTrendPercentage || '--'
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#1E3322] px-6 md:px-12 py-8 font-sans">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* Top Header Row with Welcome Text and Action Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A3D25] tracking-tight">
              {useTranslations('Dashboard')('greeting', { name: studentData.name })}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {useTranslations('Dashboard')('subtitle')}
            </p>
          </div>
          <button 
            onClick={onNavigateToCalculator}
            className="flex items-center gap-2 bg-[#0A3D25] hover:bg-[#0D5232] text-white text-sm font-medium py-2.5 px-5 rounded-full transition-all shadow-sm"
          >
            <span>➕</span> {useTranslations('Dashboard')('logToday')}
          </button>
        </div>

        {/* Core Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Main Giant Tracking Status Pill (Spans 2 columns on wide screens) */}
          <div className="md:col-span-2 bg-[#0A3D25] text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-md min-h-[220px]">
            {/* Background design accents mirroring your clean mockup waves */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
              <div className="w-64 h-64 rounded-full border-[32px] border-white"></div>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wider text-[#A2CBA0] uppercase">
                {t('todayEmission')}
              </p>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-5xl font-black tracking-tight">
                  {studentData.dailyEmissionsKG !== null ? formatNumber(studentData.dailyEmissionsKG, { maximumFractionDigits: 1 }) : '--'}
                </span>
                <span className="text-xl font-medium text-[#A2CBA0]">
                  {t('unitKgCO2')}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-[#155A39] pt-4 z-10">
              <p className="text-sm text-[#E2F0D9] flex items-center gap-2">
                <span>🌱</span> {t('youDoingBetter')}
              </p>
            </div>
          </div>

          {/* Right Side Stack: Tree Counter Metric Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Total Eco Filter
                </p>
                <h3 className="text-sm font-bold text-[#0A3D25] mt-1">
                  Tree Balance
                </h3>
              </div>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                {studentData.treesTrendPercentage}
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-800">
                  {studentData.totalTreesEquivalentKG !== null ? formatNumber(studentData.totalTreesEquivalentKG, { maximumFractionDigits: 1 }) : '--'}
                </span>
                <span className="text-sm font-semibold text-gray-500">
                  {t('unitKgCO2')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Cumulative offset metrics</p>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-3 flex items-center justify-between border border-gray-100">
              <span className="text-xs font-medium text-gray-600">Member Deduction</span>
              <span className="text-xs font-bold text-[#0A3D25] bg-[#E2F0D9] px-2 py-0.5 rounded">
                9.1%
              </span>
            </div>
          </div>

        </div>

        {/* Lower Grid: Impact Gauge Circle & Mirror Gateway Router */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Component: Impact Score Gauge Circle Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 self-start">
              Impact Score
            </p>
            
            {/* Minimal SVG Circle Progress Gauge matching Dashboard Summary graphic */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-gray-100 fill-none" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-[#0A3D25] fill-none" 
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - studentData.impactScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-800">
                  {studentData.impactScore !== null ? formatNumber(studentData.impactScore, { maximumFractionDigits: 0 }) : '--'}
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-[#0A3D25] bg-[#E2F0D9] px-3 py-1 rounded-full mt-4">
              {studentData.scoreStatus}
            </span>
            <p className="text-[11px] text-gray-400 mt-2">Tailored directly to your targets</p>
          </div>

          {/* Component: Carbon Mirror Entry Promo Box (Spans 2 columns) */}
          <div className="md:col-span-2 bg-white border border-gray-100 shadow-sm rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Left Column Content */}
            <div className="flex flex-col justify-between h-full py-2">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Visual Blueprint
                </span>
                <h3 className="text-xl font-bold text-[#0A3D25] mt-1 mb-2">
                  The Carbon Mirror
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  See how your numerical daily footprints map instantly into real-world localized environmental equivalents.
                </p>
              </div>

              <div className="mt-6">
                <button 
                  onClick={onNavigateToMirror}
                  className="bg-white border border-gray-300 hover:border-[#0A3D25] hover:text-[#0A3D25] text-gray-700 font-semibold text-xs py-2.5 px-5 rounded-xl transition-all"
                >
                  View Carbon Mirror
                </button>
              </div>
            </div>

            {/* Right Column Custom Render (Nature / Forest Art Background placeholder matching your UI card image) */}
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#E2F0D9] to-[#C5E0B4] relative overflow-hidden border border-[#C5E0B4]/40">
              {/* Graphic leaf silhouettes / geometric accents simulating the woods visual */}
              <div className="absolute bottom-[-10px] left-4 text-6xl opacity-20">🌲</div>
              <div className="absolute bottom-[-5px] left-14 text-7xl opacity-30">🌲</div>
              <div className="absolute bottom-[-15px] right-6 text-5xl opacity-20">🌲</div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardSummary;