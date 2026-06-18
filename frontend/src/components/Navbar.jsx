'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import streakIcon from '../../public/streak.png'; 

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
>>>>>>> 2702772f8384dc1e65098e4a5006252fadbb015e

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Schools', href: '/admin/classes' },
    { label: 'Students', href: '/admin/students' },
    { label: 'Reports', href: '/admin/reports' },
  ];

  const studentLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Calculator', href: '/calculator' },
    { label: 'Daily Log', href: '/daily-log' },
    { label: 'Carbon Mirror', href: '/carbon-mirror' },
    { label: 'Streaks', href: '/streaks' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => {
    document.cookie = 'token=; max-age=0; path=/';
    document.cookie = 'role=; max-age=0; path=/';
    localStorage.removeItem('token');
    router.replace('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-[#FAFAFA] px-4 py-3.5 font-sans md:px-8">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
        <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center select-none no-underline">
          <span className="cursor-pointer text-2xl font-bold tracking-wide text-[#0A3D25]">
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
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#E8F5E9] font-semibold text-[#0A3D25]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A3D25]'
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
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-[#0A3D25] hover:text-[#0A3D25]"
              >
                Logout
              </button>
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
