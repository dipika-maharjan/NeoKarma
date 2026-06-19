import path from 'path';
import { fileURLToPath } from 'url';
import nextIntl from 'next-intl/plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = nextIntl({
  requestConfig: './src/i18n/request.js'
})({
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
  }
);

export default nextConfig;