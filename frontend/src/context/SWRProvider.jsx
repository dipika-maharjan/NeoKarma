'use client';

import React from 'react';
import { SWRConfig } from 'swr';

const CACHE_KEY = 'neokarma-swr-cache';
const TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// A single global map instance on the client to avoid wiping memory cache during hot-reloading/re-renders
let globalCache = null;

function createLocalStorageProvider() {
  if (typeof window === 'undefined') {
    return new Map();
  }

  const map = new Map();
  const timestamps = new Map();

  // Load valid entries from localStorage on startup
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      for (const [key, item] of Object.entries(parsed)) {
        if (item && typeof item === 'object' && 'timestamp' in item && 'data' in item) {
          if (now - item.timestamp < TTL) {
            map.set(key, item.data);
            timestamps.set(key, item.timestamp);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to initialize SWR cache from localStorage:', error);
  }

  // Helper to persist current cache state to localStorage
  const saveToLocalStorage = () => {
    try {
      const cacheObj = {};
      for (const [key, val] of map.entries()) {
        if (val !== undefined && typeof key === 'string') {
          const timestamp = timestamps.get(key) || Date.now();
          cacheObj[key] = {
            data: val,
            timestamp
          };
        }
      }
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Failed to save SWR cache to localStorage:', error);
    }
  };

  // Override Map methods to handle TTL and localStorage synchronization
  const originalSet = map.set.bind(map);
  map.set = (key, value) => {
    timestamps.set(key, Date.now());
    const result = originalSet(key, value);
    saveToLocalStorage();
    return result;
  };

  const originalDelete = map.delete.bind(map);
  map.delete = (key) => {
    timestamps.delete(key);
    const result = originalDelete(key);
    saveToLocalStorage();
    return result;
  };

  const originalGet = map.get.bind(map);
  map.get = (key) => {
    const timestamp = timestamps.get(key);
    if (timestamp && Date.now() - timestamp > TTL) {
      timestamps.delete(key);
      originalDelete(key);
      saveToLocalStorage();
      return undefined;
    }
    return originalGet(key);
  };

  const originalHas = map.has.bind(map);
  map.has = (key) => {
    const timestamp = timestamps.get(key);
    if (timestamp && Date.now() - timestamp > TTL) {
      timestamps.delete(key);
      originalDelete(key);
      saveToLocalStorage();
      return false;
    }
    return originalHas(key);
  };

  return map;
}

function getProvider() {
  if (!globalCache) {
    globalCache = createLocalStorageProvider();
  }
  return globalCache;
}

export function SWRProvider({ children }) {
  return (
    <SWRConfig
      value={{
        // Global configuration settings requested
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        keepPreviousData: true,
        
        // Cache provider implementation
        provider: getProvider,
        
        // Retry logic with exponential backoff (max 3 retries)
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // Never retry on 401 (Unauthorized) or 404 (Not Found)
          if (error?.status === 401 || error?.status === 404) return;

          // Max 3 retries
          if (retryCount >= 3) return;

          // Exponential backoff delay calculation (1s, 2s, 4s, up to 30s)
          const delay = Math.min(Math.pow(2, retryCount) * 1000, 30000);
          setTimeout(() => revalidate({ retryCount }), delay);
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}
