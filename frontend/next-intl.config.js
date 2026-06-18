/** @type {import('next-intl').NextIntlConfig} */
export default function getConfig(params) {
  // Return a simple runtime config with a locale. For now we return a
  // safe default; later this can read params.requestLocale or cookies.
  return {
    locale: 'en'
  };
}
