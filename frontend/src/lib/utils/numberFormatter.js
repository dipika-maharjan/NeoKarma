"use client";

import { useLocale } from "next-intl";

export function useNumberFormatter() {
  const locale = useLocale();

  return (value, options = {}) => {
    const localeCode = locale === 'ne' || locale === 'np' ? 'ne-NP' : 'en-US';
    // Guard against non-number values
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return '--';
    return new Intl.NumberFormat(localeCode, options).format(num);
  };
}

export default useNumberFormatter;
