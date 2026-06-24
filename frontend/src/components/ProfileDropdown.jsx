'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { LogOut, User } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import profileImg from '../../public/profile.png';
import ProfileAvatar from './ProfileAvatar';

export default function ProfileDropdown() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const locale = useLocale();
  const t = useTranslations('Profile');
  const tAuth = useTranslations('Auth');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayName = user.name || user.email || t('studentDefault') || 'Student';
  const displaySchool = user.schoolName || user.email || t('schoolNotAdded');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-label={t('openProfileMenu')}
        className="w-11 h-11 rounded-full border border-gray-200 cursor-pointer hover:border-forest-green transition-all duration-150 ease-in-out flex items-center justify-center bg-white shadow-sm outline-none focus:ring-2 focus:ring-forest-green"
      >
        <ProfileAvatar imageSrc={user.profileImage} alt="User Profile Menu" size="sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ProfileAvatar imageSrc={user.profileImage} alt={displayName} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{displaySchool}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-forest-green bg-[#E8F5E9] px-2 py-0.5 rounded-full uppercase">
                  {t('gradeLabel', { grade: user.grade || '--', location: tAuth(user.locationType) || user.locationType || 'student' })}
                </span>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/profile/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors cursor-pointer no-underline"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>

          <div className="border-t border-gray-100 my-1" />

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                router.push('/login');
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-rose-accent hover:bg-rose-50 transition-colors font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
