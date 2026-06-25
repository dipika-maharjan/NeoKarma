import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "@/components/layout/LayoutShell";
import OfflineSyncProvider from '@/components/OfflineSyncProvider';
import OfflineBanner from '@/components/OfflineBanner';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/ToastContainer';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { SWRProvider } from '@/context/SWRProvider';

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Neoकर्म - Carbon Footprint Tracker",
  description: "Track your carbon footprint and learn sustainable habits. Made for Nepalese students.",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${newsreader.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA]" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <OfflineSyncProvider>
              <NotificationProvider>
               <ToastProvider>
                 <SWRProvider>
                   <LayoutShell>
                     <OfflineBanner />
                     <ToastContainer />
                     {children}
                   </LayoutShell>
                 </SWRProvider>
               </ToastProvider>
              </NotificationProvider>
            </OfflineSyncProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
