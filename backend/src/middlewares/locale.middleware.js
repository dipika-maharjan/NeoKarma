/**
 * Reads the locale cookie from the request and attaches it to req.locale
 * Falls back to 'en' if not present.
 * Supported locales: 'en', 'ne' (Nepali)
 */
function localeMiddleware(req, res, next) {
  const cookieLocale = req.cookies?.locale;
  const supported = ['en', 'ne', 'np'];
  // normalize 'np' to 'ne'
  if (cookieLocale === 'np') {
    req.locale = 'ne';
  } else if (supported.includes(cookieLocale)) {
    req.locale = cookieLocale;
  } else {
    req.locale = 'en';
  }
  next();
}

module.exports = localeMiddleware;
