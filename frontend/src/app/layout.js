import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "@/components/layout/LayoutShell";
import OfflineSyncProvider from '@/components/OfflineSyncProvider';
import OfflineBanner from '@/components/OfflineBanner';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

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
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA]" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <OfflineSyncProvider>
              <LayoutShell>
                <OfflineBanner />
                {children}
              </LayoutShell>
            </OfflineSyncProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
