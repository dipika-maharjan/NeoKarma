import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const baseConfig = {
  rewrites: async () => {
    // Determine backend URL based on environment
    const backendUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : (process.env.BACKEND_URL || 'http://localhost:5000'); // Falls back to localhost if BACKEND_URL not set

    return {
      beforeFiles: [
        {
          source: '/api/:path((?!cron\\b).*)',
          destination: `${backendUrl}/api/:path*`
        }
      ]
    };
  }
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Precache critical routes so they are available offline after first online visit
  additionalManifestEntries: [
    { url: '/dashboard', revision: null },
    { url: '/calculator', revision: null },
    { url: '/carbon-mirror', revision: null },
    { url: '/plan', revision: null },
    { url: '/score', revision: null }
  ],
  runtimeCaching: [
    // Auth recovery routes — NetworkOnly (never cache or intercept for offline/PWA shell)
    {
      urlPattern: /^https?:\/\/[^/]+\/(forgot-password|reset-password)(\/.*)?$/,
      handler: 'NetworkOnly',
    },
    // API endpoints — NetworkFirst so data is always fresh when online
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 10,
      },
    },
    // Page navigation — NetworkFirst with cache fallback
    // This is what allows offline navigation between pages
    {
      urlPattern: /^https?:\/\/[^/]+\/(dashboard|calculator|carbon-mirror)(\/.*)?$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 5,
      },
    },
    // Static assets (JS, CSS, images) — StaleWhileRevalidate
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    // Catch-all for everything else
    {
      urlPattern: /.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 10,
      },
    },
  ],
})(baseConfig);

export default withNextIntl(pwaConfig);
