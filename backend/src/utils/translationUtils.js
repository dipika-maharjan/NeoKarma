const LOCAL_TRANSLATIONS = {
  ne: {
    personalized: 'व्यक्तिगत',
    onboarding: 'शुरुवात',
    rural: 'ग्रामीण',
    urban: 'शहरी',
    transport: 'यातायात',
    food: 'खाना',
    waste: 'फोहोर',
    energy: 'ऊर्जा',
    none: 'नमेटिएको'
  }
};

function isNepaliLocale(locale) {
  return typeof locale === 'string' && locale.toLowerCase().startsWith('ne');
}

function translateValue(value, targetLocale = 'en') {
  if (value === null || value === undefined || !targetLocale) return value;
  const locale = String(targetLocale).toLowerCase();
  if (!isNepaliLocale(locale)) return value;
  const key = String(value).trim().toLowerCase();
  return LOCAL_TRANSLATIONS.ne[key] || value;
}

function translateSummaryFields(summary = {}, locale = 'en') {
  if (!summary || typeof summary !== 'object') return summary;

  const translated = { ...summary };

  if (translated.student && typeof translated.student === 'object') {
    translated.student = {
      ...translated.student,
      locationTypeLabel: translateValue(translated.student.locationType, locale)
    };
  }

  translated.phaseLabel = translateValue(translated.phase, locale);

  if (translated.monthly && typeof translated.monthly === 'object') {
    translated.monthly = {
      ...translated.monthly,
      highestEmissionCategoryLabel: translateValue(translated.monthly.highestEmissionCategory, locale)
    };
  }

  return translated;
}

module.exports = {
  isNepaliLocale,
  translateValue,
  translateSummaryFields
};
