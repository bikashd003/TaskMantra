"use client";
import React, { useState } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-30 px-4">
                <div className="h-full flex items-center">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>
            <Sidebar
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
            />
            <div className="flex-1 min-w-0 overflow-hidden md:ml-0 ml-auto transition-all duration-300 ">
                <Header />

                <main className="overflow-y-auto h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>
        </div>
    );
}

