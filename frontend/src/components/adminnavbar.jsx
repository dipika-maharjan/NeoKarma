'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';

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
  const { user, isAuthenticated, logout } = useAuth();
  const role = user?.role || getCookie('role');
  const isAdmin = role === 'school_admin';
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Students', href: '/admin/students' },
    { label: 'Reports', href: '/admin/reports' }
  ];

  const handleLogout = () => {
    logout();
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

        <div className="hidden items-center gap-2 md:flex">
          {adminLinks.map((item) => {
            const isActive = pathname === item.href;
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
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-[10px] font-semibold uppercase text-[#0A3D25]">
            Admin Portal
          </span>

          {isAuthenticated && user ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-block rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-[#0A3D25] hover:text-[#0A3D25]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-[#0A3D25] no-underline hover:text-[#43A047]">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="cursor-pointer rounded-full p-2 text-[#0A3D25] transition-colors hover:bg-[#E9EDE4] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col px-6 py-6 animate-[fadeIn_0.2s_ease-in] md:hidden overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <span className="text-2xl font-bold tracking-wide text-[#0A3D25]">
              Neoकर्म
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="cursor-pointer rounded-full p-2 text-[#0A3D25] transition-colors hover:bg-[#E9EDE4]"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
          </div>
          
          <div className="flex flex-col space-y-6 flex-1">
            {adminLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    router.push(item.href);
                    setMobileOpen(false);
                  }}
                  className={`block w-full text-left text-3xl transition-colors ${
                    isActive
                      ? 'font-bold text-[#0A3D25]'
                      : 'font-semibold text-gray-400 hover:text-[#0A3D25]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-auto border-t border-gray-100 pt-8 pb-4">
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="block w-full py-4 text-center text-lg font-bold rounded-xl bg-[#E8F5E9] text-[#0A3D25] transition-colors hover:bg-[#C8E6C9]"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;