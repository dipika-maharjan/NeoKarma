import path from 'path';
import { fileURLToPath } from 'url';
import nextIntl from 'next-intl/plugin';
import withPWA from 'next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const baseConfig = {
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*'
        }
      ]
    };
  },
  turbopack: {
    root: __dirname
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
    {
      urlPattern: /^https?:\/\/.*\/api\/emission-factors/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'emission-factors-cache',
        expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/logs/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'logs-cache',
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/dashboard/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dashboard-cache',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
    {
      urlPattern: /.*/,
      handler: 'NetworkFirst',
      options: { cacheName: 'app-shell-cache' },
    },
  ],
})(baseConfig);

const nextConfig = nextIntl('./next-intl.config.js')(pwaConfig);

export default nextConfig;