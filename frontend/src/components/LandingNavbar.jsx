'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#journey' },
    { label: 'About', href: '#features' },
    { label: 'Calculator', href: '/calculator' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="mx-auto flex max-w-[1840px] items-center justify-between px-6 py-6 md:px-9">
        <Link href="/" className="no-underline select-none">
          <span className="cursor-pointer text-2xl font-extrabold tracking-wide text-[#063f2f]">
            Neoकर्म
          </span>
        </Link>

        <div className="hidden items-center gap-12 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] font-bold tracking-wide text-gray-600 no-underline transition-colors hover:text-[#0A3D25]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/login"
            className="text-[15px] font-bold text-[#153f34] no-underline transition-colors hover:text-[#0A3D25]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#063f2f] px-8 py-3 text-sm font-bold text-white no-underline shadow-md shadow-green-900/15 transition-all duration-200 hover:bg-[#052f23]"
          >
            Get Started
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
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-gray-600 no-underline transition-colors hover:text-[#0A3D25]"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-gray-700 no-underline"
          >
            Login
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="block rounded-full bg-[#063f2f] px-6 py-2.5 text-center text-sm font-semibold text-white no-underline"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
