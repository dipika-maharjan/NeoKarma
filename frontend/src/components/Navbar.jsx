import React from 'react';
// Direct imports with corrected relative path jumping up two levels to root
import profileImg from '../../public/profile.png';
import streakIcon from '../../public/streak.png'; 

const Navbar = ({ currentView = 'dashboard', onNavigate }) => {
  // Map currentView to match the capitalized tab names for active state checking
  const activeTab = currentView.toLowerCase();

  return (
    <nav className="w-full bg-[#FAFAFA] border-b border-gray-100 py-3.5 px-4 md:px-8 font-sans sticky top-0 z-50">
      {/* Outer wrapper matches footer horizontal alignment precisely */}
      <div className="max-w-[94%] mx-auto flex items-center justify-between">
        
        {/* Left: Branding Identity */}
        <div className="flex items-center" onClick={() => onNavigate && onNavigate('dashboard')}>
          <span className="text-2xl font-bold text-[#0A3D25] tracking-wide cursor-pointer">
            Neoकर्म
          </span>
        </div>

        {/* Center: Main App Menu Links Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {["Dashboard", "Calculator", "Mirror", "Plan", "Score"].map((tab) => {
            const tabLower = tab.toLowerCase();
            const isActive = activeTab === tabLower;
            return (
              <button
                key={tab}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate(tabLower);
                }}
                className={`text-[14px] font-medium transition-all relative py-1 px-0.5 cursor-pointer bg-transparent border-none outline-none ${
                  isActive 
                    ? 'text-[#0A3D25] font-semibold' 
                    : 'text-gray-500 hover:text-[#0A3D25]'
                }`}
              >
                {tab}
                {/* Clean matching underline indicator accent for active state */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0A3D25] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Streak Metrics Status & Profile Action Wrapper */}
        <div className="flex items-center gap-4">
          
          {/* Day Streak Pill Layout */}
          <div className="flex items-center gap-1.5 bg-[#F1F4F2] text-[#0A3D25] px-3.5 py-1.5 rounded-full border border-gray-100/60 shadow-none select-none">
            {/* Streak Image Asset from public directory */}
            <img 
              src={streakIcon.src || streakIcon} 
              alt="Streak" 
              className="w-4 h-4 object-contain"
            />
            <span className="text-xs font-semibold tracking-wide">
              6 Day Streak
            </span>
          </div>

          {/* User Rounded Avatar Node Frame mapped directly from public folder asset */}
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:border-[#0A3D25] transition-colors flex items-center justify-center bg-white">
            <img 
              src={profileImg.src || profileImg} 
              alt="User Profile Menu" 
              className="w-full h-full object-cover"
            />
          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;