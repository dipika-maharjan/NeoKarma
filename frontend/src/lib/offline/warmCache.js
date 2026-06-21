const CRITICAL_ROUTES = [
  '/dashboard',
  '/calculator',
  '/carbon-mirror',
  '/plan',
  '/score'
];

// Confirmed API endpoints from backend routes
const CRITICAL_DATA_ENDPOINTS = [
  '/api/emission-factors',
  '/api/dashboard/summary',
  '/api/daily-log/history',
  '/api/daily-log/today'
];

export async function warmOfflineCache() {
  if (typeof window === 'undefined') return false;
  if (!navigator.onLine) return false;

  const allUrls = [...CRITICAL_ROUTES, ...CRITICAL_DATA_ENDPOINTS];
  const results = await Promise.allSettled(
    allUrls.map((url) => fetch(url, { cache: 'reload' }))
  );

  const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok));
  return failed.length === 0;
}

export async function requestPersistentStorage() {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persist) return false;
  try {
    const isPersisted = await navigator.storage.persist();
    return !!isPersisted;
  } catch (err) {
    console.warn('Persistent storage request failed', err);
    return false;
  }
}
