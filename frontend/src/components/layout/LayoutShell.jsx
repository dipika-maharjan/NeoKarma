'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_PREFIXES = ['/', '/login', '/register', '/share', '/forgot-password', '/reset-password'];

const LayoutShell = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const isLandingRoute = pathname === '/';
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const isPublicRoute = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
  const isAdminRoute = pathname.startsWith('/admin');
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
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default LayoutShell;
