import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ne'],
  defaultLocale: 'en',
  localePrefix: 'never', // Don't use locale prefixes in URL
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
