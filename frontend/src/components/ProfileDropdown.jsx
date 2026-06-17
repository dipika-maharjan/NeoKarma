'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, User, LayoutDashboard } from 'lucide-react';

/**
 * ProfileDropdown - User profile dropdown menu
 * Mounted in navbar next to streak badge
 */
const ProfileDropdown = ({ avatarSrc = '' }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // Close on Escape key
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    window.location.href = '/login';
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button - Avatar */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer 
          transition-all duration-200 flex items-center justify-center bg-white
          ${isOpen 
            ? 'border-[#1B5E20] shadow-md' 
            : 'border-gray-200 hover:border-[#1B5E20]'
          }
        `}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="User Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1B5E20] to-[#0D3D14] flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 
            shadow-lg z-50 overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-150
          `}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-[#FAFAFA]">
            <p className="font-semibold text-gray-900 text-sm">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>

          {/* Menu Items */}
          <nav className="py-2">
            {/* Profile */}
            <Link
              href="/profile"
              onClick={handleMenuItemClick}
              className={`
                flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-[#F1F4F2] 
                transition-colors duration-150 text-sm font-medium
              `}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>

            {/* Dashboard */}
            <Link
              href="/dashboard"
              onClick={handleMenuItemClick}
              className={`
                flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-[#F1F4F2] 
                transition-colors duration-150 text-sm font-medium
              `}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              onClick={handleMenuItemClick}
              className={`
                flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-[#F1F4F2] 
                transition-colors duration-150 text-sm font-medium
              `}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-[#E53935] 
                hover:bg-red-50 transition-colors duration-150 text-sm font-medium
              `}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
