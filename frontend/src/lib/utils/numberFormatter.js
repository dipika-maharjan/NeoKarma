"use client";

import { useLocale } from "next-intl";

export function useNumberFormatter() {
  const locale = useLocale();

  return (value, options = {}) => {
    // Guard against non-number values
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return '--';
    
    // Always use English digits (en-US) for consistency
    const formattedNumber = new Intl.NumberFormat('en-US', options).format(num);
    return formattedNumber;
  };
}

export default useNumberFormatter;
