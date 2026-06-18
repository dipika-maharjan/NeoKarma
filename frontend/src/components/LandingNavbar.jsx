'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageToggle from './LanguageToggle';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Landing');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('howItWorks'), href: '#how' },
    { label: t('about'), href: '#about' },
    // calculator href will be resolved based on current page
    { label: t('calculator'), href: '/calculator' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      } py-3.5 px-4 md:px-8 font-sans`}
    >
      <div className="max-w-[94%] mx-auto relative flex items-center justify-between">
        <Link href="/" className="no-underline select-none">
          <span className="text-2xl font-bold text-[#0A3D25] tracking-wide cursor-pointer">
            Neoकर्म
          </span>
        </Link>

        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8 pointer-events-auto">
          {navLinks.map((link, i) => {
            const href = link.label === t('calculator') && pathname === '/' ? '#preview' : link.href;
            return (
              <Link
                key={`${link.label}-${i}`}
                href={href}
                className="text-sm font-medium text-gray-600 no-underline transition-colors hover:text-[#0A3D25]"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <LanguageToggle />
          <span className="h-6 w-px bg-transparent" />
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 no-underline transition-colors hover:text-[#0A3D25]"
          >
            {t('login')}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#0A3D25] px-4 py-1.5 text-sm font-semibold text-white no-underline shadow-sm transition-all duration-200 hover:bg-[#072B1A]"
          >
            {t('getStarted')}
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="cursor-pointer p-2 text-gray-700 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-3 border-t border-gray-100 bg-white px-6 py-4 animate-[fadeIn_0.2s_ease-in] md:hidden">
          {navLinks.map((link, i) => {
            const href = link.label === 'Calculator' && pathname === '/' ? '#preview' : link.href;
            return (
              <Link
                key={`${link.label}-mobile-${i}`}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-gray-600 no-underline transition-colors hover:text-[#0A3D25]"
              >
                {link.label}
              </Link>
            );
          })}
          <hr className="border-gray-100" />
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-gray-700 no-underline"
          >
            {t('login')}
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="block rounded-full bg-[#0A3D25] px-6 py-2.5 text-center text-sm font-semibold text-white no-underline"
          >
            {t('getStarted')}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
