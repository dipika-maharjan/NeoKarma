'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_PREFIXES = ['/', '/login', '/register', '/share'];

const LayoutShell = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const isLandingRoute = pathname === '/';
  const isPublicRoute = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = !isPublicRoute && !isAdminRoute;

  useEffect(() => {
    if (isProtectedRoute && !isAuthenticated) {
      router.replace('/');
    }
  }, [isProtectedRoute, isAuthenticated, router]);

  if (isLandingRoute || isAdminRoute) {
    return <>{children}</>;
  }

  if (isProtectedRoute && !isAuthenticated) {
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
