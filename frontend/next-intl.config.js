import { getRequestConfig } from 'next-intl/server';
import { routing } from './src/i18n/routing';

export default getRequestConfig(async ({ locale: requestLocale }) => {
  let locale = requestLocale;

  // Validate that the requested locale is supported
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  // Use dynamic import to load messages
  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return {
      locale,
      messages,
    };
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`, error);
    // Return empty messages object as fallback
    return {
      locale,
      messages: {},
    };
  }
});