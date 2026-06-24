'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Trash2, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import Link from 'next/link';

const typeStyles = {
  info: {
    bg: 'bg-[#E8F5FD]',
    border: 'border-[#B3D9F2]',
    icon: 'bg-[#D6ECFF] text-[#0F4C8A]',
    title: 'text-[#0F4C8A]',
    hoverBg: 'hover:bg-[#E0F2FE]'
  },
  success: {
    bg: 'bg-[#E6F4EA]',
    border: 'border-[#B7E4C7]',
    icon: 'bg-[#C8E6C9] text-[#1E5F32]',
    title: 'text-[#1E5F32]',
    hoverBg: 'hover:bg-[#D4EDDA]'
  },
  warning: {
    bg: 'bg-[#FFF4E5]',
    border: 'border-[#FFD699]',
    icon: 'bg-[#FFE0B2] text-[#A15B00]',
    title: 'text-[#A15B00]',
    hoverBg: 'hover:bg-[#FFF8E1]'
  },
  error: {
    bg: 'bg-[#FBE9E7]',
    border: 'border-[#FFCCBC]',
    icon: 'bg-[#FFCCBC] text-[#8F1F1A]',
    title: 'text-[#8F1F1A]',
    hoverBg: 'hover:bg-[#FFEBEE]'
  }
};

const typeIcons = {
  info: <Info size={20} />,
  success: <CheckCircle2 size={20} />,
  warning: <AlertCircle size={20} />,
  error: <AlertCircle size={20} />
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, dismissNotification, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (notification.unread) {
      markAsRead(notification.id);
    }
  };

  const getTypeStyle = (type) => typeStyles[type] || typeStyles.info;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D7E3DD] bg-white text-[#0A3D25] shadow-sm transition hover:bg-[#F4FBF5]"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#D32F2F] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[420px] rounded-2xl border border-[#E0E5E2] bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E0E5E2] px-6 py-4">
            <div>
              <h3 className="text-base font-bold text-[#0A3D25]">Notifications</h3>
              <p className="mt-0.5 text-xs text-[#4A5550]">
                {notifications.length === 0 ? 'No updates' : `${notifications.length} update${notifications.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-[#4A5550] transition hover:bg-[#F4FBF5] hover:text-[#0A3D25]"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F4EA]">
                  <Bell size={24} className="text-[#1B5E20]" />
                </div>
                <p className="text-sm font-medium text-[#4A5550]">No notifications yet</p>
                <p className="mt-1 text-xs text-[#4A5550]/60">
                  Check back when you log activities or milestones are reached
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E0E5E2]">
                {notifications.slice(0, 6).map((notification) => {
                  const style = getTypeStyle(notification.type);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start gap-4 px-6 py-4 transition ${style.hoverBg} cursor-pointer`}
                    >
                      {/* Icon */}
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${style.icon}`}>
                        {typeIcons[notification.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-bold leading-tight ${style.title}`}>
                            {notification.title}
                          </h4>
                          {notification.unread && (
                            <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-[#D32F2F] mt-0.5" />
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#4A5550] line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-[#4A5550]/60">
                          {new Date(notification.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="flex-shrink-0 rounded-full p-1.5 text-[#4A5550] transition hover:bg-white hover:text-[#D32F2F]"
                        aria-label="Dismiss notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[#E0E5E2] px-6 py-3">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm font-semibold text-[#0A3D25] transition hover:text-[#0F4C8A]"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
