"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { setLocaleCookie } from '@/lib/api/cookie';
import { useTranslations, useLocale } from 'next-intl';

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Language');
  const current = useLocale();

  const switchLocale = (locale) => {
    setLocaleCookie(locale, 365);
    router.refresh();
  };

  return (
    <div className="flex items-center">
      <div
        className="relative inline-flex items-center rounded-full border border-[#0A3D25] bg-white h-7 w-24 p-0.5"
        role="tablist"
      >
        {/* Sliding Dark Green Pill */}
        <div
          className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-[#0A3D25] transition-all duration-200 ${
            current === 'en' ? 'left-1/2' : 'left-0.5'
          }`}
        />
        
        {/* Nepali Button */}
        <button
          onClick={() => switchLocale('ne')}
          aria-label="Nepali"
          aria-pressed={current === 'ne'}
          className={`relative z-20 w-1/2 text-center text-xs font-semibold transition-colors duration-200 ${
            current === 'ne' ? 'text-white' : 'text-[#0A3D25]'
          }`}
        >
          नेप
        </button>

        {/* English Button */}
        <button
          onClick={() => switchLocale('en')}
          aria-label="English"
          aria-pressed={current === 'en'}
          className={`relative z-20 w-1/2 text-center text-xs font-semibold transition-colors duration-200 ${
            current === 'en' ? 'text-white' : 'text-[#0A3D25]'
          }`}
        >
          Eng
        </button>
      </div>
    </div>
  );
}