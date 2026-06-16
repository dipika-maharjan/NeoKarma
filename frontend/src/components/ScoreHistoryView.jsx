'use client';

import React, { useState } from 'react';

// Hardcoded mock data from the Figma screenshot
const MOCK_HISTORY = [
  { date: 'May 24, 2024', emission: '2.4 kg CO2', score: '+12 pts', emissionVal: 2.4, scoreVal: 12 },
  { date: 'May 23, 2024', emission: '3.8 kg CO2', score: '+8 pts', emissionVal: 3.8, scoreVal: 8 },
  { date: 'May 22, 2024', emission: '2.1 kg CO2', score: '+15 pts', emissionVal: 2.1, scoreVal: 15 },
  { date: 'May 21, 2024', emission: '5.2 kg CO2', score: '+2 pts', emissionVal: 5.2, scoreVal: 2 },
  { date: 'May 20, 2024', emission: '3.1 kg CO2', score: '+10 pts', emissionVal: 3.1, scoreVal: 10 },
  // Extra pages for pagination demo
  { date: 'May 19, 2024', emission: '2.5 kg CO2', score: '+11 pts', emissionVal: 2.5, scoreVal: 11 },
  { date: 'May 18, 2024', emission: '4.0 kg CO2', score: '+7 pts', emissionVal: 4.0, scoreVal: 7 },
  { date: 'May 17, 2024', emission: '1.9 kg CO2', score: '+16 pts', emissionVal: 1.9, scoreVal: 16 },
  { date: 'May 16, 2024', emission: '2.0 kg CO2', score: '+15 pts', emissionVal: 2.0, scoreVal: 15 },
  { date: 'May 15, 2024', emission: '3.5 kg CO2', score: '+9 pts', emissionVal: 3.5, scoreVal: 9 },
  { date: 'May 14, 2024', emission: '2.8 kg CO2', score: '+12 pts', emissionVal: 2.8, scoreVal: 12 },
  { date: 'May 13, 2024', emission: '5.0 kg CO2', score: '+3 pts', emissionVal: 5.0, scoreVal: 3 }
];

const ScoreHistoryView = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 5;

  const totalPages = 12; // Matching the "... 12" pagination structure from Figma

  // Slice list for local display pagination
  const currentRows = MOCK_HISTORY.slice(
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
      doc.text('Neo Karma (Neoकर्म)', 15, 18);

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
      doc.text('Name: Dipika Maharjan', 15, 65);
      doc.text('School Name: Kathmandu Pragya Academy', 15, 71);
      doc.text('Demographic: Grade 10 A', 15, 77);
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
      doc.text('82 / 100', 22, 106);
      doc.text('6 Days 🔥', 110, 106);

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
      MOCK_HISTORY.forEach((row) => {
        currentY += 8;
        doc.text(row.date, 20, currentY);
        doc.text(row.emission, 80, currentY);
        doc.text(row.score, 150, currentY);
        doc.line(15, currentY + 3, 195, currentY + 3);
        currentY += 3;
      });

      // Footer disclaimer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This carbon calculations align with regional NEA 2024 factors (0.79 kg CO2/kWh) and ATODB standards. Certified by Neo Karma.', 15, 280);

      doc.save('NeoKarma_Carbon_History_Report.pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#1E3322] px-4 md:px-12 py-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Title & Subtitle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0A3D25] tracking-tight">
              Your Impact Score
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xl">
              We score consistency, not perfection. Keep making small changes to see your impact grow over time.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3D25] bg-[#E2F0D9] border border-[#C5E0B4] px-3.5 py-1 rounded-full mt-4">
              🌱 Eco-Warrior
            </span>
          </div>

          {/* Figma Screen 2 Earth Circular Gauge */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center shadow-lg border border-gray-100 bg-[#FAFAFA] select-none overflow-hidden">
            {/* Split Earth Background graphic */}
            <div 
              className="absolute inset-1.5 rounded-full bg-cover bg-center opacity-95 transition-all duration-300"
              style={{ backgroundImage: `url('/earth_gauge_bg.png')` }}
            />
            {/* Glassmorphic white overlay ring center */}
            <div className="absolute w-[60%] h-[60%] rounded-full bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center shadow-md border border-white/40 z-10">
              <span className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">82</span>
              <span className="text-[9px] font-bold text-[#0A3D25]/80 mt-1 uppercase tracking-wide flex items-center gap-1">
                Good impact 💚
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
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - 82 / 100)}`}
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
              <h3 className="text-lg font-black text-gray-800">6 Days</h3>
              <p className="text-[11px] text-gray-400 mt-1">3.0 / 3.0 points earned</p>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '100%' }}></div>
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
              <h3 className="text-lg font-black text-gray-800">5 / 8</h3>
              <p className="text-[11px] text-gray-400 mt-1">Actions completed this month</p>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '62.5%' }}></div>
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
              <h3 className="text-lg font-black text-gray-800">↓ 17%</h3>
              <p className="text-[11px] text-gray-400 mt-1">Emission drop this month</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-2">👍 You're doing amazing!</p>
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
              <h3 className="text-lg font-black text-gray-800">All Good!</h3>
              <p className="text-[11px] text-gray-400 mt-1">10 / 20 points earned</p>
              <p className="text-[10px] text-purple-600 font-bold mt-2">Consistency is the key 🔑</p>
            </div>
          </div>

        </div>

        {/* Daily Carbon History Log Table */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-[#0A3D25]">Daily Carbon History</h2>
              <p className="text-xs text-gray-400 mt-0.5">Log daily and take actions to improve your score.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-600 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer bg-white">
                <span>⚡</span> Filter
              </button>
              <button 
                onClick={exportPDF}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0A3D25] hover:bg-[#0D5232] disabled:bg-gray-400 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
              >
                <span>📥</span> {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
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
                  <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-[#1E3322]">{row.date}</td>
                    <td className="py-4 text-xs font-bold text-gray-500">{row.emission}</td>
                    <td className="py-4 text-xs font-extrabold text-[#0A3D25]">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:text-gray-400 transition-colors cursor-pointer"
            >
              &lt; Previous
            </button>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((page) => (
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
              <span className="text-xs font-bold text-gray-400 px-1 select-none">...</span>
              <button
                onClick={() => setCurrentPage(3)} // Mock navigation to the end
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currentPage === totalPages
                    ? 'bg-[#0A3D25] text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {totalPages}
              </button>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, 3))} // Cap local rows demo to 3 pages
              disabled={currentPage === 3}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:text-gray-400 transition-colors cursor-pointer"
            >
              Next &gt;
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ScoreHistoryView;
