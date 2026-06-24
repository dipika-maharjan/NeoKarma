'use client';

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D7E3DD] bg-white text-[#0A3D25] shadow-sm transition hover:bg-[#F4FBF5]"
      aria-label="View notifications"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#D32F2F] px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
