import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const PROTECTED_PREFIXES = [
  '/admin',
  '/dashboard',
  '/calculator',
  '/carbon-mirror',
  '/plan',
  '/result',
  '/score',
  '/share',
  '/profile'
];

const isProtectedRoute = (path: string) =>
  PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

// Create i18n middleware from next-intl - let it handle locale detection
const handleI18n = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Let next-intl handle the response first
  const response = handleI18n(req);

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;

  // Detect locale from cookie, headers, or default to 'en'
  let locale = 'en';
  const localeCookie = req.cookies.get('locale');
  if (localeCookie?.value) {
    locale = localeCookie.value;
  } else if (req.headers.get('accept-language')?.startsWith('ne')) {
    locale = 'ne';
  }

  // Set locale cookie so server components can read it
  if (!localeCookie || localeCookie.value !== locale) {
    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  // Handle auth redirects
  if (!token && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && (pathname === '/login' || pathname === '/register' || pathname === '/' || pathname === '/forgot-password' || pathname === '/reset-password')) {
    const dest = role === 'school_admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (pathname.startsWith('/admin') && role !== 'school_admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (pathname.startsWith('/dashboard') && role === 'school_admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except static files and API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
