/**
 * MyMemory Translation API utility
 * Free tier: No API key needed, limit of 500 requests/day
 * Nepali language code: 'ne'
 * Docs: https://mymemory.translated.net/doc/spec.php
 */

const translationCache = new Map();

/**
 * Translate a string or array of strings to the target language.
 * Returns original text if translation fails (fail-safe).
 *
 * @param {string|string[]} text - text to translate
 * @param {string} targetLang - language code ('ne' for Nepali, 'en' for English)
 * @returns {Promise<string|string[]>} translated text
 */
async function translate(text, targetLang) {
  // If target is English, return as-is
  if (targetLang === 'en' || targetLang === 'np') {
    if (targetLang === 'np') targetLang = 'ne'; // normalize np to ne for safety, but if it was en, return text
  }
  if (targetLang === 'en') return text;

  const isArray = Array.isArray(text);
  const inputs = isArray ? text : [text];

  // Skip empty strings
  if (inputs.every((t) => !t || typeof t !== 'string' || t.trim() === '')) return text;

  try {
    const promises = inputs.map(async (t) => {
      if (!t || typeof t !== 'string' || t.trim() === '') return t;

      const cacheKey = `${targetLang}:${t}`;
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
      }

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=en|${targetLang}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Translation API error:', response.status);
        return t; // fail-safe
      }

      const data = await response.json();
      const translated = data?.responseData?.translatedText || t;
      
      translationCache.set(cacheKey, translated);
      // Limit cache size to prevent memory leak
      if (translationCache.size > 1000) {
        const firstKey = translationCache.keys().next().value;
        translationCache.delete(firstKey);
      }
      
      return translated;
    });

    const translatedArr = await Promise.all(promises);
    
    // Convert to Nepali digits if applicable
    const applyDigitConversion = (str) => {
      if (targetLang !== 'ne' || typeof str !== 'string') return str;
      const NEPALI_NUMBERS = {
        '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
        '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
      };
      return str.replace(/[0-9]/g, match => NEPALI_NUMBERS[match]);
    };

    const finalArr = translatedArr.map(applyDigitConversion);
    return isArray ? finalArr : finalArr[0];
  } catch (err) {
    console.error('Translation failed, using original:', err.message);
    return text; // fail-safe: always return something
  }
}

/**
 * Translate an object's specific string fields to the target language.
 * Non-string fields are left unchanged.
 *
 * @param {object} obj - object containing fields to translate
 * @param {string[]} fields - array of field names to translate
 * @param {string} targetLang - target language code
 * @returns {Promise<object>} object with translated fields
 */
async function translateFields(obj, fields, targetLang) {
  if (targetLang === 'en' || !obj) return obj;

  const textsToTranslate = fields
    .filter((f) => obj[f] && typeof obj[f] === 'string')
    .map((f) => obj[f]);

  if (textsToTranslate.length === 0) return obj;

  const translated = await translate(textsToTranslate, targetLang);
  const translatedArr = Array.isArray(translated) ? translated : [translated];

  const result = { ...obj };
  let i = 0;
  for (const field of fields) {
    if (obj[field] && typeof obj[field] === 'string') {
      result[field] = translatedArr[i++];
    }
  }
  return result;
}

module.exports = { translate, translateFields };
