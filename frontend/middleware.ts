import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const PUBLIC = ['/', '/login', '/register'];

// Create i18n middleware from next-intl
const handleI18nRouting = createMiddleware(routing);

export function middleware(req: NextRequest) {
  // Apply i18n middleware first
  const i18nResponse = handleI18nRouting(req);
  
  // Extract locale from pathname or accept-language header
  let locale = 'en';
  const pathname = req.nextUrl.pathname;
  
  // Check if pathname starts with a locale
  for (const loc of routing.locales) {
    if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
      locale = loc;
      break;
    }
  }
  
  // If no locale in path, try accept-language header
  if (locale === 'en') {
    const acceptLanguage = req.headers.get('accept-language');
    if (acceptLanguage?.startsWith('ne')) {
      locale = 'ne';
    }
  }

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;
  const path = req.nextUrl.pathname;

  // Create response from i18n middleware
  const response = i18nResponse ? i18nResponse : NextResponse.next();
  
  // Set locale cookie for server components to use
  response.cookies.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  // Handle auth redirects
  if (!token && !PUBLIC.includes(path)) {
    const redirectResponse = NextResponse.redirect(new URL('/', req.url));
    redirectResponse.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return redirectResponse;
  }

  if (token && (path === '/login' || path === '/')) {
    const dest = role === 'school_admin' ? '/admin/dashboard' : '/dashboard';
    const redirectResponse = NextResponse.redirect(new URL(dest, req.url));
    redirectResponse.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return redirectResponse;
  }

  if (path.startsWith('/admin') && role !== 'school_admin') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
    redirectResponse.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return redirectResponse;
  }

  if (path.startsWith('/dashboard') && role === 'school_admin') {
    const redirectResponse = NextResponse.redirect(new URL('/admin/dashboard', req.url));
    redirectResponse.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
