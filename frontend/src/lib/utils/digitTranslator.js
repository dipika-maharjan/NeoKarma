/**
 * Nepali-English Digit Translator
 * Maps between Nepali (०-९) and English (0-9) digits
 */

// Mapping object for digit translation
const DIGIT_MAP = {
  // English to Nepali
  english: {
    '0': '०',
    '1': '१',
    '2': '२',
    '3': '३',
    '4': '४',
    '5': '५',
    '6': '६',
    '7': '७',
    '8': '८',
    '9': '९',
  },
  // Nepali to English
  nepali: {
    '०': '0',
    '१': '1',
    '२': '2',
    '३': '3',
    '४': '4',
    '५': '5',
    '६': '6',
    '७': '7',
    '८': '8',
    '९': '9',
  },
};

/**
 * Convert English digits (0-9) to Nepali digits (०-९)
 * @param {string|number} text - The text or number containing English digits
 * @returns {string} Text with Nepali digits
 */
export function englishToNepali(text) {
  if (text === null || text === undefined) return '';
  
  return String(text).replace(/\d/g, (digit) => DIGIT_MAP.english[digit] || digit);
}

/**
 * Convert Nepali digits (०-९) to English digits (0-9)
 * @param {string} text - The text containing Nepali digits
 * @returns {string} Text with English digits
 */
export function nepaliToEnglish(text) {
  if (text === null || text === undefined) return '';
  
  return String(text).replace(/[०-९]/g, (digit) => DIGIT_MAP.nepali[digit] || digit);
}

/**
 * Smart digit converter - converts based on source locale
 * @param {string|number} text - The text to convert
 * @param {string} targetLocale - Target locale ('ne' or 'en')
 * @returns {string} Converted text
 */
export function convertDigits(text, targetLocale = 'en') {
  if (text === null || text === undefined) return '';
  
  if (targetLocale === 'ne' || targetLocale === 'np') {
    return englishToNepali(text);
  }
  return nepaliToEnglish(String(text));
}

export default {
  englishToNepali,
  nepaliToEnglish,
  convertDigits,
  DIGIT_MAP,
};