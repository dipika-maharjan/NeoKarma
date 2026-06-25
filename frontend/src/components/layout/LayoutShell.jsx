'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_PREFIXES = [
  '/',
  '/login',
  '/register',
  '/share',
  '/about',
  '/curriculum',
  '/sustainability',
  '/contact',
  '/support',
  '/terms',
  '/forgot-password',
  '/reset-password'
];

const LayoutShell = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const normalizedPathname = pathname.replace(/^\/(en|ne)(?=\/|$)/, '') || '/';

  const isLandingRoute = normalizedPathname === '/';
  const isAuthRoute =
    normalizedPathname === '/login' ||
    normalizedPathname === '/register' ||
    normalizedPathname === '/forgot-password' ||
    normalizedPathname === '/reset-password';
  const isPublicRoute = PUBLIC_PREFIXES.some(
    (prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(prefix + '/')
  );
  const isAdminRoute = normalizedPathname.startsWith('/admin');
  const isProtectedRoute = !isPublicRoute && !isAdminRoute;

  useEffect(() => {
    if (isProtectedRoute && !loading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isProtectedRoute, loading, isAuthenticated, router]);

  if (isLandingRoute || isAdminRoute || isAuthRoute) {
    return <>{children}</>;
  }

  if (isProtectedRoute && !loading && !isAuthenticated) {
    return null;
  }

  return (
    <>
      {isProtectedRoute || isAuthenticated ? <Navbar /> : <LandingNavbar />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default LayoutShell;
