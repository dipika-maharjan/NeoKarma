'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const t = typeof useTranslations === 'function' ? useTranslations('offline') : (k => k);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (isOnline) return null;

  const message = (typeof t === 'function') ? t('offlineBannerMessage') : "You're offline — your data is saved and will sync automatically when you're back online.";

  return (
    <div className="bg-amber-100 text-amber-900 text-sm text-center py-2 px-4">
      {message}
    </div>
  );
}
