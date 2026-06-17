'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import streakIcon from '../../public/streak.png'; 

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname.includes('/calculator')) return 'calculator';
    if (pathname.includes('/carbon-mirror') || pathname.includes('/mirror')) return 'mirror';
    if (pathname.includes('/plan')) return 'plan';
    if (pathname.includes('/score')) return 'score';
    return 'dashboard'; // default
  };

  const activeTab = getActiveTab();

  return (
    <nav className="w-full bg-[#FAFAFA] border-b border-gray-100 py-3.5 px-4 md:px-8 font-sans sticky top-0 z-50">
      {/* Outer wrapper matches footer horizontal alignment precisely */}
      <div className="max-w-[94%] mx-auto flex items-center justify-between">
        
        {/* Left: Branding Identity */}
        <Link href="/dashboard" className="flex items-center no-underline select-none">
          <span className="text-2xl font-bold text-[#0A3D25] tracking-wide cursor-pointer">
            Neoकर्म
          </span>
        </Link>

        {/* Center: Main App Menu Links Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {["Dashboard", "Calculator", "Mirror", "Plan", "Score"].map((tab) => {
            const tabLower = tab.toLowerCase();
            const isActive = activeTab === tabLower;
            let path = `/${tabLower}`;
            if (tabLower === 'mirror') {
              path = '/carbon-mirror';
            }
            return (
              <Link
                key={tab}
                href={path}
                className={`text-[14px] font-medium transition-all relative py-1 px-0.5 cursor-pointer no-underline ${
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
              </Link>
            );
          })}
        </div>

        {/* Right: Streak Metrics Status & Profile Action Wrapper */}
        <div className="flex items-center gap-4">
          
          {isAuthenticated && user ? (
            <>
              {/* Day Streak Pill Layout */}
              <div className="flex items-center gap-1.5 bg-[#F1F4F2] text-[#0A3D25] px-3.5 py-1.5 rounded-full border border-gray-100/60 shadow-none select-none">
                {/* Streak Image Asset from public directory */}
                <img 
                  src={streakIcon.src || streakIcon} 
                  alt="Streak" 
                  className="w-4 h-4 object-contain"
                />
                <span className="text-xs font-semibold tracking-wide">
                  {user.streak?.current || 0} Day Streak
                </span>
              </div>

              {/* Profile Dropdown */}
              <ProfileDropdown />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-[#0A3D25] hover:text-[#43A047] transition-colors no-underline"
            >
              Sign In
            </Link>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;