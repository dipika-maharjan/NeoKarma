'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCookie } from '@/lib/api/cookie';
import ProfileDropdown from './ProfileDropdown';
import streakIcon from '../../public/streak.png';
import LanguageToggle from './LanguageToggle';
import { useTranslations } from 'next-intl';
import { getCachedStreak, STREAK_UPDATED_EVENT } from '@/lib/actions/calculatorActions';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin' || getCookie('role') === 'admin';
  const t = useTranslations('Navbar');
  const [scrolled, setScrolled] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(user?.streak?.current || 0);
  const formatNumber = useNumberFormatter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentStreak(user?.streak?.current || 0);
  }, [user?.streak?.current]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const applyStreak = (streak) => {
      if (Number.isFinite(streak?.current)) {
        setCurrentStreak(streak.current);
      }
    };
    const syncCachedStreak = () => applyStreak(getCachedStreak());
    const handleStreakUpdated = (event) => applyStreak(event.detail);

    syncCachedStreak();
    window.addEventListener(STREAK_UPDATED_EVENT, handleStreakUpdated);
    window.addEventListener('storage', syncCachedStreak);
    const intervalId = window.setInterval(syncCachedStreak, 2000);

    return () => {
      window.removeEventListener(STREAK_UPDATED_EVENT, handleStreakUpdated);
      window.removeEventListener('storage', syncCachedStreak);
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated]);

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
    <nav
      className={`sticky top-0 z-50 w-full px-4 py-3.5 font-sans transition-all duration-300 md:px-8 ${
        scrolled
          ? 'border-b border-[#CFE2D5] bg-[#F4FBF5]/95 shadow-[0_10px_26px_rgba(10,61,37,0.10)] backdrop-blur-xl'
          : 'border-b border-[#DCE9E0] bg-[#EEF7F1]'
      }`}
    >
      {/* Outer wrapper matches footer horizontal alignment precisely */}
      <div className={`mx-auto flex max-w-screen-2xl items-center justify-between transition-transform duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-0.5'}`}>
        
        {/* Left: Branding Identity */}
        <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center no-underline select-none">
          <span className="text-2xl font-bold text-[#0A3D25] tracking-wide cursor-pointer">
            Neoकर्म
          </span>
        </Link>

        {/* Center: Main App Menu Links Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { key: 'dashboard', label: t('dashboard'), path: '/dashboard' },
            { key: 'calculator', label: t('calculator'), path: '/calculator' },
            { key: 'mirror', label: t('mirror'), path: '/carbon-mirror' },
            { key: 'plan', label: t('plan'), path: '/plan' },
            { key: 'score', label: t('score'), path: '/score' }
          ].map(({ key, label, path }) => {
            const isActive = activeTab === key;
            return (
              <Link
                key={key}
                href={path}
                className={`text-[14px] font-medium transition-all duration-200 relative py-1 px-0.5 cursor-pointer no-underline ${
                  isActive 
                    ? 'text-[#0A3D25] font-semibold' 
                    : 'text-[#52665B] hover:-translate-y-0.5 hover:text-[#0A3D25]'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0A3D25] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Streak Metrics Status & Profile Action Wrapper */}
        <div className="flex items-center gap-4">
          <LanguageToggle />
          {/* Offline ready badge hidden for demos */}
          
          {isAuthenticated && user ? (
            <>
              {/* Day Streak Pill Layout (merged): show compact pill and hover details */}
              <div className="relative group">
                <div className="flex items-center gap-1.5 bg-white/70 text-[#0A3D25] px-3.5 py-1.5 rounded-full border border-[#CFE2D5] shadow-sm select-none">
                  <img src={streakIcon.src || streakIcon} alt="Streak" className="w-4 h-4 object-contain" />
                  <span className="text-xs font-semibold tracking-wide">
                    {t('dayStreak', { count: formatNumber(currentStreak, {}) })}
                  </span>
                </div>

                <div className="pointer-events-none absolute left-1/2 top-full mt-3 hidden w-[240px] -translate-x-1/2 rounded-3xl border border-[#D8E8D6] bg-white/95 px-4 py-3 text-[12px] font-medium text-[#10261D] shadow-[0_18px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur-sm opacity-0 transition-all duration-200 ease-out group-hover:block group-hover:opacity-100 group-hover:translate-y-1">
                  <div className="absolute left-1/2 -top-2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm bg-white border-l border-t border-[#D8E8D6]" />
                  <p className="text-sm font-semibold text-[#0A3D25]">{t('streakBoostTitle') || 'Streak Boost'}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#4A5B51]">
                    {t('streakBoostCopy') || 'Log your school activity daily to keep the streak going and earn better progress insights.'}
                  </p>
                </div>
              </div>

              {/* Profile Dropdown */}
              <ProfileDropdown />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-[#0A3D25] hover:text-[#43A047] transition-colors no-underline"
            >
              {t('signIn')}
            </Link>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
