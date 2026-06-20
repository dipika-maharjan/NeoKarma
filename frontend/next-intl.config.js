import { getRequestConfig } from 'next-intl/server';
import { routing } from './src/i18n/routing';
import en from './messages/en.json';
import ne from './messages/ne.json';

const messages = { en, ne };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = requestLocale;

  // Validate that the requested locale is supported
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale],
  };
});