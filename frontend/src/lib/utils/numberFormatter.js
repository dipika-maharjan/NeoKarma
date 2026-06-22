"use client";

import { useLocale } from "next-intl";
import { convertDigits } from "./digitTranslator";

export function useNumberFormatter() {
  const locale = useLocale();

  return (value, options = {}) => {
    const localeCode = locale === 'ne' || locale === 'np' ? 'ne-NP' : 'en-US';
    // Guard against non-number values
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return '--';
    
    const formattedNumber = new Intl.NumberFormat(localeCode, options).format(num);
    
    // Convert digits to appropriate locale
    return convertDigits(formattedNumber, locale);
  };
}

export default useNumberFormatter;
