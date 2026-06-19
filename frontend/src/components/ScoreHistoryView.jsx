'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { getStreak } from '@/lib/actions/streakActions';
import { getDailyLogHistory } from '@/lib/actions/calculatorActions';
import { getScoreConfig } from '@/lib/actions/scoreConfigActions';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';

const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

const ScoreHistoryView = () => {
  const t = useTranslations('Score');
  const { user } = useAuth();
  const formatNumber = useNumberFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Real data states
  const [streakData, setStreakData] = useState({ current: 0, longest: 0, participationScore: 0 });
  const [historyLogs, setHistoryLogs] = useState([]);
  const [planItems, setPlanItems] = useState([]);
  const [scoreConfig, setScoreConfig] = useState(null);
  
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [streakInfo, historyResponse, config] = await Promise.all([
          getStreak(),
          getDailyLogHistory(),
          getScoreConfig()
        ]);
        
        if (streakInfo) {
          setStreakData(streakInfo);
        }
        
        if (historyResponse && historyResponse.data) {
          // Sort logs newest first
          const sorted = [...historyResponse.data].sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistoryLogs(sorted);
        }

        if (config) {
          setScoreConfig(config);
        }
      } catch (err) {
        console.error('Error fetching score/history data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Fetch planItems from local storage to calculate action score
    const storageKey = `neokarma_plan_items_${user?._id || user?.id || 'default'}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setPlanItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored plan items:', e);
      }
    }
  }, [user]);

  // Calculate points dynamically using backend config
  const currentStreak = streakData.current || 0;
  const streakMultiplier = scoreConfig?.streakMultiplier ?? 5;
  const streakMaxPts = scoreConfig?.streakMaxPoints ?? 25;
  const streakPts = Math.min(currentStreak * streakMultiplier, streakMaxPts);
  
  const totalActions = planItems.length;
  const completedActions = planItems.filter(item => item.completed);
  const completedCount = completedActions.length;
  const actionsWeight = scoreConfig?.actionsWeight ?? 35;
  const actionsDefaultPts = scoreConfig?.actionsDefaultPoints ?? 15;
  const actionsPts = totalActions > 0 
    ? Math.round((completedCount / totalActions) * actionsWeight) 
    : actionsDefaultPts;

  const logsCount = historyLogs.length;
  const consistencyMultiplier = scoreConfig?.consistencyMultiplier ?? 2.5;
  const consistencyMaxPts = scoreConfig?.consistencyMaxPoints ?? 25;
  const consistencyPts = Math.min(logsCount * consistencyMultiplier, consistencyMaxPts);
  
  const completenessThreshold = scoreConfig?.completenessThreshold ?? 3;
  const completenessHighPts = scoreConfig?.completenessHighPoints ?? 15;
  const completenessLowMultiplier = scoreConfig?.completenessLowMultiplier ?? 5;
  const completenessLowMaxPts = scoreConfig?.completenessLowMaxPoints ?? 15;
  const completenessPts = currentStreak >= completenessThreshold ? completenessHighPts : Math.min(currentStreak * completenessLowMultiplier, completenessLowMaxPts);
  
  const overallMaxScore = scoreConfig?.overallMaxScore ?? 100;
  const overallScore = Math.min(streakPts + actionsPts + consistencyPts + completenessPts, overallMaxScore);

  // Calculate dynamic impact drop from history
  const impactDropDefault = scoreConfig?.impactDropDefault ?? 17;
  let impactDrop = impactDropDefault;
  if (logsCount >= 2) {
    const sortedLogs = [...historyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const mid = Math.floor(sortedLogs.length / 2);
    const olderLogs = sortedLogs.slice(0, mid);
    const recentLogs = sortedLogs.slice(mid);
    
    const olderAvg = olderLogs.reduce((sum, l) => sum + l.totalEmissionKg, 0) / Math.max(olderLogs.length, 1);
    const recentAvg = recentLogs.reduce((sum, l) => sum + l.totalEmissionKg, 0) / Math.max(recentLogs.length, 1);
    
    if (olderAvg > 0) {
      const drop = ((olderAvg - recentAvg) / olderAvg) * 100;
      if (drop > 0) {
        impactDrop = Math.min(Math.round(drop), 99);
      } else {
        impactDrop = 0; // no drop (emissions increased or stayed same)
      }
    } else {
      impactDrop = 0;
    }
  }

  // Pagination slicing
  const totalPages = Math.max(Math.ceil(logsCount / itemsPerPage), 1);
  const currentRows = historyLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Client-side PDF Exporter using jsPDF
  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Styling Header & Title
      doc.setFillColor(10, 61, 37); // #0A3D25 Pine Green
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Neo Karma (Neo\u0915\u0930\u094d\u092e)', 15, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Student Carbon Tracking & Consistency Log', 15, 28);
      doc.text('Status: Top 7 Finalist Team Demo', 140, 28);

      // Report metadata
      doc.setTextColor(30, 51, 34); // #1E3322 Dark Green
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Student Environmental Report Card', 15, 55);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${user?.name || 'Student'}`, 15, 65);
      doc.text(`School Name: ${user?.schoolName || 'Neo Karma Academy'}`, 15, 71);
      doc.text(`Demographic: Grade ${user?.grade || 10} (${user?.locationType || 'urban'})`, 15, 77);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 130, 65);
      doc.text('Academic Score Allocation: Active Compliance', 130, 71);

      // Score Stats
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 85, 180, 28, 'F');
      doc.setDrawColor(226, 240, 217);
      doc.rect(15, 85, 180, 28, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(10, 61, 37);
      doc.text('Overall Impact Score:', 22, 94);
      doc.text('Daily Streak Logged:', 110, 94);

      doc.setFontSize(24);
      doc.text(`${overallScore} / 100`, 22, 106);
      doc.text(`${currentStreak} Days \u26A1`, 110, 106);

      // Table Header
      let currentY = 130;
      doc.setFontSize(12);
      doc.setTextColor(30, 51, 34);
      doc.text('Daily Activity Log & History', 15, currentY);

      currentY += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(15, currentY, 195, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATE', 20, currentY);
      doc.text('DAILY CARBON FOOTPRINT', 80, currentY);
      doc.text('PRACTICAL SCORE EARNED', 150, currentY);

      currentY += 4;
      doc.line(15, currentY, 195, currentY);

      // Table Rows
      doc.setFont('helvetica', 'normal');
      const rowsToPrint = historyLogs.slice(0, 15); // Print up to 15 logs in PDF
      const pdfPointsPerLog = scoreConfig?.pdfPointsPerLog ?? 10;
      
      if (rowsToPrint.length === 0) {
        currentY += 10;
        doc.text('No activity logs recorded yet.', 20, currentY);
      } else {
        rowsToPrint.forEach((row) => {
          currentY += 8;
          doc.text(formatDateString(row.date), 20, currentY);
          doc.text(`${formatNumber(row.totalEmissionKg, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('unitKgCO2')}`, 80, currentY);
          doc.text(`+${pdfPointsPerLog} pts`, 150, currentY);
          doc.line(15, currentY + 3, 195, currentY + 3);
          currentY += 3;
        });
      }

      // Footer disclaimer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This carbon calculations align with regional NEA 2024 factors (0.79 kg CO2/kWh) and ATODB standards. Certified by Neo Karma.', 15, 280);

      doc.save(`${user?.name || 'Student'}_NeoKarma_Carbon_History.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-76px)] bg-[#FAFAFA] text-[#1E3322] px-4 py-8 md:px-8 lg:px-12 xl:px-16 font-sans flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#0A3D25] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">{t('subtitle')}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-76px)] bg-[#FAFAFA] text-[#1E3322] px-4 py-8 md:px-8 lg:px-12 xl:px-16 font-sans">
      <div className="mx-auto w-full max-w-[1500px]">
        
        {/* Title & Subtitle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-tight text-[#0A3D25] md:text-[34px]">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              {t('subtitle')}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3D25] bg-[#E2F0D9] border border-[#C5E0B4] px-3.5 py-1 rounded-full mt-4">
              🌱 {t('badge')}
            </span>
          </div>
 
          {/* Earth Circular Gauge */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center shadow-lg border border-gray-100 bg-[#FAFAFA] select-none overflow-hidden">
            {/* Earth Background graphic */}
            <div 
              className="absolute inset-1.5 rounded-full bg-cover bg-center opacity-95 transition-all duration-300"
              style={{ backgroundImage: `url('/earth_gauge_bg.png')` }}
            />
            {/* Glassmorphic white overlay ring center */}
            <div className="absolute w-[60%] h-[60%] rounded-full bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center shadow-md border border-white/40 z-10">
              <span className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">{overallScore}</span>
              <span className="text-[9px] font-bold text-[#0A3D25]/80 mt-1 uppercase tracking-wide flex items-center gap-1">
                {overallScore >= 80 ? 'Excellent 💚' : overallScore >= 50 ? 'Good impact 💚' : 'Keep Going! 🏃'}
              </span>
            </div>
            {/* SVG Progress Ring */}
            <svg className="absolute w-full h-full transform -rotate-90 z-20 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="46"
                className="stroke-gray-100/20 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="50" cy="50" r="46"
                className="stroke-[#0A3D25] fill-none"
                strokeWidth="4.5"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - overallScore / 100)}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
 
        {/* 4 Stats Cards Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          
          {/* Streak Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-lg">
                🔥
              </div>
              <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-gray-800">{currentStreak} Days</h3>
              <p className="text-[11px] text-gray-400 mt-1">
                {Math.min(currentStreak * 0.5, 3).toFixed(1)} / 3.0 streak multiplier
              </p>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((currentStreak / 6) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
 
          {/* Weekly Actions Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg">
                ☑️
              </div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Weekly
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-gray-800">{completedCount} / {totalActions}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Actions completed in plan</p>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                  style={{ width: `${totalActions > 0 ? (completedCount / totalActions) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
 
          {/* Impact Drop Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                📉
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Impact
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-gray-800">{impactDrop > 0 ? `↓ ${impactDrop}%` : 'Stable'}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Emission trend reduction</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-2">
                {impactDrop > 0 ? "👍 You're doing amazing!" : "💪 Keep logging to build your trend"}
              </p>
            </div>
          </div>
 
          {/* Quality Consistency Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                🔄
              </div>
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Quality
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-gray-800">{consistencyPts.toFixed(1)} / 25</h3>
              <p className="text-[11px] text-gray-400 mt-1">Logs consistency weight</p>
              <p className="text-[10px] text-purple-600 font-bold mt-2">
                Logged {logsCount} times total 🔑
              </p>
            </div>
          </div>
 
        </div>
 
        {/* Daily Carbon History Log Table */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-[#0A3D25]">{t('dailyHistoryTitle')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('dailyHistorySubtitle')}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-600 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer bg-white">
                <span>⚡</span> {t('filter')}
              </button>
              <button 
                onClick={exportPDF}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0A3D25] hover:bg-[#0D5232] disabled:bg-gray-400 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
              >
                <span>📥</span> {isExporting ? t('exporting') : t('exportPDF')}
              </button>
            </div>
          </div>
 
          {/* Table */}
          <div className="overflow-x-auto">
            {currentRows.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="text-4xl block mb-2">📋</span>
                {t('noDailyLogs')}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/3">Date</th>
                    <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/3">Emission</th>
                    <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/3">Score Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row, index) => (
                    <tr key={row._id || index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-xs font-bold text-[#1E3322]">{formatDateString(row.date)}</td>
                      <td className="py-4 text-xs font-bold text-gray-500">{formatNumber(row.totalEmissionKg, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('unitKgCO2')}</td>
                      <td className="py-4 text-xs font-extrabold text-[#0A3D25]">+10 pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
 
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:text-gray-400 transition-colors cursor-pointer"
              >
                &lt; Previous
              </button>
 
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#0A3D25] text-white'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
 
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:text-gray-400 transition-colors cursor-pointer"
              >
                Next &gt;
              </button>
            </div>
          )}
 
        </div>
 
      </div>
    </div>
  );
};

export default ScoreHistoryView;
