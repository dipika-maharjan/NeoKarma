'use client'; // Required in Next.js app router for tracking interactive state updates

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardSummary from '../components/DashboardSummary';
import RecommendationsView from '../components/RecommendationsView';
import ScoreHistoryView from '../components/ScoreHistoryView';

export default function Home() {
  // State hook tracking which layout view is currently rendering
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* Global Brand Navigation Header */}
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      {/* Dynamic Main Body Content Gateway */}
      <main className="flex-grow">
        {currentView === 'dashboard' && (
          <DashboardSummary 
            onNavigateToCalculator={() => setCurrentView('calculator')}
            onNavigateToMirror={() => setCurrentView('mirror')}
          />
        )}

        {currentView === 'calculator' && (
          <div className="p-12 text-center text-gray-500">
            [Carbon Calculator Form Component goes here]
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="block mx-auto mt-4 text-xs font-bold text-[#0A3D25] underline"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {currentView === 'mirror' && (
          <div className="p-12 text-center text-gray-500">
            [Carbon Mirror Component goes here]
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="block mx-auto mt-4 text-xs font-bold text-[#0A3D25] underline"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {currentView === 'plan' && (
          <RecommendationsView onNavigateToDashboard={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'score' && (
          <ScoreHistoryView />
        )}
      </main>

      {/* Global Common Footer Section */}
      <Footer />
    </div>
  );
}