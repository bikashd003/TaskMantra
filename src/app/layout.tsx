import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Inter, Outfit } from "next/font/google";
import Providers from "@/components/Providers/query-provider";
import { NextUiProviders } from "@/context/HeroUiProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ClientProviders from "@/context/ClientProviders";
import { PostHogProvider } from "@/components/Providers/PostHogProvider";
import { NotificationProvider } from "@/components/Providers/NotificationProvider";

const inter = Inter({ subsets: ["latin"] });

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskMantra",
  description:
    "TaskMantra is a project management tool that helps you manage your projects.",
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
          <PostHogProvider>
            <NextUiProviders>
              <Providers>
                <NotificationProvider>
                  <main>{children}</main>
                  <Toaster />
                  <Sonner richColors />
                </NotificationProvider>
              </Providers>
            </NextUiProviders>
          </PostHogProvider>
        </body>
      </ClientProviders>
    </html>
  );
}
