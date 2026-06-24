'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Get storage key specific to user (ensures isolation between users)
const getStorageKey = (userId) => `neokarma_notifications_${userId}`;

// Start with empty - only genuine user actions create notifications
const initialNotifications = [];

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Detect user changes and clear stale notifications
  useEffect(() => {
    if (!user) {
      // User logged out - clear notifications
      setNotifications([]);
      setCurrentUserId(null);
      return;
    }

    const userId = user._id || user.id;
    
    // User changed - load notifications for new user
    if (userId !== currentUserId) {
      try {
        const storageKey = getStorageKey(userId);
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Failed to load notifications from storage:', error);
        setNotifications([]);
      }
      setCurrentUserId(userId);
    }

    setIsHydrated(true);
  }, [user, currentUserId]);

  // Persist to localStorage whenever notifications change (only for current user)
  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    try {
      const storageKey = getStorageKey(currentUserId);
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }, [notifications, isHydrated, currentUserId]);

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
