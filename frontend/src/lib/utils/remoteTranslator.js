/**
 * Frontend translator client
 * Calls backend `/api/translate` endpoint and caches results in-memory
 */

const cache = new Map();

function cacheKey(text, target) {
  return `${target}::${text}`;
}

export async function translate(text, target = 'ne') {
  if (!text) return '';
  const key = cacheKey(text, target);
  if (cache.has(key)) return cache.get(key);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';
  const base = apiUrl.replace(/\/$/, '');
  // If API URL already contains /api, append /translate, otherwise assume base + /api/translate
  const url = base
    ? base.endsWith('/api')
      ? `${base}/translate`
      : `${base}/api/translate`
    : '/api/translate';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target }),
  });
  if (!res.ok) {
    // fallback: return original text
    return String(text);
  }
  const data = await res.json();
  const translated = data.success ? data.translated : text;
  cache.set(key, translated);
  return translated;
}

export default { translate };
