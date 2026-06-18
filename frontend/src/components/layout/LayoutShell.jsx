'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LANDING_ROUTES = ['/', '/login', '/register'];

const LayoutShell = ({ children }) => {
  const pathname = usePathname();
  
  // Landing page, login, register, and admin pages manage their own layout
  const isLandingRoute = LANDING_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith('/admin');

  if (isLandingRoute || isAdminRoute) {
    return <>{children}</>;
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
