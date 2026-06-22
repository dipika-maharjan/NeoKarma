import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import enMessages from '../../messages/en.json';
import neMessages from '../../messages/ne.json';

const messages = {
  en: enMessages,
  ne: neMessages,
};
const defaultLocale = 'en';

async function getLocaleFromCookies() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore?.get?.('locale');
  return localeCookie?.value;
}

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const selectedLocale = locale ?? (await requestLocale) ?? await getLocaleFromCookies() ?? defaultLocale;
  return {
    locale: selectedLocale,
    messages: messages[selectedLocale] ?? {},
  };
});
