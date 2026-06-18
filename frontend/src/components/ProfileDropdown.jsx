'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import profileImg from '../../public/profile.png';

export default function ProfileDropdown() {
  const router = useRouter();
  const { user, logout } = useAuth();
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger: User Rounded Avatar Node Frame */}
      <button
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:border-forest-green transition-colors flex items-center justify-center bg-white outline-none focus:ring-2 focus:ring-forest-green"
      >
        <img
          src={profileImg.src || profileImg}
          alt="User Profile Menu"
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header: Name and Email */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-forest-green bg-[#E8F5E9] px-2 py-0.5 rounded-full uppercase">
              Grade {user.grade} • {user.locationType}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors cursor-pointer no-underline"
            >
              Profile / Account
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors cursor-pointer no-underline"
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors cursor-pointer no-underline"
            >
              Settings
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Logout Action */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                router.replace('/');
              }}
              className="w-full text-left block px-4 py-2 text-sm text-rose-accent hover:bg-rose-50 transition-colors font-medium cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
