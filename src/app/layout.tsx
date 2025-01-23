import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Inter, Outfit } from "next/font/google";
import Providers from "@/components/Providers/query-provider";
import { NextUiProviders } from "@/context/HeroUiProvider";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] });

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TaskMantra",
  description: "TaskMantra is a project management tool that helps you manage your projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${outfit.variable} antialiased`}

      >
        <NextUiProviders>
          <Providers>
            <main className="dark text-foreground bg-background">
              {children}
            </main>
            <Toaster />
          </Providers>
        </NextUiProviders>
      </body>
    </html>
  );
}