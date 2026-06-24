'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const NotificationContext = createContext(null);
const STORAGE_KEY = 'neokarma_notifications';

// Start with empty - only genuine user actions create notifications
const initialNotifications = [];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }, [notifications, isHydrated]);

  const showNotification = (notification) => {
    setNotifications((current) => [
      {
        id: notification.id || `${Date.now()}-${Math.random()}`,
        type: notification.type || 'info',
        title: notification.title || 'Notification',
        message: notification.message || '',
        actionLabel: notification.actionLabel || null,
        actionHref: notification.actionHref || null,
        createdAt: notification.createdAt || new Date().toISOString(),
        unread: notification.unread !== undefined ? notification.unread : true
      },
      ...current
    ]);
  };

  const dismissNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        unread: false
      }))
    );
  };

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );
  };

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      showNotification,
      dismissNotification,
      markAllRead,
      markAsRead
    }),
    [notifications, unreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
