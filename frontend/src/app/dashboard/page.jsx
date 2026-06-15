"use client"

import Navbar from '@/components/Navbar';
import DashboardSummary from '@/components/DashboardSummary';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-grow">
        <DashboardSummary 
          onNavigateToCalculator={() => console.log('Navigate to Calculator form')}
          onNavigateToMirror={() => console.log('Navigate to Mirror screen')}
        />
      </main>
      <Footer />
    </div>
  );
}