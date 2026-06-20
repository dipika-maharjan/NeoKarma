import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ne'],
  defaultLocale: 'en',
  pathPrefix: '', // No path prefix - locale in domain or detection
  localePrefix: 'as-needed',
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
