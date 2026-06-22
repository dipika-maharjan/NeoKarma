/**
 * Local translator fallback for common keys
 * Returns translations for very small, known set of labels when target is Nepali
 */

const MAP_NE = new Map([
  // phases
  ['personalized', 'व्यक्तिगत'],
  ['onboarding', 'शुरुवात'],

  // location types
  ['rural', 'ग्रामीण'],
  ['urban', 'शहरी'],

  // categories
  ['transport', 'यातायात'],
  ['food', 'खाना'],
  ['waste', 'फोहोर'],
  ['energy', 'ऊर्जा'],

  // generic
  ['none', 'नमेटिएको']
]);

export function translateLocal(input, target = 'en') {
  if (!input) return '';
  if (Array.isArray(input)) {
    return input.map((s) => translateLocal(s, target));
  }
  const str = String(input).trim();
  if (target && target.startsWith('ne')) {
    const key = str.toLowerCase();
    if (MAP_NE.has(key)) return MAP_NE.get(key);
    // try basic token mapping if phrase contains known words
    const tokens = key.split(/\s+/).map((t) => (MAP_NE.has(t) ? MAP_NE.get(t) : null));
    if (tokens.every((t) => t)) return tokens.join(' ');
    return null; // indicate no local translation
  }
  // default: return original string for en
  return str;
}

export default { translateLocal };
