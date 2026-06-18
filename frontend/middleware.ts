import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = ['/', '/login', '/register'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;
  const path = req.nextUrl.pathname;

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
};
