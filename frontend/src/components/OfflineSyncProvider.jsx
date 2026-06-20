'use client';
import { useEffect } from 'react';
import { syncPendingLogs } from '@/lib/offline/syncManager';

export default function OfflineSyncProvider({ children }) {
  useEffect(() => {
    let mounted = true;

    async function handleOnline() {
      try {
        const result = await syncPendingLogs();
        if (!mounted) return;
        if (result && result.synced > 0) {
          // Notify app that logs synced. Use a global event so existing
          // components can listen and refresh as needed.
          window.dispatchEvent(new CustomEvent('offline-sync', { detail: result }));
        }
      } catch (err) {
        console.error('Offline sync failed', err);
      }
    }

    window.addEventListener('online', handleOnline);

    // Try on mount if online
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return children;
}
