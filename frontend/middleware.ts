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
  if (i18nResponse) {
    return i18nResponse;
  }

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;
  const path = req.nextUrl.pathname;

  // Handle auth redirects
  if (!token && !PUBLIC.includes(path)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (token && (path === '/login' || path === '/')) {
    const dest = role === 'school_admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (path.startsWith('/admin') && role !== 'school_admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/dashboard') && role === 'school_admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
};
