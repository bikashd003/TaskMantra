import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import Providers from '@/components/Providers/query-provider';
import { NextUiProviders } from '@/context/HeroUiProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import ClientProviders from '@/context/ClientProviders';
import { PostHogProvider } from '@/components/Providers/PostHogProvider';
import { NotificationProvider } from '@/components/Providers/NotificationProvider';
import { ThemeProvider } from '@/components/Providers/ThemeProvider';
import { ThemeSyncProvider } from '@/components/Providers/ThemeSyncProvider';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskMantra',
  description: 'TaskMantra is a project management tool that helps you manage your projects.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClientProviders>
        <body
          className={`${inter.className} ${outfit.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeSyncProvider>
              <PostHogProvider>
                <NextUiProviders>
                  <Providers>
                    <NotificationProvider>
                      <main>
                        {children}
                        <Analytics />
                      </main>
                      <Toaster />
                      <Sonner richColors />
                    </NotificationProvider>
                  </Providers>
                </NextUiProviders>
              </PostHogProvider>
            </ThemeSyncProvider>
          </ThemeProvider>
        </body>
      </ClientProviders>
    </html>
  );
}
