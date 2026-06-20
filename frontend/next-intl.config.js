import { getRequestConfig } from 'next-intl/server';

// Statically import messages to ensure they're bundled
import en from './messages/en.json' assert { type: 'json' };
import ne from './messages/ne.json' assert { type: 'json' };

const messages = {
  en,
  ne,
};

export default getRequestConfig(async ({ locale: requestLocale }) => {
  const supportedLocales = ['en', 'ne'];
  let locale = requestLocale;

  // Validate that the requested locale is supported
  if (!locale || !supportedLocales.includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: messages[locale] || messages['en'],
  };
});