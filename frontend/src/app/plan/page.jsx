"use client"

import Navbar from '@/components/Navbar';
import DashboardSummary from '@/components/DashboardSummary';
import Footer from '@/components/Footer';
import RecommendationsView from '@/components/RecommendationsView';

export default function Plan() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-grow">
        <RecommendationsView/>
      </main>
      <Footer />
    </div>
  );
}