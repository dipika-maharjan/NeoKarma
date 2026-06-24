'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2, AlertCircle, Info, ChevronRight, Trash2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const typeStyles = {
  info: {
    bg: 'bg-[#E8F5FD]',
    border: 'border-[#B3D9F2]',
    icon: 'bg-[#D6ECFF] text-[#0F4C8A]',
    title: 'text-[#0F4C8A]'
  },
  success: {
    bg: 'bg-[#E6F4EA]',
    border: 'border-[#B7E4C7]',
    icon: 'bg-[#C8E6C9] text-[#1E5F32]',
    title: 'text-[#1E5F32]'
  },
  warning: {
    bg: 'bg-[#FFF4E5]',
    border: 'border-[#FFD699]',
    icon: 'bg-[#FFE0B2] text-[#A15B00]',
    title: 'text-[#A15B00]'
  },
  error: {
    bg: 'bg-[#FBE9E7]',
    border: 'border-[#FFCCBC]',
    icon: 'bg-[#FFCCBC] text-[#8F1F1A]',
    title: 'text-[#8F1F1A]'
  }
};

const typeIcons = {
  info: <Info size={24} />,
  success: <CheckCircle2 size={24} />,
  warning: <AlertCircle size={24} />,
  error: <AlertCircle size={24} />
};

const NotificationsPage = () => {
  const router = useRouter();
  const { notifications, dismissNotification, markAsRead } = useNotifications();
  const t = useTranslations('common');

  // Mark all notifications as read when page is viewed
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.unread) {
        markAsRead(notification.id);
      }
    });
  }, [notifications, markAsRead]);

  const getTypeStyle = (type) => typeStyles[type] || typeStyles.info;

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#F9FAFB] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0A3D25]">
            Notifications
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#4A5550]">
            {notifications.length === 0 ? 'No notifications yet' : `${notifications.length} update${notifications.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-[#E0E5E2] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F4EA]">
              <Bell size={32} className="text-[#1B5E20]" />
            </div>
            <h2 className="text-lg font-bold text-[#17202A]">No notifications yet</h2>
            <p className="mt-2 text-sm text-[#4A5550]">
              Check back when you log activities or milestones are reached.
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-6 rounded-full border border-[#0A3D25] bg-white px-6 py-2 text-sm font-semibold text-[#0A3D25] transition hover:bg-[#F4FBF5]"
            >
              Go back
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const style = getTypeStyle(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`rounded-3xl border ${style.border} ${style.bg} p-6 shadow-sm transition hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {/* Icon */}
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${style.icon}`}>
                        {typeIcons[notification.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-base font-bold leading-tight ${style.title}`}>
                            {notification.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#4A5550]">
                          {notification.message}
                        </p>

                        {/* Action Button */}
                        {notification.actionHref && notification.actionLabel && (
                          <Link
                            href={notification.actionHref}
                            className="mt-4 inline-flex items-center justify-between gap-2 rounded-full border border-[#0A3D25] bg-white px-4 py-2 text-sm font-semibold text-[#0A3D25] transition hover:bg-[#F4FBF5]"
                          >
                            <span>{notification.actionLabel}</span>
                            <ChevronRight size={16} />
                          </Link>
                        )}

                        {/* Timestamp */}
                        <p className="mt-3 text-xs text-[#4A5550]/60">
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      type="button"
                      onClick={() => dismissNotification(notification.id)}
                      className="flex-shrink-0 rounded-full p-2 text-[#4A5550] transition hover:bg-white hover:text-[#0A3D25]"
                      aria-label="Dismiss notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
