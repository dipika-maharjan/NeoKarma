import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This is typically used to determine the locale, but we already
  // have it from the middleware, so this returns it as-is
  let locale = requestLocale;

  // Validate that the requested locale is supported
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});