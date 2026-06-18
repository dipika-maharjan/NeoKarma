import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

export async function getI18nConfig() {
  // Prefer cookie-based locale detection in App Router.
  let locale = undefined;
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale');
    if (localeCookie && localeCookie.value) locale = localeCookie.value;
  } catch (e) {
    // ignore
  }

  if (!locale) locale = 'en';

  const messagesPath = path.resolve(process.cwd(), 'messages', `${locale}.json`);
  let messages = {};
  try {
    const raw = await fs.promises.readFile(messagesPath, 'utf-8');
    messages = JSON.parse(raw);
  } catch (err) {
    console.warn('Missing messages for locale', locale, err.message);
  }

  return { locale, messages };
}
