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
      className={`sticky top-0 z-50 w-full px-4 py-3.5 font-sans transition-all duration-300 md:px-8 ${
        scrolled
          ? 'border-b border-[#D8DED2] bg-[#FFFFFA]/95 shadow-[0_10px_28px_rgba(33,53,44,0.10)] backdrop-blur-xl'
          : 'border-b border-[#E1E6DC] bg-[#F6F7F1]'
      }`}
    >
      <div
        className={`mx-auto flex max-w-screen-2xl items-center justify-between transition-transform duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-0.5'}`}
      >
        <Link href="/" className="no-underline select-none">
          <span className="text-2xl font-bold text-[#0A3D25] tracking-wide cursor-pointer">
            Neoकर्म
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-[#5A665E] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:text-[#0A3D25]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/login"
            className="text-[14px] font-medium text-[#5A665E] no-underline transition-colors hover:text-[#0A3D25]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#0A3D25] px-5 py-2 text-[14px] font-semibold text-white no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#072B1A] hover:shadow-[0_8px_18px_rgba(10,61,37,0.18)]"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="cursor-pointer rounded-full p-2 text-[#0A3D25] transition-colors hover:bg-[#E9EDE4] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mt-3 space-y-3 border-t border-[#D8DED2] bg-[#FFFFFA]/95 px-2 py-4 animate-[fadeIn_0.2s_ease-in] md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-[#5A665E] no-underline transition-colors hover:text-[#0A3D25]"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-[#D8DED2]" />
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
            className="block rounded-full bg-[#0A3D25] px-6 py-2.5 text-center text-sm font-semibold text-white no-underline"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
