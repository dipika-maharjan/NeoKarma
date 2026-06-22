const fetch = require('node-fetch');

// Simple in-memory cache: key -> { value, expires }
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function cacheGet(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function cacheSet(key, value) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

async function googleTranslate(texts, target, apiKey) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const body = {
    q: texts,
    target,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Translate error: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const translations = data.data.translations.map((t) => t.translatedText);
  return translations;
}

async function libreTranslate(texts, target, apiKey) {
  // LibreTranslate accepts single string per request; call sequentially
  const url = `https://libretranslate.com/translate`;
  const results = [];
  for (const t of texts) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ q: t, source: 'auto', target }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`LibreTranslate error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    results.push(data.translatedText || '');
  }
  return results;
}

/**
 * POST /api/translate
 * body: { text: string | string[], target: 'ne' | 'en' | 'auto' }
 */
exports.translate = async (req, res) => {
  try {
    const { text, target } = req.body || {};
    console.log('Translate request, env provider=', process.env.TRANSLATE_PROVIDER);
    if (!text) return res.status(400).json({ success: false, message: 'Missing text' });
    const texts = Array.isArray(text) ? text.map(String) : [String(text)];
    const langTarget = (target === 'ne' || target === 'np') ? 'ne' : (target || 'en');

    const provider = (process.env.TRANSLATE_PROVIDER || 'google').toLowerCase();
    const apiKey = process.env.TRANSLATE_API_KEY || '';

    // Build cache key
    const cacheKey = `${provider}::${texts.join('|')}::${langTarget}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      return res.json({ success: true, translated: cached });
    }

    let translated;
    if (provider === 'libre') {
      translated = await libreTranslate(texts, langTarget, apiKey);
    } else {
      // default to google
      if (!apiKey) {
        return res.status(500).json({ success: false, message: 'Missing TRANSLATE_API_KEY for Google provider' });
      }
      translated = await googleTranslate(texts, langTarget, apiKey);
    }

    cacheSet(cacheKey, translated);
    return res.json({ success: true, translated: Array.isArray(text) ? translated : translated[0] });
  } catch (err) {
    console.error('Translate error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Translation failed', error: err.message });
  }
};
