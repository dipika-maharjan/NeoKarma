'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCookie } from '../lib/api/cookie';
import { login as authLogin, logout as authLogout, getProfile, editProfile } from '../lib/actions/authActions';
import { warmOfflineCache, requestPersistentStorage } from '@/lib/offline/warmCache';
import { STREAK_UPDATED_EVENT } from '../lib/actions/calculatorActions';

const defaultAuthValue = {
  user: null,
  token: null,
  loading: false,
  login: async () => ({ success: false, error: 'Auth provider is unavailable' }),
  updateProfile: async () => ({ success: false, error: 'Auth provider is unavailable' }),
  logout: () => {},
  isAuthenticated: false
};

const AuthContext = createContext(defaultAuthValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    const handleStreakUpdated = (event) => {
      setUser((currentUser) => {
        if (!currentUser || !event.detail) return currentUser;
        return {
          ...currentUser,
          streak: {
            ...(currentUser.streak || {}),
            ...event.detail
          }
        };
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-unauthorized', handleUnauthorized);
      window.addEventListener(STREAK_UPDATED_EVENT, handleStreakUpdated);
    }

    const savedToken = getCookie('token') || localStorage.getItem('token');
    if (savedToken) {
      // Fetch user profile on load/mount
      getProfile()
        .then((profileData) => {
          setToken(savedToken);
          setUser(profileData);
          // Warm offline cache and request persistent storage on successful session restore
          // Fire-and-forget: don't await to avoid delaying page load
          // Service worker will intercept and cache the fetch requests
          try {
            if (typeof window !== 'undefined' && navigator.onLine) {
              warmOfflineCache().catch(err => 
                console.warn('Warning: offline cache warm-up failed', err)
              );
              requestPersistentStorage().catch(err =>
                console.warn('Warning: persistent storage request failed', err)
              );
            }
          } catch (err) {
            console.warn('Failed to warm cache on session restore', err);
          }
        })
        .catch((err) => {
          if (err?.status === 401) {
            logout();
            return;
          }

          console.warn('Could not refresh user profile. Keeping the current session token.', err);
          setToken(savedToken);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      queueMicrotask(() => setLoading(false));
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-unauthorized', handleUnauthorized);
        window.removeEventListener(STREAK_UPDATED_EVENT, handleStreakUpdated);
      }
    };
  }, [logout]);

  const login = async (credentials) => {
    try {
      const { user: userData, token: authToken, role } = await authLogin(credentials);
      setUser(userData);
      setToken(authToken);
      // Warm offline cache and request persistent storage when user logs in
      // Fire-and-forget: don't await to return login success immediately
      // Service worker will intercept and cache the fetch requests in background
      try {
        if (typeof window !== 'undefined' && navigator.onLine) {
          warmOfflineCache().catch(err =>
            console.warn('Warning: offline cache warm-up failed after login', err)
          );
          requestPersistentStorage().catch(err =>
            console.warn('Warning: persistent storage request failed after login', err)
          );
        }
      } catch (err) {
        console.warn('Failed to warm cache on login', err);
      }
      return { success: true, user: userData, token: authToken };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const updateProfile = async (profileUpdates) => {
    try {
      const updatedUser = await editProfile(profileUpdates);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    updateProfile,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-center font-sans">
            <div className="w-12 h-12 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Checking session...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
