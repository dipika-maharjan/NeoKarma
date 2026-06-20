'use client';
import { useEffect, useState } from 'react';
import { warmOfflineCache } from '@/lib/offline/warmCache';
import { useTranslations } from 'next-intl';

export default function OfflineReadyBadge() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'ready' | 'error'
  const t = useTranslations('offline');

  useEffect(() => {
    let mounted = true;
    async function prepare() {
      try {
        const ok = await warmOfflineCache();
        if (!mounted) return;
        setStatus(ok ? 'ready' : 'error');
      } catch (err) {
        if (!mounted) return;
        setStatus('error');
      }
    }
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      prepare();
    }
    return () => { mounted = false; };
  }, []);

  if (status === 'checking') {
    return <span className="text-xs text-gray-400">{t('preparingOffline') || 'Preparing offline mode…'}</span>;
  }
  if (status === 'ready') {
    return <span className="text-xs text-green-700">✓ {t('readyForOffline') || 'Ready for offline use'}</span>;
  }
  return null;
}
