'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const getCookie = (name) => {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] || '';
};

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
<<<<<<< HEAD
  const role = getCookie('role');
  const isAdmin = role === 'school_admin';
=======
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
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
<<<<<<< HEAD
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-[#FAFAFA] px-4 py-3.5 font-sans md:px-8">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
        <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center select-none no-underline">
          <span className="cursor-pointer text-2xl font-bold tracking-wide text-[#0A3D25]">
=======
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
        <Link href="/dashboard" className="flex items-center no-underline select-none">
          <span className="text-2xl font-bold text-[#0A3D25] tracking-wide cursor-pointer">
>>>>>>> 2702772f8384dc1e65098e4a5006252fadbb015e
            Neoकर्म
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
<<<<<<< HEAD
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#E8F5E9] font-semibold text-[#0A3D25]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A3D25]'
=======
              <Link
                key={tab}
                href={path}
                className={`text-[14px] font-medium transition-all duration-200 relative py-1 px-0.5 cursor-pointer no-underline ${
                  isActive 
                    ? 'text-[#0A3D25] font-semibold' 
                    : 'text-[#52665B] hover:-translate-y-0.5 hover:text-[#0A3D25]'
>>>>>>> 2702772f8384dc1e65098e4a5006252fadbb015e
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
              isAdmin ? 'bg-[#E8F5E9] text-[#0A3D25]' : 'bg-[#EAF2FF] text-[#185FA5]'
            }`}
          >
            {isAdmin ? 'Admin Portal' : 'Student'}
          </span>

          {isAuthenticated && user ? (
            <>
<<<<<<< HEAD
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-[#0A3D25] hover:text-[#0A3D25]"
              >
                Logout
              </button>
=======
              {/* Day Streak Pill Layout */}
              <div className="flex items-center gap-1.5 bg-white/70 text-[#0A3D25] px-3.5 py-1.5 rounded-full border border-[#CFE2D5] shadow-sm select-none">
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
>>>>>>> 2702772f8384dc1e65098e4a5006252fadbb015e
              <ProfileDropdown />
            </>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-[#0A3D25] no-underline hover:text-[#43A047]">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
