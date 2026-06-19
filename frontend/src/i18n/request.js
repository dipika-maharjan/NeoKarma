import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  let locale = 'en';

  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale');
    if (localeCookie?.value) {
      locale = localeCookie.value;
    }
  } catch (e) {
    // Fall back to the default locale when cookies are unavailable.
  }

  const messagesPath = path.resolve(process.cwd(), 'messages', `${locale}.json`);
  let messages = {};

  try {
    const raw = await fs.promises.readFile(messagesPath, 'utf-8');
    messages = JSON.parse(raw);
  } catch (err) {
    console.warn('Missing messages for locale', locale, err?.message || err);
  }

  return {
    locale,
    messages
  };
});
