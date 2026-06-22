'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Activity,
  ArrowDown,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Download,
  Gauge,
  Leaf,
  ListFilter,
  Repeat2,
  Target,
  TrendingDown
} from 'lucide-react';
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

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'emissionHigh', label: 'Highest emission' },
  { value: 'emissionLow', label: 'Lowest emission' }
];

const ScoreHistoryView = () => {
  const t = useTranslations('Score');
  const { user } = useAuth();
  const formatNumber = useNumberFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);

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
          setHistoryLogs(historyResponse.data);
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

  const currentStreak = streakData.current || 0;
  const streakMultiplier = scoreConfig?.streakMultiplier ?? 5;
  const streakMaxPts = scoreConfig?.streakMaxPoints ?? 25;
  const streakPts = Math.min(currentStreak * streakMultiplier, streakMaxPts);

  const totalActions = planItems.length;
  const completedActions = planItems.filter((item) => item.completed);
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
  const completenessPts = currentStreak >= completenessThreshold
    ? completenessHighPts
    : Math.min(currentStreak * completenessLowMultiplier, completenessLowMaxPts);

  const overallMaxScore = scoreConfig?.overallMaxScore ?? 100;
  const overallScore = Math.min(streakPts + actionsPts + consistencyPts + completenessPts, overallMaxScore);
  const gaugeLabel = overallScore >= 80 ? 'Excellent' : overallScore >= 50 ? 'Good impact' : 'Keep going';
  const pdfPointsPerLog = scoreConfig?.pdfPointsPerLog ?? 10;

  const impactDropDefault = scoreConfig?.impactDropDefault ?? 17;
  let impactDrop = null;
  
  if (logsCount >= 2) {
    const sortedLogs = [...historyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const mid = Math.floor(sortedLogs.length / 2);
    const olderLogs = sortedLogs.slice(0, mid);
    const recentLogs = sortedLogs.slice(mid);

    const olderAvg = olderLogs.reduce((sum, l) => sum + l.totalEmissionKg, 0) / Math.max(olderLogs.length, 1);
    const recentAvg = recentLogs.reduce((sum, l) => sum + l.totalEmissionKg, 0) / Math.max(recentLogs.length, 1);

    if (olderAvg > 0) {
      const drop = ((olderAvg - recentAvg) / olderAvg) * 100;
      impactDrop = drop > 0 ? Math.min(Math.round(drop), 99) : 0;
    } else {
      impactDrop = 0;
    }
  } else if (logsCount === 1) {
    impactDrop = 0;
  }

  const sortedHistoryLogs = useMemo(() => {
    const sorted = [...historyLogs];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'emissionHigh':
        return sorted.sort((a, b) => (b.totalEmissionKg || 0) - (a.totalEmissionKg || 0));
      case 'emissionLow':
        return sorted.sort((a, b) => (a.totalEmissionKg || 0) - (b.totalEmissionKg || 0));
      default:
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }, [historyLogs, sortBy]);

  const totalPages = Math.max(Math.ceil(logsCount / itemsPerPage), 1);
  const currentRows = sortedHistoryLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFillColor(10, 61, 37);
      doc.rect(0, 0, 210, 36, 'F');
      doc.setFillColor(226, 240, 217);
      doc.rect(0, 36, 210, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Neo Karma', 15, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Student Carbon Tracking & Consistency Log', 15, 28);

      doc.setTextColor(30, 51, 34);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Student Environmental Report Card', 15, 53);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(74, 85, 80);
      doc.text(`Name: ${user?.name || 'Student'}`, 15, 64);
      doc.text(`School: ${user?.schoolName || 'Neo Karma Academy'}`, 15, 71);
      doc.text(`Grade: ${user?.grade || 10} (${user?.locationType || 'urban'})`, 15, 78);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 148, 64);

      const metricCards = [
        { label: 'Overall Score', value: `${overallScore} / 100` },
        { label: 'Current Streak', value: `${currentStreak} Days` },
        { label: 'Actions Done', value: `${completedCount} / ${totalActions}` },
        { label: 'Emission Drop', value: impactDrop > 0 ? `${impactDrop}%` : 'Stable' }
      ];

      metricCards.forEach((card, index) => {
        const x = 15 + index * 46;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, 92, 40, 27, 3, 3, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, 92, 40, 27, 3, 3, 'D');
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(card.label.toUpperCase(), x + 4, 101);
        doc.setTextColor(10, 61, 37);
        doc.setFontSize(14);
        doc.text(card.value, x + 4, 112);
      });

      let currentY = 138;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 51, 34);
      doc.text('Daily Activity Log & History', 15, currentY);

      currentY += 8;
      doc.setFillColor(10, 61, 37);
      doc.roundedRect(15, currentY, 180, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('DATE', 20, currentY + 7);
      doc.text('DAILY CARBON FOOTPRINT', 80, currentY + 7);
      doc.text('PRACTICAL SCORE EARNED', 150, currentY + 7);

      doc.setFont('helvetica', 'normal');
      const rowsToPrint = sortedHistoryLogs.slice(0, 15);
      currentY += 10;

      if (rowsToPrint.length === 0) {
        currentY += 10;
        doc.setTextColor(100, 116, 139);
        doc.text('No activity logs recorded yet.', 20, currentY);
      } else {
        rowsToPrint.forEach((row, index) => {
          doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
          doc.rect(15, currentY, 180, 10, 'F');
          currentY += 7;
          doc.setTextColor(30, 51, 34);
          doc.text(formatDateString(row.date), 20, currentY);
          // Use number formatter when available, otherwise fallback to fixed string
          const emissionText = formatNumber
            ? `${formatNumber(row.totalEmissionKg, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('unitKgCO2')}`
            : `${(row.totalEmissionKg || 0).toFixed(2)} kg CO2`;
          doc.setTextColor(74, 85, 80);
          doc.text(emissionText, 80, currentY);
          doc.setTextColor(10, 61, 37);
          doc.text(`+${pdfPointsPerLog} pts`, 150, currentY);
          doc.setFont('helvetica', 'normal');
          currentY += 3;
        });
      }

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by Neo Karma.', 15, 280);

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
    <div className="score-page-shell w-full min-h-[calc(100vh-76px)] bg-[#FAFAFA] text-[#1E3322] px-4 py-8 md:px-8 lg:px-12 xl:px-16 font-sans">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-tight text-[#0A3D25] md:text-[34px]">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              {t('subtitle')}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3D25] bg-[#E2F0D9] border border-[#C5E0B4] px-3.5 py-1 rounded-full mt-4">
              <Leaf size={14} strokeWidth={2.4} /> {t('badge')}
            </span>
          </div>

          <div className="score-gauge relative w-52 h-52 md:w-60 md:h-60 rounded-full flex items-center justify-center select-none">
            <div className="absolute inset-0 rounded-full bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-gray-100" />
            <div className="absolute inset-2.5 rounded-full border border-[#E5EFE9]" />
            <div
              className="absolute inset-1.5 rounded-full bg-contain bg-center bg-no-repeat opacity-100 transition-all duration-300"
              style={{ backgroundImage: "url('/earth_gauge_bg.png')" }}
            />
            <div className="absolute w-[33%] h-[33%] rounded-full bg-white/88 backdrop-blur-[2px] flex flex-col items-center justify-center shadow-[0_12px_32px_rgba(10,61,37,0.12)] border border-white z-10">
              <span className="text-xl md:text-2xl font-black text-gray-800 tracking-tight leading-none">{overallScore}</span>
              <span className="text-[8px] font-bold text-[#0A3D25]/80 mt-1.5 uppercase tracking-wide">
                {gaugeLabel}
              </span>
            </div>
            <svg className="absolute w-full h-full transform -rotate-90 z-20 pointer-events-none" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" className="stroke-[#E9F1ED] fill-none" strokeWidth="3" />
              <circle
                cx="50"
                cy="50"
                r="46"
                className="score-meter-ring stroke-[#0A3D25] fill-none"
                strokeWidth="4"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - overallScore}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <div className="score-card bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="score-card-icon">
                <Target size={18} strokeWidth={2.1} />
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
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="score-progress-bar h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentStreak / 6) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="score-card bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm [animation-delay:80ms]">
            <div className="flex justify-between items-start">
              <div className="score-card-icon">
                <CalendarCheck size={18} strokeWidth={2.1} />
              </div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Weekly
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-gray-800">{completedCount} / {totalActions}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Actions completed in plan</p>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="score-progress-bar h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalActions > 0 ? (completedCount / totalActions) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="score-card bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm [animation-delay:160ms]">
            <div className="flex justify-between items-start">
              <div className="score-card-icon">
                <TrendingDown size={18} strokeWidth={2.1} />
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Impact
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-1.5">
                {impactDrop !== null && impactDrop > 0 ? <><ArrowDown size={18} strokeWidth={2.6} /> {impactDrop}%</> : impactDrop === null ? '0%' : 'Stable'}
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">Emission trend reduction</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1.5">
                <Activity size={12} strokeWidth={2.5} />
                {impactDrop === null ? 'Not logged yet' : impactDrop > 0 ? "You're doing amazing!" : 'Keep logging to build your trend'}
              </p>
            </div>
          </div>

          <div className="score-card bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm [animation-delay:240ms]">
            <div className="flex justify-between items-start">
              <div className="score-card-icon">
                <Repeat2 size={18} strokeWidth={2.1} />
              </div>
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Quality
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-black text-gray-800">{consistencyPts.toFixed(1)} / 25</h3>
              <p className="text-[11px] text-gray-400 mt-1">Logs consistency weight</p>
              <p className="text-[10px] text-purple-600 font-bold mt-2 flex items-center gap-1.5">
                <CalendarDays size={12} strokeWidth={2.5} />
                Logged {logsCount} times total
              </p>
            </div>
          </div>
        </div>

        <div className="score-table-panel bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-[#0A3D25]">{t('dailyHistoryTitle')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('dailyHistorySubtitle')}</p>
            </div>
            <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-3 w-full sm:w-auto">
              <div
                className="relative flex-1 sm:flex-initial"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setFilterOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setFilterOpen((open) => !open)}
                  className="flex h-10 w-full min-w-32 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-[#0A3D25] shadow-sm transition-all hover:border-gray-300 hover:shadow-md focus:border-[#0A3D25] focus:outline-none focus:ring-4 focus:ring-[#0A3D25]/10 sm:w-auto"
                  aria-expanded={filterOpen}
                  aria-haspopup="listbox"
                >
                  <span className="flex items-center gap-2">
                  <ListFilter size={16} strokeWidth={2.3} />
                  Filter
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.4}
                    className={`text-gray-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {filterOpen && (
                  <div
                    className="score-filter-menu absolute right-0 top-12 z-30 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
                    role="listbox"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setCurrentPage(1);
                          setFilterOpen(false);
                        }}
                        className={`block w-full px-3.5 py-2.5 text-left text-xs font-bold transition-colors ${
                          sortBy === option.value
                            ? 'bg-[#E8F5E9] text-[#0A3D25]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A3D25]'
                        }`}
                        role="option"
                        aria-selected={sortBy === option.value}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={exportPDF}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0A3D25] hover:bg-[#0D5232] disabled:bg-gray-400 text-white font-bold text-xs h-10 px-4 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Download size={16} strokeWidth={2.4} /> {isExporting ? t('exporting') : t('exportPDF')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {currentRows.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Gauge size={34} strokeWidth={1.8} className="mx-auto mb-3 text-gray-300" />
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
                    <tr key={row._id || index} className="score-row border-b border-gray-50 last:border-0 hover:bg-[#F6FAF8] transition-colors">
                      <td className="py-4 text-xs font-bold text-[#1E3322]">{formatDateString(row.date)}</td>
                      <td className="py-4 text-xs font-bold text-gray-500">{formatNumber ? `${formatNumber(row.totalEmissionKg, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('unitKgCO2')}` : `${(row.totalEmissionKg || 0).toFixed(2)} kg CO2`}</td>
                      <td className="py-4 text-xs font-extrabold text-[#0A3D25]">+{pdfPointsPerLog} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
