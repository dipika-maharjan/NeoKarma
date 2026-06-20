import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Prefer cookie-based locale detection in App Router.
  let locale;
  try {
    const cookieStore = cookies();
    const localeCookie = cookieStore.get('locale');
    if (localeCookie && localeCookie.value) {
      locale = localeCookie.value;
    }
  } catch (e) {
    // ignore
  }

  if (!locale) locale = 'en';

  let messages = {};
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (err) {
    console.warn('Missing messages for locale', locale, err.message);
  }

  return { locale, messages };
});
