"use client";
import React from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';

export default function dashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 min-w-0 overflow-hidden">
                <Header />

                <main className="overflow-hidden h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>
        </div>
    );
}

