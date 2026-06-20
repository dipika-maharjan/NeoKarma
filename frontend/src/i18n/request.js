import { getRequestConfig } from 'next-intl/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cookies } from 'next/headers';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

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

  const messagesPath = path.resolve(currentDir, '..', '..', 'messages', `${locale}.json`);
  let messages = {};
  try {
    const raw = await fs.promises.readFile(messagesPath, 'utf-8');
    messages = JSON.parse(raw);
  } catch (err) {
    console.warn('Missing messages for locale', locale, err.message);
  }

  return { locale, messages };
});
