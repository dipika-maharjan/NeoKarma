"use client"

import Navbar from '@/components/Navbar';
import DashboardSummary from '@/components/DashboardSummary';
import Footer from '@/components/Footer';
import ScoreHistoryView from '@/components/ScoreHistoryView';

export default function Score() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-grow">
        <ScoreHistoryView/>
      </main>
      <Footer />
    </div>
  );
}